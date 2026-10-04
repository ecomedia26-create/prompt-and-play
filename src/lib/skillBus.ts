// פתיחת סקיל מכל מקום באתר (עוזר ה-AI, קישור שיתוף): הכספת מאזינה לאירוע ופותחת את המודאל
const EVENT = 'pp:open-skill'

export function openSkill(id: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: id }))
}

export function onOpenSkill(handler: (id: string) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<string>).detail)
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}
