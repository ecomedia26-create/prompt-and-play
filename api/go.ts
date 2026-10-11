import { rateLimited } from './_shared.js'
import { apiName, cardcom, code, PRODUCTS, returnValue, whatsapp } from './_pay.js'

// קישור התשלום שהסוכן שולח ללקוח: /pay/<מוצר>?a=<קוד סוכן>&l=<מזהה ליד> (rewrite ב-vercel.json).
// כשהלקוח פותח אותו נוצר דף תשלום של Cardcom (פרופיל נמוך) בסכום המלא של המוצר, והלקוח עובר אליו ישר.
// הסוכן והליד נשמרים בעסקה (ReturnValue), ואחרי התשלום /api/pay-hook רושם את המכירה על שם הסוכן.

// תצוגה מקדימה של וואטסאפ, פייסבוק וכו' פותחת את הקישור בעצמה. לה מחזירים כרטיס יפה, בלי ליצור דף תשלום
const PREVIEW_BOT =
  /bot|crawler|spider|facebookexternalhit|facebookcatalog|whatsapp|telegram|slack|discord|linkedin|skype|embedly|preview|vkshare|pinterest/i

interface CreateResponse {
  ResponseCode?: number
  Description?: string
  Url?: string
}

const redirect = (to: string) => new Response(null, { status: 302, headers: { location: to, 'cache-control': 'no-store' } })

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)

function preview(name: string, price: number) {
  const title = escape(`${name} · ${price.toLocaleString('he-IL')} ₪`)
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>${title} · אקו מדיה</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="תשלום מאובטח לאקו מדיה דרך קארדקום. אשראי, ביט, Apple Pay ו-Google Pay.">
<meta property="og:site_name" content="אקו מדיה">
<meta name="robots" content="noindex, nofollow">
</head><body><p>${title}</p></body></html>`
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = code(url.searchParams.get('product'), 20).toLowerCase()
  const product = PRODUCTS[key]
  if (!product) return redirect('https://www.ecomedia.co.il/')

  const agent = code(url.searchParams.get('a'), 24)
  const lead = code(url.searchParams.get('l'), 40)
  if (PREVIEW_BOT.test(req.headers.get('user-agent') ?? '')) return preview(product.name, product.price)

  const askText = `היי, אשמח לשלם על ${product.name} (${product.price} ₪)${agent ? ` · ${agent}` : ''}`
  // עד שה-API פתוח, או אם קארדקום לא זמינה: הלקוח מגיע אלינו לוואטסאפ עם הבקשה, ולא נתקע
  if (!apiName() || rateLimited(req, 30)) return redirect(whatsapp(askText))

  const desc = `${product.name} · אקו מדיה`
  let data: CreateResponse
  try {
    data = await cardcom<CreateResponse>('Create', {
      Operation: 'ChargeOnly',
      Amount: product.price,
      ISOCoinId: 1,
      Language: 'he',
      ReturnValue: returnValue(key, agent, lead),
      ProductName: desc,
      SuccessRedirectUrl: product.done,
      FailedRedirectUrl: whatsapp(`היי, ניסיתי לשלם על ${product.name} והתשלום לא עבר`),
      WebHookUrl: `${url.origin}/api/pay-hook`,
      UIDefinition: { IsCardOwnerEmailRequired: true, IsCardOwnerPhoneRequired: true },
      // עוסק פטור: קבלה. את השם והמייל הלקוח ממלא בדף התשלום (לבדוק בתשלום הבדיקה שהקבלה יוצאת על שמו)
      Document: {
        DocumentTypeToCreate: 'Receipt',
        Name: 'לקוח',
        IsAllowEditDocument: true,
        IsSendByEmail: true,
        Language: 'he',
        Products: [{ Description: desc, UnitCost: product.price, Quantity: 1 }],
      },
    })
  } catch (err) {
    console.error('cardcom create error', err)
    return redirect(whatsapp(askText))
  }
  if (data.ResponseCode !== 0 || !data.Url) {
    console.error('cardcom create failed', data.ResponseCode, data.Description)
    return redirect(whatsapp(askText))
  }
  return redirect(data.Url)
}

export const HEAD = (req: Request) => {
  const product = PRODUCTS[code(new URL(req.url).searchParams.get('product'), 20).toLowerCase()]
  return product ? preview(product.name, product.price) : redirect('https://www.ecomedia.co.il/')
}
