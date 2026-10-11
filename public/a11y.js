/*
 * תפריט נגישות של אקו מדיה.
 * סקריפט עצמאי (בלי תלויות) כדי שאותו כפתור יופיע בכל דפי האתר:
 * האתר הראשי, בורד הסגנונות (/styles) ומחשבון המחיר (/calculator).
 * הכפתור יושב בצד שמאל באמצע המסך, רחוק מוואטסאפ (שמאל למטה) ומנועה (ימין למטה).
 * ההגדרות נשמרות בדפדפן של הגולש.
 * לאתרי לקוחות: data-statement = כתובת הצהרת הנגישות, data-color = צבע הכפתור,
 * data-text-scale="zoom" לאתר שהגופנים שלו בפיקסלים (אז הגדלת טקסט מגדילה את כל הדף),
 * data-side="right" כשבאמצע הצד השמאלי יש כבר משהו קבוע באתר,
 * data-footer-link כדי להוסיף קישור "הצהרת נגישות" בסוף הפוטר של הדף (או בתחתית הדף אם אין פוטר).
 */
(function () {
  "use strict";
  if (window.__ecoA11y) return;
  window.__ecoA11y = true;

  var me = document.currentScript;
  var STATEMENT = (me && me.getAttribute("data-statement")) || "/accessibility";
  var COLOR = (me && me.getAttribute("data-color")) || "";
  if (!/^#[0-9a-f]{3,8}$/i.test(COLOR)) COLOR = "#1d4ed8";
  var ZOOM = !!me && me.getAttribute("data-text-scale") === "zoom";
  var RIGHT = !!me && me.getAttribute("data-side") === "right";
  var FOOTER_LINK = !!me && me.hasAttribute("data-footer-link");

  var KEY = "eco-a11y";
  var root = document.documentElement;
  var SIZES = [100, 112.5, 125, 140];

  var TOGGLES = [
    { k: "contrast", label: "ניגודיות גבוהה" },
    { k: "mono", label: "גווני אפור" },
    { k: "links", label: "הדגשת קישורים" },
    { k: "font", label: "גופן קריא" },
    { k: "spacing", label: "ריווח טקסט" },
    { k: "still", label: "עצירת אנימציות" },
    { k: "cursor", label: "סמן גדול" },
    { k: "focus", label: "הדגשת פוקוס" },
  ];

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }
  function save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {}
  }

  var state = load();

  function apply() {
    var size = SIZES[state.size || 0] || 100;
    var prop = ZOOM ? "zoom" : "font-size";
    var val = ZOOM ? String(size / 100) : size + "%";
    if (size === 100) root.style.removeProperty(prop);
    else root.style.setProperty(prop, val, "important");
    TOGGLES.forEach(function (t) {
      root.classList.toggle("a11y-" + t.k, !!state[t.k]);
    });
    if (state.still) {
      document.querySelectorAll("video").forEach(function (v) {
        try {
          v.pause();
        } catch (e) {}
      });
    }
  }

  // מחילים מיד, לפני שהגולש רואה את הדף
  apply();

  var css =
    // מצבי הנגישות
    "html.a11y-contrast{filter:contrast(1.35) saturate(1.15)}" +
    "html.a11y-mono{filter:grayscale(1)}" +
    "html.a11y-contrast.a11y-mono{filter:grayscale(1) contrast(1.35)}" +
    "html.a11y-links a{text-decoration:underline!important;text-underline-offset:3px!important;outline:2px dashed #ffd400!important;outline-offset:2px!important}" +
    "html.a11y-font body,html.a11y-font body *:not(svg):not(svg *){font-family:Arial,Helvetica,sans-serif!important}" +
    "html.a11y-spacing body *:not(svg):not(svg *){letter-spacing:.06em!important;word-spacing:.14em!important;line-height:1.75!important}" +
    "html.a11y-still *,html.a11y-still *::before,html.a11y-still *::after{animation-duration:0s!important;animation-iteration-count:1!important;transition-duration:0s!important;scroll-behavior:auto!important}" +
    "html.a11y-cursor,html.a11y-cursor *{cursor:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath d='M4 2l15 11-7 1 4 8-3 1-4-8-5 5z' fill='%23000' stroke='%23fff' stroke-width='1.5'/%3E%3C/svg%3E\") 4 2,auto!important}" +
    "html.a11y-focus *:focus,html.a11y-focus *:focus-visible{outline:3px solid #ffd400!important;outline-offset:3px!important;box-shadow:0 0 0 6px rgb(0 0 0/.85)!important}" +
    // הכפתור והחלונית
    "#eco-a11y,#eco-a11y *{box-sizing:border-box;font-family:Heebo,Arial,Helvetica,sans-serif!important;letter-spacing:normal!important;word-spacing:normal!important;line-height:1.3!important}" +
    // מתחת לחלון הצ'ט של נעם (60), לתפריט המובייל (55) ולנגן הווידאו (90)
    "#eco-a11y-btn{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:54;width:46px;height:50px;display:grid;place-items:center;border:0;border-radius:0 14px 14px 0;background:" + COLOR + ";color:#fff;cursor:pointer;box-shadow:0 10px 28px -8px rgb(0 0 0/.45);transition:width .2s}" +
    "#eco-a11y-btn:hover{width:52px}" +
    "#eco-a11y-btn:focus-visible{outline:3px solid #ffd400;outline-offset:2px}" +
    "#eco-a11y-btn svg{width:28px;height:28px}" +
    "#eco-a11y-panel{position:fixed;left:12px;top:50%;transform:translateY(-50%);z-index:2147483001;width:min(330px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;background:#fff;color:#111;border-radius:18px;box-shadow:0 30px 80px -20px rgb(0 0 0/.6);padding:16px;direction:rtl;text-align:right;font-size:15px}" +
    "#eco-a11y-panel[hidden]{display:none}" +
    "#eco-a11y-panel h2{margin:0;font-size:18px;font-weight:800;color:#111}" +
    "#eco-a11y-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}" +
    "#eco-a11y-panel button{font-size:14px;font-weight:600;color:#111;cursor:pointer}" +
    "#eco-a11y-panel button:focus-visible,#eco-a11y-panel a:focus-visible{outline:3px solid " + COLOR + ";outline-offset:2px}" +
    ".eco-a11y-x{width:36px;height:36px;border-radius:50%;border:1px solid #ccc;background:#f3f4f6;font-size:20px!important;line-height:1!important}" +
    ".eco-a11y-size{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border:1px solid #d1d5db;border-radius:12px;margin-bottom:8px}" +
    ".eco-a11y-size div{display:flex;gap:6px}" +
    ".eco-a11y-size button{width:40px;height:36px;border-radius:10px;border:1px solid #d1d5db;background:#f3f4f6}" +
    ".eco-a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".eco-a11y-grid button{min-height:52px;padding:8px;border-radius:12px;border:1px solid #d1d5db;background:#f9fafb;text-align:center}" +
    ".eco-a11y-grid button[aria-pressed=true]{background:" + COLOR + ";border-color:" + COLOR + ";color:#fff}" +
    ".eco-a11y-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px}" +
    ".eco-a11y-reset{padding:8px 14px;border-radius:999px;border:1px solid #111;background:#fff}" +
    "#eco-a11y-panel a{color:" + COLOR + ";font-weight:700;text-decoration:underline}" +
    (RIGHT
      ? "#eco-a11y-btn{left:auto;right:0;border-radius:14px 0 0 14px}#eco-a11y-panel{left:auto;right:12px}"
      : "") +
    "@media print{#eco-a11y{display:none!important}}";

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  function mount() {
    if (document.getElementById("eco-a11y")) return;
    var style = el("style", { id: "eco-a11y-css" }, css);
    document.head.appendChild(style);

    var wrap = el("div", { id: "eco-a11y" });
    var btn = el(
      "button",
      {
        id: "eco-a11y-btn",
        type: "button",
        "aria-label": "תפריט נגישות",
        title: "נגישות",
        "aria-haspopup": "dialog",
        "aria-expanded": "false",
        "aria-controls": "eco-a11y-panel",
      },
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 8.5c0 .6-.4 1-.9 1.1l-4.1.6v3.3l1.9 6.2a1 1 0 0 1-1.9.6L12.3 15h-.6L10 20.3a1 1 0 0 1-1.9-.6l1.9-6.2v-3.3l-4.1-.6A1.1 1.1 0 0 1 6.1 7.4l5.2.6h1.4l5.2-.6c.6-.1 1.1.4 1.1 1.1z"/></svg>',
    );

    var panel = el("div", {
      id: "eco-a11y-panel",
      role: "dialog",
      "aria-modal": "false",
      "aria-labelledby": "eco-a11y-title",
      hidden: "",
    });

    var grid = TOGGLES.map(function (t) {
      return (
        '<button type="button" data-k="' + t.k + '" aria-pressed="' + (state[t.k] ? "true" : "false") + '">' + t.label + "</button>"
      );
    }).join("");

    panel.innerHTML =
      '<div id="eco-a11y-head"><h2 id="eco-a11y-title">נגישות</h2>' +
      '<button type="button" class="eco-a11y-x" aria-label="סגירת תפריט הנגישות">×</button></div>' +
      '<div class="eco-a11y-size"><span>גודל טקסט</span><div>' +
      '<button type="button" data-size="-1" aria-label="הקטנת טקסט">א-</button>' +
      '<button type="button" data-size="1" aria-label="הגדלת טקסט">א+</button></div></div>' +
      '<div class="eco-a11y-grid">' + grid + "</div>" +
      '<div class="eco-a11y-foot"><button type="button" class="eco-a11y-reset">איפוס הגדרות</button>' +
      '<a href="' + STATEMENT + '">הצהרת נגישות</a></div>';

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    if (FOOTER_LINK && !document.querySelector('a[href="' + STATEMENT + '"]:not(#eco-a11y-panel a)')) {
      var feet = document.querySelectorAll("body > footer, body > * > footer:last-child, footer.site, footer.foot, footer.ftr");
      var foot = feet.length ? feet[feet.length - 1] : null;
      var line = el("p", { class: "eco-a11y-statement-link" }, '<a href="' + STATEMENT + '">הצהרת נגישות</a>');
      line.style.cssText = "margin:12px 0 0;text-align:center;font-size:14px";
      if (foot) foot.appendChild(line);
      else {
        line.style.cssText += ";padding:16px;margin:0";
        document.body.insertBefore(line, wrap);
      }
    }

    function open(v) {
      if (v) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", v ? "true" : "false");
      btn.style.visibility = v ? "hidden" : "";
      if (v) panel.querySelector(".eco-a11y-x").focus();
      else btn.focus();
    }

    function sync() {
      panel.querySelectorAll("[data-k]").forEach(function (b) {
        b.setAttribute("aria-pressed", state[b.getAttribute("data-k")] ? "true" : "false");
      });
    }

    btn.addEventListener("click", function () {
      open(panel.hasAttribute("hidden"));
    });
    panel.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.classList.contains("eco-a11y-x")) return open(false);
      if (t.classList.contains("eco-a11y-reset")) {
        state = {};
      } else if (t.hasAttribute("data-size")) {
        var s = (state.size || 0) + Number(t.getAttribute("data-size"));
        state.size = Math.max(0, Math.min(SIZES.length - 1, s));
      } else if (t.hasAttribute("data-k")) {
        var k = t.getAttribute("data-k");
        state[k] = !state[k];
      }
      save(state);
      apply();
      sync();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hasAttribute("hidden")) open(false);
    });
    document.addEventListener("click", function (e) {
      if (!panel.hasAttribute("hidden") && !wrap.contains(e.target)) {
        panel.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.style.visibility = "";
      }
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
