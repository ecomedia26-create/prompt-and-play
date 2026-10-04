# Prompt & Play · מבית אקו מדיה (Eco Media)

מיזם קהילתי חינמי: ספריית 30 סקילים ובוטים של AI לעסקים בישראל, שהיא גם הדגמה חיה (Live Showcase) של יכולות ה-5D של אקו מדיה.

**סטאק:** Vite + React + TypeScript, Tailwind CSS, Three.js, Framer Motion, Lucide. ללא שרת אחורי, מוכן לפריסה חינמית ב-Vercel.

## הרצה מקומית
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # בדיקת טיפוסים + בילד ל-dist/
```

## פריסה ל-Vercel
1. דחפו את התיקייה למאגר GitHub חדש.
2. ב-Vercel: Add New → Project → בחרו את המאגר. Vercel מזהה Vite אוטומטית (`vercel.json` כבר מוגדר).

## מבנה
| קובץ | תפקיד |
|---|---|
| `src/lib/brand.ts` | טלפון, קישור וואטסאפ, באנר, קולאאוט ו-Watermark. כל המיתוג במקום אחד |
| `src/data/public_skills_data.json` | קטלוג הסקילים (מהדרייב). להחלפת תוכן מחליפים רק את הקובץ הזה |
| `src/data/skills.ts` | טיפוסים, קטגוריות, וסימון קטגוריית ה-5D כנכס בלעדי (נעולה להעתקה) |
| `src/components/ParticleField.tsx` | קנבס Three.js עם שיידר חלקיקים "הד" המגיב לעכבר |
| `src/components/Vault.tsx`, `SkillCard.tsx`, `SkillModal.tsx` | גריד Bento, הטיית 3D, חיפוש, מודאל העתקה עם Watermark |
| `src/components/WhatsAppSimulator.tsx` | סימולטור שיחת בוט בוואטסאפ (3 תרחישים) |
| `src/components/AgencyCTA.tsx` | סקשן שירותי הסוכנות ותיבת הניאון |

## ביצועים במובייל
במסכי מגע (`pointer: coarse`) מבוטלים מעקב העכבר וה-Tilt, מספר החלקיקים יורד ל-3,500 ו-pixelRatio מוגבל ל-1.5. הקנבס עוצר רינדור כשהוא מחוץ למסך, ונטען ב-lazy בצ'אנק נפרד. `prefers-reduced-motion` מכבה את הקנבס והאנימציות.
