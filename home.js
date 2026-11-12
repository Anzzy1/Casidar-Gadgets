// Home page: marquee, branches, interactive "What would you like to do?" chooser, scroll motion.
(function () {
  const { cfg, BRANCHES, MODELS, C, $, $$, esc, clamp, requestUrl, reduceMotion } = window.Casidar;

  // ---------- Marquee + ticker ----------
  const allModels = Object.values(MODELS).flatMap((d) => Object.values(d.series).flat());
  const mq = allModels.filter((m, i) => !/iPhone (6|7|8|X)|1st gen|iPad \((5|6|7)th|mini [2-4]|Air (2|3|\(1st)/.test(m) && (i % 2 === 0 || /Pro|Air|mini/.test(m)));
  const mqHTML = mq.map((m) => `<span>${esc(m)}</span><i></i>`).join("");
  $("#marquee").innerHTML = mqHTML + `<span aria-hidden="true" style="display:contents">${mqHTML}</span>`;
  const tick = ["iPhone 15 Pro · 256GB", "iPad Air · Wi-Fi", "iPhone 13 · 128GB", "iPad mini", "iPhone 16 Pro Max", "iPhone XR · Wi-Fi only", "iPad (9th gen)", "iPhone 12 Pro", "iPhone 14 · Openline", "iPad Pro 11\"", "iPhone 11 · 64GB"];
  const tickHTML = tick.map((t) => `<span>${esc(t)} <em>Ask</em></span>`).join("");
  $("#tickerCol").innerHTML = tickHTML + tickHTML;

  // ---------- Branch cards ----------
  $("#branchCards").innerHTML = BRANCHES.map((b) => {
    const tel = (b.phone || C.smsNumber || "").replace(/\s/g, "");
    return `
    <article class="branch reveal in">
      <div class="map">
        <span class="map-tag">${esc(b.tag || "")}</span>
        <iframe title="Map of ${esc(b.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps?q=${encodeURIComponent(b.mapQuery)}&output=embed"></iframe>
      </div>
      <div class="branch-body">
        <div class="branch-top">
          <div><h3>${esc(b.name)}</h3><p class="branch-area"><svg class="ic ic-sm"><use href="#i-pin"/></svg>${esc(b.address)}</p></div>
        </div>
        <div class="branch-ctas">
          <a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}"><svg class="ic ic-sm"><use href="#i-nav"/></svg> Directions</a>
          ${tel ? `<a class="btn btn-ghost btn-sm" href="tel:${esc(tel)}"><svg class="ic ic-sm"><use href="#i-call"/></svg> Call</a>` : ""}
          <a class="btn btn-ghost btn-sm" href="${requestUrl({ branch: b.id })}"><svg class="ic ic-sm"><use href="#i-chat"/></svg> Ask this branch</a>
        </div>
      </div>
    </article>`;
  }).join("");

  // ---------- "Available now" chips (config.availableNow) ----------
  const AVAIL = cfg.availableNow || [];
  const availHTML = AVAIL.map((a) => `<a class="avail-chip" href="${esc(requestUrl({ mode: "ask", device: a.device, series: a.series, model: a.model, storage: a.storage, type: a.type }))}"><span class="live"></span><b>${esc(a.label)}</b><small>${esc(a.note || "")}</small><svg class="ic ic-xs"><use href="#i-arrow-r"/></svg></a>`).join("");
  $$("[data-avail-box]").forEach((box) => { if (AVAIL.length) box.innerHTML = `<span class="avail-label">Available now</span>${availHTML}`; else box.remove(); });

  // ---------- Active nav + FAB ----------
  if ("IntersectionObserver" in window) {
    const links = $$(".nav-links a");
    const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["devices", "start", "quality", "how", "branches", "faq"].forEach((id) => { const el = document.getElementById(id); if (el) sio.observe(el); });
    const fab = $(".fab");
    const fio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.target.dataset.vis = e.isIntersecting ? "1" : ""));
      fab.classList.toggle("hide", !!($("#start").dataset.vis || $(".footer").dataset.vis));
    }, { threshold: 0 });
    fio.observe($("#start")); fio.observe($(".footer"));
  }

  const mqMobile = matchMedia("(max-width: 760px)");

  // ---------- Scroll-linked motion ----------
  const showcase = $("#showcase");
  const parallaxEls = $$(".parallax, .parallax-bg");
  const stepsBox = $("#steps"), stepsFill = $("#stepsFill"), stepEls = $$(".stp");
  let ticking = false;
  function onScroll() {
    const vh = innerHeight;
    if (!reduceMotion) {
      // Hero photos widen as you scroll
      const start = showcase.parentElement.offsetTop - vh * 0.85;
      const p = clamp((scrollY - Math.max(0, start)) / (vh * 0.6));
      showcase.style.setProperty("--p", p.toFixed(3));
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const off = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(off * -60).toFixed(1)}px, 0)`;
      });
    }
    const r = stepsBox.getBoundingClientRect();
    const sp = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.2));
    stepsBox.style.setProperty("--sp", sp.toFixed(3));
    stepEls.forEach((s, i) => s.classList.toggle("lit", sp >= i / (stepEls.length - 1) - 0.02 && sp > 0));
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // ================= Mobile-only experiences =================

  // ---- Swipe carousels with depth + dots ----
  function carousel(track) {
    if (!track) return;
    const items = [...track.children];
    const dots = document.createElement("div");
    dots.className = "car-dots"; dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = items.map(() => "<i></i>").join("");
    track.after(dots);
    const ds = [...dots.children];
    let raf = 0;
    const upd = () => {
      raf = 0;
      if (!mqMobile.matches) { items.forEach((it) => it.style.removeProperty("--k")); return; }
      const r = track.getBoundingClientRect(), c = r.left + r.width / 2;
      let best = 0, bd = Infinity;
      items.forEach((it, i) => {
        const ir = it.getBoundingClientRect(), d = Math.abs(ir.left + ir.width / 2 - c);
        it.style.setProperty("--k", Math.min(1, d / ir.width).toFixed(3));
        if (d < bd) { bd = d; best = i; }
      });
      ds.forEach((d, i) => d.classList.toggle("on", i === best));
    };
    track.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    mqMobile.addEventListener("change", upd);
    window.addEventListener("resize", upd);
    upd();
  }
  carousel($(".bento"));
  carousel($("#branchCards"));

})();
