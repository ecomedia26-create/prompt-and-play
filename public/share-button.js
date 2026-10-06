/* כפתור שיתוף צף של אקו מדיה: קובץ אחד, בלי ספריות. מוסיפים לפני </body>:
   <script src="/share-button.js" defer
     data-text="טקסט שיופיע לפני הקישור"
     data-url="https://www.example.co.il"   (לא חובה; ברירת מחדל: העמוד הנוכחי)
     data-color="#1c2160" data-side="left" data-bottom="24"></script>
   בטלפון נפתח תפריט השיתוף של המכשיר; במחשב חלונית עם וואטסאפ, פייסבוק והעתקת קישור. */
(function () {
  var s = document.currentScript || {}, d = s.dataset || {};
  var text = d.text || document.title;
  var color = d.color || '#1c2160';
  var side = d.side === 'right' ? 'right' : 'left';
  var bottom = parseInt(d.bottom || '24', 10);
  var bottomMobile = parseInt(d.bottomMobile || d.bottom || '24', 10);
  var url = function () { return d.url ? d.url.replace(/\/$/, '') + location.pathname + location.search : location.href.split('#')[0]; };
  var icon = function (p) { return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var SHARE = icon('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>');
  var CLOSE = icon('<path d="M18 6 6 18M6 6l12 12"/>');
  var LINK = icon('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>');
  var WA = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z"/></svg>';
  var FB = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="#4e8cf0"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/></svg>';

  var css = document.createElement('style');
  css.textContent =
    '.em-share{position:fixed;' + side + ':16px;bottom:' + bottomMobile + 'px;z-index:2147483000;font-family:inherit;direction:rtl}' +
    '@media (min-width:640px){.em-share{bottom:' + bottom + 'px;' + side + ':20px}}' +
    '.em-share>button{width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:' + color + ';color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 30px -8px rgba(0,0,0,.45);transition:transform .25s cubic-bezier(.16,1,.3,1)}' +
    '.em-share>button:hover{transform:translateY(-2px)}.em-share>button:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
    '.em-share-p{position:absolute;bottom:58px;' + side + ':0;width:220px;padding:8px;border-radius:16px;background:rgba(20,24,63,.96);border:1px solid rgba(255,255,255,.15);box-shadow:0 20px 50px -10px rgba(0,0,0,.6);opacity:0;transform:translateY(8px) scale(.97);pointer-events:none;transition:.25s cubic-bezier(.16,1,.3,1)}' +
    '.em-share.open .em-share-p{opacity:1;transform:none;pointer-events:auto}' +
    '.em-share-p p{margin:4px 10px 8px;font-size:12px;color:rgba(255,255,255,.6)}' +
    '.em-share-p a,.em-share-p button{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:10px;border:0;border-radius:10px;background:none;color:#fff;font-family:inherit;font-size:14px;font-weight:600;line-height:1.2;text-decoration:none;cursor:pointer;text-align:start}' +
    '.em-share-p a:hover,.em-share-p button:hover{background:rgba(255,255,255,.1)}' +
    '@media (prefers-reduced-motion:reduce){.em-share *{transition:none!important}}';
  document.head.appendChild(css);

  var root = document.createElement('div');
  root.className = 'em-share';
  root.innerHTML =
    '<div class="em-share-p" role="dialog" aria-label="שיתוף עם חברים"><p>שתפו עם חברים</p>' +
    '<a data-k="wa" target="_blank" rel="noopener noreferrer">' + WA + 'וואטסאפ</a>' +
    '<a data-k="fb" target="_blank" rel="noopener noreferrer">' + FB + 'פייסבוק</a>' +
    '<button type="button" data-k="copy">' + LINK + '<span>העתקת קישור</span></button></div>' +
    '<button type="button" aria-label="שיתוף עם חברים" aria-expanded="false" title="שתפו עם חברים">' + SHARE + '</button>';
  var fab = root.lastChild, panel = root.firstChild;

  var setOpen = function (o) {
    root.classList.toggle('open', o);
    fab.setAttribute('aria-expanded', String(o));
    fab.innerHTML = o ? CLOSE : SHARE;
    if (o) {
      panel.querySelector('[data-k=wa]').href = 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url());
      panel.querySelector('[data-k=fb]').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url());
    }
  };
  fab.addEventListener('click', function () {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      navigator.share({ title: document.title, text: text, url: url() }).catch(function () {});
      return;
    }
    setOpen(!root.classList.contains('open'));
  });
  panel.addEventListener('click', function (e) {
    var t = e.target.closest('[data-k]');
    if (!t) return;
    if (t.dataset.k !== 'copy') return setOpen(false);
    var label = t.querySelector('span'), done = function () { label.textContent = 'הקישור הועתק ✓'; setTimeout(function () { label.textContent = 'העתקת קישור'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(url()).then(done, function () { prompt('העתיקו את הקישור:', url()); });
    else prompt('העתיקו את הקישור:', url());
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', function (e) { if (e.composedPath().indexOf(root) < 0) setOpen(false); });
  (document.body || document.documentElement).appendChild(root);
})();
