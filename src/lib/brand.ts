// כל נתוני המיתוג של אקו מדיה במקום אחד
export const BRAND = {
  nameHe: 'אקו מדיה',
  nameEn: 'Eco Media',
  siteUrl: 'https://www.ecomedia.co.il',
  siteDisplay: 'ecomedia.co.il',
  // הכתובת הרשמית של Prompt & Play (שיתופים, קישורים קבועים)
  appUrl: 'https://www.promptandplay.co.il',
  phoneDisplay: '053-426-2621',
  phoneIntl: '972534262621',
  banner: 'מיזם קהילתי לקידום עסקים ב-AI מבית אקו מדיה (Eco Media)',
  heroCallout:
    'התרשמתם מחוויית ה-5D? אקו מדיה מפתחת אתרי תלת-ממד וסרטוני AI לעסקים שרוצים להוביל',
  defaultWaMessage:
    'היי יצחק, הגעתי דרך אפליקציית Prompt & Play ואשמח לשמוע על פיתוח אתר 5D או בוט AI לעסק שלי.',
  watermark:
    '// הונגש באהבה לקהילה ע"י אקו מדיה | לייעוץ ופיתוח פתרונות AI: 053-426-2621',
} as const

export function waLink(message: string = BRAND.defaultWaMessage) {
  return `https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent(message)}`
}

export function withWatermark(prompt: string) {
  return `${prompt.trim()}\n\n${BRAND.watermark}`
}
