// Request page: ask / pre-order builder, live ticket, send dialog.
// Reads choices from the URL, e.g. request.html?mode=preorder&device=iphone&series=iPhone%2015
(function () {
  const { cfg, BRANCHES, MODELS, C, $, $$, esc, peso, branchById, toast, reduceMotion, DEVICE_PHOTO } = window.Casidar;

  const form = $("#reqForm");
  const TYPES = ["Any", ...(cfg.types || ["Pre-owned", "Brand new"])];
  const NEW = "Brand new";
  const CONDS = ["Any", "Like new", "Good", "Fair (minor issues)", "As-is (has issues, lowest price)"];
  const BATTS = ["Any", "80%+", "85%+", "90%+"];
  const REPLY = ["Messenger", "SMS / Call", "Viber", "Email"];
  const GET = ["Pick up at branch", "24-hour delivery", "Ship via LBC (nationwide)"];
  const SUGGEST = "Suggest one for me";
  const S = { mode: "ask", type: "Any", reply: "Messenger", get: GET[0], device: "iphone", series: null, model: null, storage: "Any", extra: "Any", cond: "Any", batt: "Any", budget: 30000, flex: false, branch: BRANCHES[0]?.id };

  // ---------- Apply URL params ----------
  const q = new URLSearchParams(location.search);
  if (q.get("mode") === "preorder") S.mode = "preorder";
  if (MODELS[q.get("device")]) S.device = q.get("device");
  const dv = MODELS[S.device];
  if (q.get("series") && dv.series[q.get("series")]) {
    S.series = q.get("series");
    if (dv.series[S.series].includes(q.get("model"))) S.model = q.get("model");
  }
  if (dv.storage.includes(q.get("storage"))) S.storage = q.get("storage");
  if (TYPES.includes(q.get("type"))) S.type = q.get("type");
  if (q.get("get") === "delivery") S.get = GET[1];
  if (q.get("get") === "lbc") S.get = GET[2];
  if (branchById(q.get("branch"))) S.branch = q.get("branch");
  if (q.get("trade")) form.message.value = "I have an iPhone for trade-in. Model: ___ , Storage: ___ , Battery health: ___%";
  const prefilled = ["mode", "device", "series", "get", "branch", "trade"].some((k) => q.has(k));

  const isPickup = () => S.get === GET[0];
  const isNew = () => S.type === NEW;
  const pillHTML = (items, sel, attr) => items.map((v, i) =>
    `<button type="button" class="pill ${v === sel ? "is-on" : ""}" style="--i:${i}" data-${attr}="${esc(v)}">${esc(v)}</button>`).join("");
  const sel = (box, attr) => $$(".pill", box).forEach((p) => p.classList.toggle("is-on", p.dataset[attr] === S[attr]));

  // ---------- Render ----------
  function renderDevice() {
    const d = MODELS[S.device];
    $$(".dev-card").forEach((c) => c.classList.toggle("is-on", c.dataset.device === S.device));
    $("#seriesPills").innerHTML = pillHTML([...Object.keys(d.series), SUGGEST], S.series, "series");
    renderModels();
    $("#storagePills").innerHTML = pillHTML(["Any", ...d.storage], S.storage, "storage");
    $("#extraPills").innerHTML = d.extra ? pillHTML(["Any", ...d.extra.options], S.extra, "extra") : "";
    $("#extraSub").hidden = !d.extra;
    if (d.extra) $("#extraLabel").textContent = d.extra.label;
    $("#step3Title").textContent = d.extra ? `Storage & ${d.extra.label.toLowerCase()}` : "Storage";
  }
  function renderModels() {
    const d = MODELS[S.device];
    $("#modelPills").innerHTML = pillHTML(S.series && d.series[S.series] ? d.series[S.series] : [], S.model, "model");
  }
  function syncGet() {
    $("#addrField").hidden = isPickup();
    $("#addrLabel").innerHTML = (S.get === GET[2] ? "Shipping address (city / province)" : "Delivery address") + ' <b class="req-star">*</b>';
    form.address.placeholder = S.get === GET[2] ? "House no., street, barangay, city, province" : "House no., street, barangay, city";
    $("#branchLabel").textContent = isPickup() ? "Preferred branch" : "Nearest branch";
  }
  $("#typePills").innerHTML = pillHTML(TYPES, S.type, "type");
  $("#condPills").innerHTML = pillHTML(CONDS, S.cond, "cond");
  $("#battPills").innerHTML = pillHTML(BATTS, S.batt, "batt");
  $("#replyPills").innerHTML = pillHTML(REPLY, S.reply, "reply");
  $("#getPills").innerHTML = pillHTML(GET, S.get, "get");
  $("#branchSeg").innerHTML = BRANCHES.map((b) => `
    <button type="button" data-branch="${b.id}"><svg class="ic"><use href="#i-store"/></svg><span><b>${esc(b.name)}</b><small>${esc(b.area)}</small></span></button>`).join("");

  function modelLabel() {
    const d = MODELS[S.device];
    if (S.model) return S.model;
    if (S.series === SUGGEST) return `${d.label}, suggest one`;
    if (S.series) return `${S.series}, any model`;
    return `${d.label}, any model`;
  }
  const typeLabel = () => (S.type === "Any" ? "Pre-owned or brand new" : S.type);
  const budgetLabel = () => (S.flex ? "Flexible" : `Up to ${peso(S.budget)}`);

  let prevRows = {};
  function renderTicket() {
    const d = MODELS[S.device];
    const rows = {
      Type: typeLabel(),
      Storage: S.storage,
      ...(d.extra ? { [d.extra.label]: S.extra } : {}),
      ...(isNew() ? {} : { Condition: S.cond, Battery: S.batt }),
      Color: form.color.value.trim() || "Any",
      Budget: budgetLabel(),
      "Get it via": S.get.replace(" (nationwide)", ""),
      Branch: branchById(S.branch)?.name || "",
    };
    $("#tKind").textContent = S.mode === "preorder" ? "Pre-order request" : "Stock inquiry";
    $("#tModel").textContent = modelLabel();
    $("#tRows").innerHTML = Object.entries(rows).map(([k, v]) =>
      `<div><dt>${k}</dt><dd class="${prevRows[k] !== undefined && prevRows[k] !== v ? "flash" : ""}">${esc(v)}</dd></div>`).join("");
    prevRows = rows;
    $("#sbKind").textContent = S.mode === "preorder" ? "Pre-order" : "Stock inquiry";
    $("#sbModel").textContent = modelLabel() + (S.storage !== "Any" ? " · " + S.storage : "");
    const sb = $("#sbPhoto");
    if (!sb.src.endsWith(DEVICE_PHOTO[S.device])) { const n = sb.cloneNode(); n.src = DEVICE_PHOTO[S.device]; sb.replaceWith(n); }
    const img = $("#tPhoto");
    if (!img.src.endsWith(DEVICE_PHOTO[S.device])) { const n = img.cloneNode(); n.src = DEVICE_PHOTO[S.device]; img.replaceWith(n); }
  }

  function setMode(m) {
    S.mode = m;
    $$("#modeTabs .tab").forEach((t) => { const on = t.dataset.mode === m; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); });
    $("#modeTabs").classList.toggle("pre", m === "preorder");
    const note = $("#modeNote");
    note.textContent = m === "preorder"
      ? "Want a specific model? We'll get it ready and message you."
      : "Tell us what you're looking for and we'll reply with real photos.";
    note.style.animation = "none"; void note.offsetWidth; note.style.animation = "";
    $("#submitLabel").textContent = m === "preorder" ? "Send pre-order request" : "Send my question";
    try { history.replaceState(null, "", location.pathname + "?" + new URLSearchParams({ ...Object.fromEntries(q), mode: m }).toString()); } catch { /* ignore */ }
    renderTicket();
  }
  function setDevice(d) {
    if (S.device === d) return;
    S.device = d; S.series = null; S.model = null; S.storage = "Any"; S.extra = "Any";
    renderDevice(); renderTicket();
  }
  function setBranch(id) {
    S.branch = id;
    $$("#branchSeg button").forEach((b) => b.classList.toggle("is-on", b.dataset.branch === id));
    renderTicket();
  }

  $("#modeTabs").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (t) setMode(t.dataset.mode); });
  $("#deviceCards").addEventListener("click", (e) => { const c = e.target.closest(".dev-card"); if (c) setDevice(c.dataset.device); });
  $("#branchSeg").addEventListener("click", (e) => { const b = e.target.closest("[data-branch]"); if (b) setBranch(b.dataset.branch); });
  form.addEventListener("click", (e) => {
    const p = e.target.closest(".pill"); if (!p) return;
    const [attr] = Object.keys(p.dataset);
    const val = p.dataset[attr];
    if (attr === "series") { S.series = S.series === val ? null : val; S.model = null; sel($("#seriesPills"), "series"); renderModels(); }
    else if (attr === "model") { S.model = S.model === val ? null : val; sel($("#modelPills"), "model"); }
    else if (attr === "get") { S.get = val; sel(p.parentElement, attr); syncGet(); }
    else if (attr === "type") { S.type = val; sel(p.parentElement, attr); $("#gradeBox").hidden = isNew(); }
    else { S[attr] = val; sel(p.parentElement, attr); }
    renderTicket();
  });

  const range = $("#budget");
  function onBudget() {
    S.budget = Number(range.value);
    range.style.setProperty("--fill", ((S.budget - range.min) / (range.max - range.min)) * 100 + "%");
    $("#budgetOut").textContent = peso(S.budget) + (S.budget >= Number(range.max) ? "+" : "");
    renderTicket();
  }
  range.addEventListener("input", onBudget);
  $("#flex").addEventListener("change", (e) => { S.flex = e.target.checked; $(".budget").classList.toggle("flex", S.flex); renderTicket(); });
  form.color.addEventListener("input", renderTicket);

  renderDevice(); syncGet(); setBranch(S.branch); $("#gradeBox").hidden = isNew(); onBudget(); setMode(S.mode);
  if (prefilled) setTimeout(() => toast(S.series ? `${S.model || S.series} selected. Fill in the rest 👇` : "Your choices are filled in. Add the details 👇"), 700);

  // Mobile send bar: hide when the ticket's own button is on screen
  if ("IntersectionObserver" in window) {
    const bar = $("#sendBar");
    new IntersectionObserver(([e]) => bar.classList.toggle("hide", e.isIntersecting), { threshold: 0.2 }).observe($("#ticket"));
  }

  // ---------- Submit ----------
  function buildMessage(d) {
    const b = branchById(S.branch);
    const dx = MODELS[S.device];
    const lines = [
      S.mode === "preorder" ? "Hi Casidar Gadgets! 👋 I'd like to pre-order:" : "Hi Casidar Gadgets! 👋 Do you have this in stock?",
      "",
      `📱 ${modelLabel()}${S.storage !== "Any" ? " · " + S.storage : ""}`,
      `🏷️ Type: ${typeLabel()}`,
      dx.extra ? `📶 ${dx.extra.label}: ${S.extra}` : null,
      !isNew() ? `✨ Condition: ${S.cond}` : null,
      !isNew() ? `🔋 Min. battery health: ${S.batt}` : null,
      d.color.trim() ? `🎨 Color: ${d.color.trim()}` : null,
      `💰 Budget: ${budgetLabel()}`,
      `🚚 Get it via: ${S.get}`,
      !isPickup() && d.address.trim() ? `🏠 Address: ${d.address.trim()}` : null,
      `📍 ${isPickup() ? "Branch" : "Nearest branch"}: ${b.name} (${b.area})`,
    ];
    if (d.message.trim()) lines.push("", d.message.trim());
    lines.push("", "My contact details:", `👤 ${d.name.trim()}`, `📞 ${d.mobile.trim()}`, `✉️ ${d.email.trim()}`,
      d.social.trim() ? `💬 Facebook: ${d.social.trim()}` : null, `↩️ Please reply via ${S.reply}`);
    return lines.filter((l) => typeof l === "string").join("\n");
  }

  const modal = $("#sendModal");
  let lastMsg = "", lastFocus = null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const v = (k) => String(d[k] || "").trim();
    const bad = [];
    if (!v("name")) bad.push("name");
    if (v("mobile").replace(/\D/g, "").length < 10) bad.push("mobile");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) bad.push("email");
    if (!isPickup() && !v("address")) bad.push("address");
    $$(".field input", form).forEach((i) => i.classList.remove("bad"));
    if (bad.length) {
      bad.forEach((k) => form[k].classList.add("bad"));
      const names = { name: "your name", mobile: "a valid mobile number", email: "a valid email", address: "your address" };
      $("#formErr").textContent = "Please add " + bad.map((k) => names[k]).join(", ") + ".";
      form[bad[0]].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setTimeout(() => form[bad[0]].focus({ preventScroll: true }), 400);
      return;
    }
    $("#formErr").textContent = "";
    lastMsg = buildMessage(d);
    const enc = encodeURIComponent(lastMsg);
    const sms = (C.smsNumber || "").replace(/\s/g, "");
    $("#msgPreview").textContent = lastMsg;
    $("#sentTitle").textContent = S.mode === "preorder" ? "Your pre-order request is ready!" : "Your question is ready!";
    $("#sendMessenger").href = `https://m.me/${encodeURIComponent(C.messengerPage || "")}`; $("#sendMessenger").hidden = !C.messengerPage;
    $("#sendSms").href = `sms:${sms}?&body=${enc}`; $("#sendSms").hidden = !sms;
    $("#sendViber").href = `viber://chat?number=${encodeURIComponent((C.viberNumber || "").replace(/\s/g, ""))}&draft=${enc}`; $("#sendViber").hidden = !C.viberNumber;
    $("#sendEmail").href = `mailto:${C.email || ""}?subject=${encodeURIComponent(S.mode === "preorder" ? "Pre-order request" : "Stock inquiry")}&body=${enc}`; $("#sendEmail").hidden = !C.email;
    lastFocus = document.activeElement;
    modal.hidden = false; document.body.style.overflow = "hidden";
    $(".modal-x", modal).focus();
  });
  $$(".field input", form).forEach((i) => i.addEventListener("input", () => { i.classList.remove("bad"); if (!$(".field input.bad", form)) $("#formErr").textContent = ""; }));
  function closeModal() { modal.hidden = true; document.body.style.overflow = ""; lastFocus?.focus?.(); }
  modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove(); return ok;
    }
  }
  $("#copyMsg").addEventListener("click", async () => toast((await copy(lastMsg)) ? "Copied! Paste it in the chat" : "Couldn't copy, please select the text"));
  $("#sendMessenger").addEventListener("click", () => { copy(lastMsg); toast("Message copied, paste it in Messenger"); });
})();
