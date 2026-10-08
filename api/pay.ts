import { json, rateLimited } from './_shared.js'

// "לינק תשלום" בבונה ההצעות: יוצר דף תשלום של Cardcom (אישורית זהב, LowProfile) בסכום המדויק של ההצעה.
// אחרי תשלום הלקוח עובר לבורד הסגנונות עם מספר ההצעה, וכך נסגר המעגל: הצעה ← תשלום ← בחירת סגנון.
// שם המשתמש ל-API מוגדר רק בהגדרות הפרויקט ב-Vercel (CARDCOM_API_NAME) ולעולם לא נשלח לדפדפן.
// GET מחזיר אם החיבור מוגדר; בלעדיו הבונה כותב ללקוח שהלינק יישלח בנפרד.

const CARDCOM = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create'
const TERMINAL = 199177 // מסוף אקו מדיה בקארדקום
const STYLE = 'https://style.ecomedia.co.il/'
const WA = '972534262621'
const KINDS = new Set(['web', 'video', 'system'])
// הסכומים מגיעים מהבונה; התקרה והרצפה מונעות דפים בסכומים שלא הגיוניים להצעה
const MIN = 50
const MAX = 60_000

const enabled = () => !!process.env.CARDCOM_API_NAME
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

interface PayBody {
  offer?: unknown
  name?: unknown
  phone?: unknown
  kind?: unknown
  mode?: unknown
  items?: unknown
}

interface CreateResponse {
  ResponseCode?: number
  Description?: string
  Url?: string
}

export function GET() {
  return json({ enabled: enabled() })
}

export async function POST(req: Request) {
  const apiName = process.env.CARDCOM_API_NAME
  if (!apiName) return json({ error: 'not_configured' }, 503)
  if (rateLimited(req, 15)) return json({ error: 'rate_limited' }, 429)

  let body: PayBody
  try {
    body = (await req.json()) as PayBody
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const offer = String(body.offer ?? '').replace(/[^\w-]/g, '').slice(0, 40)
  const name = clean(body.name, 80)
  const phone = String(body.phone ?? '').replace(/[^\d]/g, '').slice(0, 15)
  const kind = KINDS.has(String(body.kind)) ? String(body.kind) : ''
  const full = body.mode === 'full'
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 20).map((i: { name?: unknown; price?: unknown }) => ({
    name: clean(i?.name, 120),
    price: Number(i?.price),
  }))
  if (!offer || !items.length || items.some((i) => !i.name || !Number.isFinite(i.price) || i.price <= 0)) {
    return json({ error: 'bad_request' }, 400)
  }
  const total = items.reduce((s, i) => s + i.price, 0)
  // מקדמה = חצי מהסכום, מעוגל לשקל שלם, כמו במחשבון
  const amount = full ? Math.round(total) : Math.round(total / 2)
  if (amount < MIN || amount > MAX) return json({ error: 'amount', min: MIN, max: MAX }, 400)

  const what = `${full ? 'תשלום' : 'מקדמה 50%'} · הצעה ${offer}`
  const desc = clean(`${what} · ${items.map((i) => i.name).join(', ')}`, 200)
  const failText = `היי, ניסיתי לשלם על הצעה ${offer} והתשלום לא עבר`
  const request = {
    TerminalNumber: TERMINAL,
    ApiName: apiName,
    Operation: 'ChargeOnly',
    Amount: amount,
    ISOCoinId: 1,
    Language: 'he',
    ReturnValue: offer,
    ProductName: desc,
    SuccessRedirectUrl: `${STYLE}?paid=${kind}&pk=${encodeURIComponent(offer)}`,
    FailedRedirectUrl: `https://wa.me/${WA}?text=${encodeURIComponent(failText)}`,
    WebHookUrl: `${new URL(req.url).origin}/api/pay-hook`,
    UIDefinition: {
      CardOwnerNameValue: name,
      CardOwnerPhoneValue: phone,
      IsCardOwnerEmailRequired: true,
    },
    // עוסק פטור: קבלה. הבונה לא שואל מייל, אז הלקוח מקליד אותו בדף התשלום והקבלה נשלחת אליו
    Document: {
      DocumentTypeToCreate: 'Receipt',
      Name: name || 'לקוח',
      Mobile: phone,
      IsSendByEmail: true,
      Language: 'he',
      Products: [{ Description: desc, UnitCost: amount, Quantity: 1 }],
    },
  }

  let data: CreateResponse
  try {
    const res = await fetch(CARDCOM, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(20_000),
    })
    data = ((await res.json().catch(() => ({}))) ?? {}) as CreateResponse
  } catch (err) {
    console.error('cardcom create error', err)
    return json({ error: 'cardcom_unreachable' }, 502)
  }
  if (data.ResponseCode !== 0 || !data.Url) {
    console.error('cardcom create failed', data.ResponseCode, data.Description)
    return json({ error: 'cardcom', code: data.ResponseCode ?? null, message: clean(data.Description, 300) }, 502)
  }
  return json({ url: data.Url, amount, full })
}
