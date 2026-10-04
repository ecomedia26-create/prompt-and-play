export type LegalDoc = 'privacy' | 'terms'

// פתיחת מדיניות הפרטיות או תנאי השימוש מכל מקום באתר
export const openLegal = (doc: LegalDoc) => window.dispatchEvent(new CustomEvent<LegalDoc>('pp:legal', { detail: doc }))

// קישור ישיר: /#privacy או /#terms
export const legalFromHash = (): LegalDoc | null => {
  const hash = window.location.hash.slice(1)
  return hash === 'privacy' || hash === 'terms' ? hash : null
}
