// Shared by every page: theme, nav, toast, contact links, reveal, pointer effects.
(function () {
  const cfg = window.CASIDAR_CONFIG || {};
  const BRANCHES = cfg.branches || [];
  const MODELS = cfg.models || {};
  const C = cfg.contact || {};

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const peso = (n) => "₱" + Number(n).toLocaleString("en-PH");
  const branchById = (id) => BRANCHES.find((b) => b.id === id);
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const scrollToEl = (el, block = "start") => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block });
  const DEVICE_PHOTO = { iphone: "assets/photos/iphone-new.jpg", ipad: "assets/photos/ipad-blue.jpg" };

  // Build a link to the request form with pre-filled choices.
  function requestUrl(opts = {}) {
    const q = new URLSearchParams();
    Object.entries(opts).forEach(([k, v]) => { if (v != null && v !== "") q.set(k, v); });
    const qs = q.toString();
    return "request.html" + (qs ? "?" + qs : "");
  }

  requestAnimationFrame(() => document.body.classList.add("loaded"));

  // ---------- Theme ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
    if (!store.get("theme")) root.dataset.theme = e.matches ? "dark" : "light";
  });
  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next; store.set("theme", next);
  });

  // ---------- Toast ----------
  let toastT;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // ---------- Footer + shop contacts ----------
  const fb = $("#footBranches");
  if (fb) fb.innerHTML += BRANCHES.map((b) => `<p class="foot-branch"><b>${esc(b.name)}</b>${esc(b.address)}</p>`).join("");
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
  const tel0 = (C.smsNumber || "").replace(/\s/g, "");
  const contactLinks = [
    C.messengerPage && { ic: "i-messenger", label: "Messenger", value: "m.me/" + C.messengerPage, href: "https://m.me/" + encodeURIComponent(C.messengerPage), ext: true },
    C.facebookUrl && { ic: "i-fb", label: "Facebook", value: C.facebookUrl.replace(/^https?:\/\/(www\.)?/, ""), href: C.facebookUrl, ext: true },
    C.email && { ic: "i-envelope", label: "Email", value: C.email, href: "mailto:" + C.email },
    tel0 && { ic: "i-call", label: "Call / SMS", value: C.smsNumber, href: "tel:" + tel0 },
    C.viberNumber && { ic: "i-chat", label: "Viber", value: C.viberNumber, href: "viber://chat?number=" + encodeURIComponent(C.viberNumber.replace(/\s/g, "")) },
  ].filter(Boolean);
  const contactHTML = contactLinks.map((c) => `<a class="ct" href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ""}><span class="ct-ic"><svg class="ic ic-sm"><use href="#${c.ic}"/></svg></span><span><small>${esc(c.label)}</small><b>${esc(c.value)}</b></span></a>`).join("");
  $$("[data-contacts], #directContact, #footContact").forEach((el) => (el.innerHTML = contactHTML));

  // ---------- Nav ----------
  const nav = $(".nav");
  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu");
  menuBtn?.addEventListener("click", () => { const open = menu.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(open)); });
  if (menu) $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  const onNavScroll = () => nav?.classList.toggle("scrolled", scrollY > 8);
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();

  // ---------- Reveal + counters ----------
  function countUp(el) {
    const target = Number(el.dataset.count), suf = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 80}ms`;
      io.observe(el);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  // ---------- Pointer effects ----------
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
    const glow = $(".cursor-glow");
    if (glow) {
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, running = false;
      const loop = () => {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx}px, ${gy}px)`;
        if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else running = false;
      };
      window.addEventListener("pointermove", (e) => {
        tx = e.clientX; ty = e.clientY; document.body.classList.add("has-pointer");
        if (!running) { running = true; requestAnimationFrame(loop); }
      }, { passive: true });
    }
  }

  // ---------- Touch ripple (phones) ----------
  if (!reduceMotion) {
    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      const b = e.target.closest(".btn, .pill, .tabbar a, .dev-card, .seg button, .tab, .send-btn");
      if (!b) return;
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.appendChild(s);
      setTimeout(() => s.remove(), 650);
    }, { passive: true });
  }

  window.Casidar = { cfg, BRANCHES, MODELS, C, $, $$, esc, peso, branchById, clamp, scrollToEl, toast, requestUrl, reduceMotion, finePointer, DEVICE_PHOTO };
})();
