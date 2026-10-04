import { useSyncExternalStore } from 'react'

// חיפוש משותף: תיבת החיפוש בגיבור והספרייה עובדות על אותו ערך
let query = ''
const subs = new Set<() => void>()

export function setSearch(q: string) {
  query = q
  subs.forEach((f) => f())
}

const subscribe = (cb: () => void) => {
  subs.add(cb)
  return () => {
    subs.delete(cb)
  }
}

export const useSearch = () => useSyncExternalStore(subscribe, () => query)

export function goToLibrary() {
  document.getElementById('library')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
