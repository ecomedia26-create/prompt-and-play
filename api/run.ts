import { aiEnabled, client, json, MODEL, publicSkills, rateLimited, WATERMARK } from './_shared.js'

// "נסו עכשיו": מריץ סקיל מהכספת על הטקסט של הגולש ומזרים את התשובה.
// הפרומפט נלקח רק מהקטלוג בשרת (לא מהדפדפן), כך שהנקודה לא יכולה לשמש פרוקסי כללי ל-AI.

export async function POST(req: Request) {
  if (!aiEnabled()) return json({ error: 'ai_disabled' }, 503)
  if (rateLimited(req, 8)) return json({ error: 'rate_limited' }, 429)

  let skillId = ''
  let input = ''
  try {
    const body = (await req.json()) as { skill_id?: string; input?: string }
    skillId = String(body.skill_id ?? '')
    input = String(body.input ?? '').trim().slice(0, 4000)
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const skill = publicSkills().find((s) => s.id === skillId)
  if (!skill || !input) return json({ error: 'bad_request' }, 400)

  const stream = client().beta.messages.stream({
    model: MODEL,
    max_tokens: 6000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium' },
    system: `${skill.system_prompt}\n\nThe user is an Israeli business owner. Reply in Hebrew unless they write in another language. Keep it practical and ready to use.`,
    messages: [{ role: 'user', content: input }],
  })

  const enc = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      stream.on('text', (t) => controller.enqueue(enc.encode(t)))
      try {
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') controller.enqueue(enc.encode('\n\nעל הבקשה הזו לא ניתן לענות. נסו לנסח אחרת.'))
        controller.enqueue(enc.encode(`\n\n${WATERMARK}`))
      } catch (err) {
        console.error('run error', err)
        controller.enqueue(enc.encode('\n\n[שגיאה זמנית. נסו שוב בעוד רגע, או פתחו את הסקיל ב-Claude.]'))
      }
      controller.close()
    },
    cancel() {
      stream.abort()
    },
  })
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } })
}
