import { rateLimited } from './_shared.js'
import { apiName, cardcom, parseReturnValue, PRODUCTS } from './_pay.js'

// Cardcom קוראת לכתובת הזו אחרי כל תשלום בדף שנוצר ב-/api/go (WebHookUrl).
// לא סומכים על מה שנשלח אלינו: בודקים את העסקה מול Cardcom (GetLpResult), ורק תשלום שעבר נרשם
// בטבלה crm_payments ב-Supabase. משם החדר של אקו מדיה מסמן "שולם" וסופר עמלה לסוכן.
// המפתח SUPABASE_SERVICE_ROLE_KEY מוגדר רק ב-Vercel; לטבלה אין גישה ציבורית (RLS בלי מדיניות).

const SUPABASE = 'https://ihjrawbfqsbsnkhbamdd.supabase.co'

interface LpResult {
  ResponseCode?: number
  Description?: string
  LowProfileId?: string
  ReturnValue?: string
  TranzactionId?: number | string
  UIValues?: { CardOwnerName?: string }
  DocumentInfo?: { DocumentNumber?: number | string }
  TranzactionInfo?: { ResponseCode?: number; TranzactionId?: number | string; Amount?: number; CardOwnerName?: string }
}

const ok = () => new Response('ok', { headers: { 'cache-control': 'no-store' } })

async function fields(req: Request) {
  const url = new URL(req.url)
  const raw = req.method === 'POST' ? (await req.text().catch(() => '')).slice(0, 8000) : ''
  let out: Record<string, unknown> = Object.fromEntries(url.searchParams)
  try {
    out = { ...out, ...(JSON.parse(raw) as Record<string, unknown>) }
  } catch {
    out = { ...out, ...Object.fromEntries(new URLSearchParams(raw)) }
  }
  return out
}

// תשלום רגיל עבר רק אם גם הבקשה וגם העסקה עצמה החזירו 0, ויש מספר עסקה
const isPaid = (r: LpResult) =>
  r.ResponseCode === 0 &&
  (r.TranzactionInfo?.ResponseCode ?? 0) === 0 &&
  (r.TranzactionId ?? r.TranzactionInfo?.TranzactionId) != null

async function save(row: Record<string, unknown>) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return console.warn('crm_payments: SUPABASE_SERVICE_ROLE_KEY missing, payment only logged')
  // מפתח סודי חדש (sb_secret_) עובר רק ב-apikey; מפתח service_role ישן (JWT) גם ב-Authorization
  const headers: Record<string, string> = {
    apikey: key,
    'content-type': 'application/json',
    prefer: 'resolution=merge-duplicates,return=minimal',
  }
  if (key.startsWith('eyJ')) headers.authorization = `Bearer ${key}`
  const res = await fetch(`${SUPABASE}/rest/v1/crm_payments?on_conflict=lowprofile_id`, {
    method: 'POST',
    headers,
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) console.error('crm_payments save failed', res.status, (await res.text().catch(() => '')).slice(0, 300))
}

async function handle(req: Request) {
  if (rateLimited(req, 60)) return ok()
  const f = await fields(req)
  const id = String(f.LowProfileId ?? f.lowProfileId ?? '').replace(/[^\w-]/g, '').slice(0, 64)
  if (!id || !apiName()) {
    console.log('cardcom webhook without lookup', { id, configured: !!apiName() })
    return ok()
  }

  let r: LpResult
  try {
    r = await cardcom<LpResult>('GetLpResult', { LowProfileId: id })
  } catch (err) {
    console.error('cardcom GetLpResult error', id, err)
    return new Response('retry', { status: 502 })
  }
  const rv = parseReturnValue(r.ReturnValue)
  const paid = isPaid(r)
  console.log('cardcom webhook', { id, paid, code: r.ResponseCode, tx: r.TranzactionInfo?.ResponseCode, ...rv })
  if (!paid) return ok()

  try {
    await save({
      lowprofile_id: id,
      return_value: String(r.ReturnValue ?? '').slice(0, 250),
      agent_code: rv.agent || null,
      lead_id: rv.lead || null,
      product: rv.product || null,
      amount: r.TranzactionInfo?.Amount ?? (rv.product ? PRODUCTS[rv.product]?.price : null) ?? null,
      payer_name: String(r.TranzactionInfo?.CardOwnerName ?? r.UIValues?.CardOwnerName ?? '').slice(0, 80) || null,
      document_number: r.DocumentInfo?.DocumentNumber != null ? String(r.DocumentInfo.DocumentNumber) : null,
      paid_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('crm_payments save error', id, err)
  }
  return ok()
}

export const GET = handle
export const POST = handle
