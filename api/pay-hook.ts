// Cardcom קוראת לכתובת הזו אחרי כל תשלום בדף שנוצר ב-/api/pay (WebHookUrl, חובה ב-API).
// כרגע רק רושמים ביומן של Vercel את מזהה הדף ומספר ההצעה; התשלום עצמו והקבלה נמצאים בממשק של Cardcom.

async function log(req: Request) {
  const url = new URL(req.url)
  const raw = req.method === 'POST' ? (await req.text().catch(() => '')).slice(0, 4000) : ''
  let fields: Record<string, unknown> = Object.fromEntries(url.searchParams)
  try {
    fields = { ...fields, ...(JSON.parse(raw) as Record<string, unknown>) }
  } catch {
    fields = { ...fields, ...Object.fromEntries(new URLSearchParams(raw)) }
  }
  const pick = (k: string) => String(fields[k] ?? '').slice(0, 64)
  console.log('cardcom webhook', { lowProfileId: pick('LowProfileId'), offer: pick('ReturnValue'), code: pick('ResponseCode') })
  return new Response('ok', { headers: { 'cache-control': 'no-store' } })
}

export const GET = log
export const POST = log
