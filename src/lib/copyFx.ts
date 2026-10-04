// "רגע ההעתקה": כל כפתור העתקה משגר אירוע, ושכבת האנימציה מעיפה מטוס נייר מהנקודה הזו לשמיים
const EVENT = 'pp:copied'

export function celebrateCopy(from: Element | null) {
  const r = from?.getBoundingClientRect()
  const detail = r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  window.dispatchEvent(new CustomEvent(EVENT, { detail }))
}

export function onCopied(handler: (p: { x: number; y: number }) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<{ x: number; y: number }>).detail)
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}
