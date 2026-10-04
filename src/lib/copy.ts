export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // גיבוי לדפדפנים ישנים / הקשר לא מאובטח
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export const claudeUrl = (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
export const chatgptUrl = (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
