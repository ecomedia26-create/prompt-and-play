# Prompt & Play · מבית אקו מדיה (Eco Media)

מיזם קהילתי חינמי: ספריית 30 סקילים ובוטים של AI לעסקים בישראל, שהיא גם הדגמה חיה (Live Showcase) של יכולות ה-5D של אקו מדיה.

כתובת האתר: https://play.ecomedia.co.il (ובנוסף https://prompt-and-play-sepia.vercel.app).

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
| `src/components/CloudSky.tsx` | רקע שמיים תלת-ממדי: עננים בריימרצ'ינג בשיידר Three.js, הגלילה מעיפה את הגולש מעל העננים |
| `src/components/AngelDust.tsx` | שובל אבק כוכבים שעוקב אחרי העכבר (דסקטופ בלבד) |
| `src/lib/sound.tsx` | פסקול אמביינט גנרטיבי ב-Web Audio (מסונתז בדפדפן, בלי קבצי אודיו ובלי צורך ברישיון) |
| `src/components/Vault.tsx`, `SkillCard.tsx`, `SkillModal.tsx` | גריד Bento, הטיית 3D, חיפוש, מודאל העתקה עם Watermark |
| `src/components/WhatsAppSimulator.tsx` | סימולטור שיחת בוט בוואטסאפ (3 תרחישים) |
| `src/components/AgencyCTA.tsx` | סקשן שירותי הסוכנות ותיבת הניאון |

## ביצועים במובייל
במסכי מגע (`pointer: coarse`) מבוטלים מעקב העכבר וה-Tilt, השמיים מרונדרים ברזולוציה נמוכה יותר, בפחות צעדים ובקצב של 30 פריימים, ושובל האבק כבוי. `prefers-reduced-motion` מכבה את הקנבס והאנימציות.

## עוזר AI ו"נסו עכשיו"

- `api/assistant.ts` ו-`api/run.ts` הן פונקציות שרת של Vercel שקוראות ל-Claude (המודל `claude-opus-5-5`).
- הן פעילות רק כשמוגדר משתנה הסביבה `ANTHROPIC_API_KEY` בהגדרות הפרויקט ב-Vercel (Settings → Environment Variables). המפתח נשאר בשרת ולא מגיע לדפדפן. התשלום לפי שימוש.
- בלי מפתח האתר נשאר חינמי לגמרי: העוזר ממליץ על סקילים בהתאמה מקומית בדפדפן (`src/lib/recommend.ts`), ו"נסו עכשיו" פותח את Claude.ai עם הסקיל והטקסט של הגולש.
- יש הגבלת קצב בסיסית לכל IP, וסקילי ה-5D לא נחשפים דרך ה-API.
