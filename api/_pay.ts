// קישורי התשלום של אקו מדיה (סוכנים ומנהלים): קטלוג, חיבור ל-Cardcom וסימון הסוכן.
// המחיר נקבע רק כאן, בשרת, כך שאי אפשר לשנות אותו מהקישור. מחיר מלא, בלי מקדמה ובלי הנחה (החלטת יצחק, 11.10.2026).
// שם המשתמש ל-API מוגדר רק בהגדרות הפרויקט ב-Vercel (CARDCOM_API_NAME) ולעולם לא נשלח לדפדפן.

export const TERMINAL = 199177 // מסוף אקו מדיה בקארדקום
export const WA = '972534262621'
const CARDCOM = 'https://secure.cardcom.solutions/api/v11/LowProfile/'
const STYLE = 'https://style.ecomedia.co.il/'

export interface Product {
  name: string
  price: number
  // לאן הלקוח עובר אחרי תשלום מוצלח
  done: string
}

// המחירים כמו במחירון באתר. סוכן מוכר לבד רק וידאו ודף נחיתה; את השאר הוא מעביר ליצחק (החדר מחליט מה להציג)
export const PRODUCTS: Record<string, Product> = {
  reel: { name: 'רילס', price: 350, done: `${STYLE}?paid=video&pk=reel` },
  aivideo: { name: 'סרטון AI', price: 500, done: `${STYLE}?paid=video&pk=aivideo` },
  aiad: { name: 'פרסומת AI', price: 500, done: `${STYLE}?paid=video&pk=aiad` },
  filmed: { name: 'הפקת צילום בשטח', price: 1900, done: `${STYLE}?paid=video&pk=filmed` },
  landing: { name: 'דף נחיתה', price: 500, done: `${STYLE}?paid=web&pk=landing` },
  site: { name: 'אתר תדמית', price: 1100, done: `${STYLE}?paid=web&pk=site` },
  makleed: { name: 'מערכת מקליד', price: 3500, done: `${STYLE}?paid=system&pk=makleed` },
  hosting: { name: 'אחסון ודומיין לשנה', price: 490, done: 'https://www.ecomedia.co.il/' },
}

export const apiName = () => process.env.CARDCOM_API_NAME ?? ''

// קוד סוכן (הקוד האישי מהחדר, כמו ב-?r=) ומזהה ליד: רק אותיות, ספרות ומקף
export const code = (v: string | null, max: number) => (v ?? '').replace(/[^\w-]/g, '').slice(0, max)

// ההערה שנשמרת בעסקה בקארדקום וחוזרת אלינו אחרי התשלום: p:<מוצר>|ag:<סוכן>|l:<ליד>
export const returnValue = (product: string, agent: string, lead: string) =>
  [`p:${product}`, agent && `ag:${agent}`, lead && `l:${lead}`].filter(Boolean).join('|')

export function parseReturnValue(rv: string | undefined) {
  const out: { product?: string; agent?: string; lead?: string } = {}
  for (const part of String(rv ?? '').split('|')) {
    const [k, v] = [part.slice(0, part.indexOf(':')), part.slice(part.indexOf(':') + 1)]
    if (k === 'p') out.product = v
    else if (k === 'ag') out.agent = v
    else if (k === 'l') out.lead = v
  }
  return out
}

export const whatsapp = (text: string) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`

export async function cardcom<T>(action: 'Create' | 'GetLpResult', body: Record<string, unknown>): Promise<T> {
  const res = await fetch(CARDCOM + action, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ TerminalNumber: TERMINAL, ApiName: apiName(), ...body }),
    signal: AbortSignal.timeout(20_000),
  })
  return ((await res.json().catch(() => ({}))) ?? {}) as T
}
