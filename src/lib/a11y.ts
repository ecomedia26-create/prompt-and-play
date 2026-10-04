import { useSyncExternalStore } from 'react'

// העדפות נגישות של הגולש (נשמרות בדפדפן): עצירת אנימציות, טקסט גדול, ניגודיות גבוהה, הדגשת קישורים
export type A11yKey = 'calm' | 'big' | 'contrast' | 'links'
type State = Record<A11yKey, boolean>

const STORAGE = 'pp-a11y'
const CLASSES: Record<A11yKey, string> = { calm: 'pp-calm', big: 'pp-big', contrast: 'pp-contrast', links: 'pp-links' }

function load(): State {
  const empty = { calm: false, big: false, contrast: false, links: false }
  try {
    return { ...empty, ...JSON.parse(localStorage.getItem(STORAGE) ?? '{}') }
  } catch {
    return empty
  }
}

let state = load()
const subs = new Set<() => void>()

function apply() {
  const html = document.documentElement
  for (const k of Object.keys(CLASSES) as A11yKey[]) html.classList.toggle(CLASSES[k], state[k])
}
if (typeof document !== 'undefined') apply()

export function setA11y(key: A11yKey, on: boolean) {
  state = { ...state, [key]: on }
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state))
  } catch {
    // מצב פרטי: ההעדפה תחזיק עד סגירת הלשונית
  }
  apply()
  subs.forEach((f) => f())
}

export function resetA11y() {
  for (const k of Object.keys(CLASSES) as A11yKey[]) setA11y(k, false)
}

const subscribe = (cb: () => void) => {
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}

export const useA11y = () => useSyncExternalStore(subscribe, () => state)
