/* 《阿婆的冰箱》逻辑 */
(function () {
  "use strict";

  const DESIGN_W = 1672, DESIGN_H = 941;
  const LS_KEY = "apo_fridge_content_v1";
  const LAYOUT_KEY = "apo_fridge_layout_v1";
  const BGM_SRC = "audio/bgm.mp3";
  const BGM_VOLUME_KEY = "apo_fridge_bgm_volume_v1";
  const DEFAULT_BGM_VOLUME = 0.22;
  const EDIT = new URLSearchParams(location.search).has("edit");

  const sceneDefaults = {
    grandma: { x: 2.02, y: 11.66, w: 28.5 },
    bag: { x: 21.39, y: 5.44, w: 11.3 },
    bin: { x: 64.4, y: 2.97, w: 12.6 }
  };
  const GRANDMA_NORMAL_SRC = "res/grandma.png";
  const GRANDMA_SURPRISE_SRC = "res/grandma_surprise.png";
  const SURPRISE_TOSS_IDS = new Set(["chenpi", "yaozhu", "huajiao", "dongtang", "bupin", "danggui"]);
  const AUDIO_ALIASES = {
    dongtang: "yezijitang",
    fanqiejiang: "fanqiezhi",
    jizhua: "jijiao",
    yaozhu: "chongcao",
    meicaigan: "meicai",
    huanshan: "huaishan"
  };
  const AUDIO_SRC_BY_ID = id => `audio/${AUDIO_ALIASES[id] || id}.mp3`;

  // ---- 内容：基础数据 + localStorage 覆盖 ----
  const base = window.CONTENT;
  function loadContent() {
    let data = JSON.parse(JSON.stringify(base));
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (saved) {
        if (saved.global) Object.assign(data.global, saved.global);
        if (saved.items) {
          const map = {};
          saved.items.forEach(it => (map[it.id] = it));
          data.items.forEach(it => { if (map[it.id]) Object.assign(it, map[it.id]); });
        }
      }
    } catch (e) { console.warn("本地内容读取失败", e); }
    return data;
  }
  let C = loadContent();

  function loadLayout() {
    const layout = JSON.parse(JSON.stringify(sceneDefaults));
    try {
      const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
      if (saved) Object.keys(layout).forEach(id => saved[id] && Object.assign(layout[id], saved[id]));
    } catch (e) { console.warn("本地布局读取失败", e); }
    return layout;
  }
  let L = loadLayout();

  // ---- 状态 ----
  const state = { kept: [], tossed: [] };          // 存 item.id
  let introVisible = true;
  const byId = id => C.items.find(i => i.id === id);
  const total = () => C.items.length;
  const done = () => state.kept.length + state.tossed.length;

  // ---- DOM ----
  const $ = s => document.querySelector(s);
  const stage = $("#stage");
  const overlay = $("#overlay");
  const modal = $("#modal");
  const modalBubble = $("#modalBubble");
  const panel = $("#panel");
  const bgmToggle = $("#bgmToggle");
  const bgmControl = $("#bgmControl");
  const bgmVolume = $("#bgmVolume");

  // ---- 舞台等比缩放 ----
  function fit() {
    const compact = innerWidth < 900 || innerHeight < 620;
    const pad = compact ? (innerWidth < 700 ? 12 : 24) : 250;
    const s = Math.min((innerWidth - pad) / DESIGN_W, (innerHeight - pad) / DESIGN_H);
    $("#frame").style.transform = `scale(${s})`;
  }
  addEventListener("resize", fit);

  // ---- 渲染 ----
  function renderStatic() {
    $("#sysTip").innerHTML = C.global.systemTip;
    $("#greet").innerHTML =
      `<span class="yue" data-gfield="grandmaGreeting">${C.global.grandmaGreeting}</span>` +
      `<span class="note" data-gfield="grandmaGreetingNote">${C.global.grandmaGreetingNote}</span>`;
    $("#greet").classList.toggle("hidden", done() > 0);
    renderProgress();
  }
  function renderProgress() {
    $("#progress").textContent = `进度：${done()}/${total()}`;
  }
  function renderItems() {
    document.querySelectorAll(".item").forEach(n => n.remove());
    C.items.forEach((it, idx) => {
      const el = document.createElement("div");
      el.className = "item";
      el.dataset.id = it.id;
      el.dataset.editName = it.name;
      el.style.setProperty("--i", idx);
      el.style.left = it.position.x + "%";
      el.style.top = it.position.y + "%";
      el.style.width = it.position.w + "%";
      el.innerHTML = `<img src="${it.icon}" alt="">`;
      if (state.kept.includes(it.id) || state.tossed.includes(it.id)) el.classList.add("removed");
      stage.appendChild(el);
    });
  }

  function applySceneLayout() {
    Object.keys(L).forEach(id => {
      const el = $("#" + id);
      if (!el) return;
      el.dataset.sceneId = id;
      el.style.left = L[id].x + "%";
      el.style.bottom = L[id].y + "%";
      el.style.width = L[id].w + "%";
    });
  }

  // ---- 物品特写卡 ----
  let current = null;
  let choosing = false;
  function dismissIntro() {
    introVisible = false;
    $("#greet").classList.add("hidden");
  }
  let currentAudio = null;
  const audioCache = new Map();
  let audioWarmupStarted = false;
  function warmupItemAudio() {
    if (audioWarmupStarted) return;
    audioWarmupStarted = true;
    const ids = C.items.map(it => it.id);
    let i = 0;
    const step = () => {
      if (i >= ids.length) return;
      const id = ids[i++];
      const src = AUDIO_SRC_BY_ID(id);
      if (!audioCache.has(src)) {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.load();
        audioCache.set(src, audio);
      }
      setTimeout(step, 260);
    };
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 900));
    idle(step);
  }
  function playItemAudio(id) {
    const src = AUDIO_SRC_BY_ID(id);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = audioCache.get(src) || new Audio(src);
    currentAudio.currentTime = 0;
    currentAudio.preload = "auto";
    audioCache.set(src, currentAudio);
    currentAudio.play().catch(err => {
      console.warn("物品语音播放失败", id, err);
    });
    warmupItemAudio();
  }

  let bgmAudio = null;
  let bgmOn = false;
  let bgmAutoplayArmed = false;
  let bgmWanted = true;
  let bgmControlTimer = null;
  function loadBgmVolume() {
    const raw = Number(localStorage.getItem(BGM_VOLUME_KEY));
    return Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : DEFAULT_BGM_VOLUME;
  }
  function setBgmVolume(value) {
    const volume = Math.min(1, Math.max(0, value));
    if (bgmAudio) bgmAudio.volume = volume;
    if (bgmVolume) bgmVolume.value = Math.round(volume * 100);
    localStorage.setItem(BGM_VOLUME_KEY, String(volume));
  }
  function showBgmControlBriefly() {
    if (!bgmControl) return;
    bgmControl.classList.add("open");
    clearTimeout(bgmControlTimer);
    bgmControlTimer = setTimeout(() => bgmControl.classList.remove("open"), 1800);
  }
  function updateBgmButton() {
    if (!bgmToggle) return;
    bgmToggle.classList.toggle("on", bgmOn);
    bgmToggle.setAttribute("aria-pressed", bgmOn ? "true" : "false");
    bgmToggle.setAttribute("aria-label", bgmOn ? "关闭 BGM" : "开启 BGM");
    bgmToggle.title = bgmOn ? "关闭 BGM" : "开启 BGM";
  }
  async function startBgm({ quiet = false } = {}) {
    if (!bgmAudio) return false;
    try {
      await bgmAudio.play();
      bgmOn = true;
      bgmWanted = true;
      updateBgmButton();
      return true;
    } catch (err) {
      bgmOn = bgmWanted;
      updateBgmButton();
      if (!quiet) {
        flashToast("BGM 播放失败");
        console.warn("BGM 播放失败", err);
      }
      return false;
    }
  }
  function initBgmToggle() {
    if (!bgmToggle) return;
    bgmAudio = new Audio(BGM_SRC);
    bgmAudio.loop = true;
    bgmAudio.volume = loadBgmVolume();
    bgmAudio.preload = "none";
    setBgmVolume(bgmAudio.volume);
    bgmWanted = true;
    bgmOn = true;
    updateBgmButton();
    if (bgmVolume) {
      bgmVolume.addEventListener("input", () => {
        setBgmVolume(Number(bgmVolume.value) / 100);
        showBgmControlBriefly();
      });
    }
    startBgm({ quiet: true }).then(ok => {
      if (ok || bgmAutoplayArmed) return;
      bgmAutoplayArmed = true;
      document.addEventListener("pointerdown", e => {
        if (!bgmWanted || bgmAudio.paused === false || e.target.closest("#bgmToggle")) return;
        startBgm({ quiet: true });
      }, { once: true, capture: true });
    });
    bgmToggle.addEventListener("click", async () => {
      if (!bgmAudio) return;
      showBgmControlBriefly();
      if (bgmOn) {
        bgmAudio.pause();
        bgmOn = false;
        bgmWanted = false;
        updateBgmButton();
        return;
      }
      bgmWanted = true;
      startBgm();
    });
  }
  function openItem(id) {
    if (EDIT) return; // 编辑模式下点击用于拖拽/改字，不弹卡
    current = byId(id);
    const itemEl = document.querySelector(`.item[data-id="${id}"]`);
    if (itemEl) {
      itemEl.classList.remove("pluck");
      void itemEl.offsetWidth;
      itemEl.classList.add("pluck");
    }
    modal.querySelector(".pic").src = current.icon;
    modal.querySelector('[data-field="name"]').textContent = current.name;
    modal.querySelector('[data-field="desc_short"]').textContent = current.desc_short;
    modalBubble.innerHTML =
      `<span class="yue">${current.story}</span><span class="note">${current.story_note}</span>`;
    playItemAudio(id);
    panel.classList.remove("show");
    panel.classList.remove("closing");
    modal.classList.remove("closing");
    modalBubble.classList.remove("closing");
    modal.classList.add("show");
    modalBubble.classList.add("show");
    overlay.classList.add("show");
    document.body.classList.add("modal-open");
    dismissIntro();
    choosing = false;
    modal.querySelectorAll(".choice").forEach(b => b.classList.remove("selected"));
    setSquircle(modal);
    setSquircle(modalBubble);
  }
  function finishCloseOverlay() {
    overlay.classList.remove("show");
    modal.classList.remove("show", "closing");
    modalBubble.classList.remove("show", "closing");
    panel.classList.remove("show", "closing");
    document.body.classList.remove("modal-open");
    current = null;
    choosing = false;
  }
  function closeOverlay() {
    if (!overlay.classList.contains("show")) return finishCloseOverlay();
    const active = [modal, modalBubble, panel].filter(el => el.classList.contains("show"));
    if (!active.length) return finishCloseOverlay();
    active.forEach(el => el.classList.add("closing"));
    setTimeout(finishCloseOverlay, 170);
  }

  function pulsePile(act) {
    const pile = act === "keep" ? $("#bag") : $("#bin");
    if (!pile) return;
    pile.classList.remove("thump");
    void pile.offsetWidth;
    pile.classList.add("thump");
  }

  let grandmaSurpriseTimer = null;
  function flashGrandmaSurprise() {
    const grandma = $("#grandma");
    if (!grandma) return;
    clearTimeout(grandmaSurpriseTimer);
    grandma.classList.remove("surprised");
    void grandma.offsetWidth;
    grandma.src = GRANDMA_SURPRISE_SRC;
    grandma.classList.add("surprised");
    grandmaSurpriseTimer = setTimeout(() => {
      grandma.classList.remove("surprised");
      grandma.src = GRANDMA_NORMAL_SRC;
    }, 1500);
  }

  function animateItemExit(id, act) {
    const el = document.querySelector(`.item[data-id="${id}"]`);
    const target = act === "keep" ? $("#bag") : $("#bin");
    if (!el || !target) {
      el?.classList.add("removed");
      return;
    }
    const a = el.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    el.style.setProperty("--fly-x", dx.toFixed(1) + "px");
    el.style.setProperty("--fly-y", dy.toFixed(1) + "px");
    el.style.setProperty("--fly-r", act === "keep" ? "-9deg" : "10deg");
    el.classList.add("exiting");
    el.addEventListener("animationend", () => {
      el.classList.remove("exiting", "pluck");
      el.classList.add("removed");
    }, { once: true });
  }

  function choose(act) {
    if (!current) return;
    const id = current.id;
    if (act === "skip") { closeOverlay(); return; }
    if (act === "keep") state.kept.push(id);
    else {
      state.tossed.push(id);
      if (SURPRISE_TOSS_IDS.has(id)) flashGrandmaSurprise();
    }
    // 阿婆回应（短暂显示在她的气泡里）
    const resp = act === "keep" ? [current.keep, current.keep_note] : [current.toss, current.toss_note];
    animateItemExit(id, act);
    pulsePile(act);
    closeOverlay();
    flashGreet(resp[0], resp[1]);
    renderProgress();
    if (done() >= total()) setTimeout(showEnding, 900);
  }

  function chooseWithButton(btn) {
    if (!current || choosing) return;
    choosing = true;
    const act = btn.dataset.act;
    modal.querySelectorAll(".choice").forEach(b => b.classList.toggle("selected", b === btn));
    setTimeout(() => choose(act), 260);
  }

  let greetTimer = null;
  function flashGreet(yue, note, persist = false) {
    const g = $("#greet");
    g.classList.remove("hidden");
    g.innerHTML = `<span class="yue">${yue}</span><span class="note">${note}</span>`;
    g.style.opacity = "1";
    clearTimeout(greetTimer);
    if (persist) return;
    const stay = Math.min(9000, Math.max(4200, (yue.length + note.length) * 95));
    greetTimer = setTimeout(() => {
      if (introVisible && done() === 0) {
        g.innerHTML =
          `<span class="yue">${C.global.grandmaGreeting}</span><span class="note">${C.global.grandmaGreetingNote}</span>`;
      } else {
        g.classList.add("hidden");
      }
    }, stay);
  }

  // ---- 复盘面板 ----
  function openPanel(kind) {
    dismissIntro();
    const isKeep = kind === "kept";
    const ids = isKeep ? state.kept : state.tossed;
    panel.className = "card noise show" + (isKeep ? "" : " toss");
    panel.classList.remove("closing");
    modal.classList.remove("show", "closing");
    modalBubble.classList.remove("show", "closing");
    panel.querySelector("h3").innerHTML = isKeep
      ? `<span>留下的东西</span><small>共 ${ids.length} 件</small>`
      : `<span>丢掉的东西</span><small>共 ${ids.length} 件</small>`;
    const list = panel.querySelector(".list");
    list.style.display = "";
    list.innerHTML = ids.length ? "" : `<div class="empty">这里还没有东西</div>`;
    ids.forEach((id, idx) => {
      const it = byId(id);
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.setProperty("--i", idx);
      cell.innerHTML = `<img src="${it.icon}"><span>${it.name}</span><button class="flip">${isKeep ? "改为丢掉" : "改为留下"}</button>`;
      cell.onclick = () => { moveItem(id, isKeep); openPanel(kind); };
      list.appendChild(cell);
    });
    list.querySelectorAll(".cell").forEach(squircle);
    modal.classList.remove("show");
    modalBubble.classList.remove("show");
    overlay.classList.add("show");
    document.body.classList.add("modal-open");
    setSquircle(panel);
  }
  function moveItem(id, fromKeep) {
    if (fromKeep) { pull(state.kept, id); state.tossed.push(id); }
    else { pull(state.tossed, id); state.kept.push(id); }
    renderProgress();
  }
  function pull(arr, id) { const i = arr.indexOf(id); if (i > -1) arr.splice(i, 1); }

  // ---- 结尾摆放 ----
  const placeState = { placed: {}, selectedId: null, dragging: null };
  const FRIDGE_ZONE = { x1: 33.5, x2: 64.5, y1: 13, y2: 89 };
  function stagePoint(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    return {
      x: +((clientX - rect.left) / rect.width * 100).toFixed(2),
      y: +((clientY - rect.top) / rect.height * 100).toFixed(2)
    };
  }
  function inFridgeZone(p) {
    return p.x >= FRIDGE_ZONE.x1 && p.x <= FRIDGE_ZONE.x2 && p.y >= FRIDGE_ZONE.y1 && p.y <= FRIDGE_ZONE.y2;
  }
  function clampToFridge(p) {
    return {
      x: +Math.min(FRIDGE_ZONE.x2, Math.max(FRIDGE_ZONE.x1, p.x)).toFixed(2),
      y: +Math.min(FRIDGE_ZONE.y2, Math.max(FRIDGE_ZONE.y1, p.y)).toFixed(2)
    };
  }
  function applyPlacedStyle(el, data) {
    el.style.left = data.x + "%";
    el.style.top = data.y + "%";
    el.style.width = data.w + "%";
    el.style.setProperty("--s", data.s);
    el.style.setProperty("--r", data.r + "deg");
  }
  function renderPlaceList() {
    const list = $("#placeTray .placeList");
    list.innerHTML = "";
    state.kept.forEach(id => {
      const it = byId(id);
      const btn = document.createElement("button");
      btn.className = "placePick" + (placeState.placed[id] ? " placed" : "");
      btn.dataset.id = id;
      btn.innerHTML = `<img src="${it.icon}" alt=""><span>${it.name}</span>`;
      btn.addEventListener("pointerdown", startPickDrag);
      list.appendChild(btn);
    });
    $("#placeDone").disabled = Object.keys(placeState.placed).length < state.kept.length;
  }
  function selectPlaced(id) {
    placeState.selectedId = id;
    document.querySelectorAll(".placedItem").forEach(el =>
      el.classList.toggle("selected", el.dataset.id === id));
    const disabled = !id;
    ["#place-smaller", "#place-larger", "#place-rot-left", "#place-rot-right"].forEach(sel => {
      const btn = $(sel);
      if (btn) btn.disabled = disabled;
    });
  }
  function createPlacedItem(id, x, y) {
    const it = byId(id);
    let el = document.querySelector(`.placedItem[data-id="${id}"]`);
    if (!el) {
      el = document.createElement("div");
      el.className = "placedItem";
      el.dataset.id = id;
      el.innerHTML = `<img src="${it.icon}" alt="">`;
      el.addEventListener("pointerdown", startPlacedDrag);
      $("#placeMode").appendChild(el);
    }
    const data = placeState.placed[id] || { x, y, w: Math.max(5, it.position.w), s: 1, r: 0 };
    data.x = x; data.y = y;
    placeState.placed[id] = data;
    applyPlacedStyle(el, data);
    selectPlaced(id);
    renderPlaceList();
  }
  function startPickDrag(e) {
    const id = e.currentTarget.dataset.id;
    if (placeState.placed[id]) return;
    e.preventDefault();
    const it = byId(id);
    const ghost = document.createElement("img");
    ghost.className = "placeGhost";
    ghost.src = it.icon;
    document.body.appendChild(ghost);
    placeState.dragging = { type: "new", id, ghost };
    movePlaceDrag(e);
    addEventListener("pointermove", movePlaceDrag);
    addEventListener("pointerup", endPlaceDrag, { once: true });
    addEventListener("pointercancel", endPlaceDrag, { once: true });
  }
  function startPlacedDrag(e) {
    e.preventDefault();
    const id = e.currentTarget.dataset.id;
    selectPlaced(id);
    e.currentTarget.classList.add("drag");
    placeState.dragging = { type: "placed", id, el: e.currentTarget };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    addEventListener("pointermove", movePlaceDrag);
    addEventListener("pointerup", endPlaceDrag, { once: true });
    addEventListener("pointercancel", endPlaceDrag, { once: true });
  }
  function movePlaceDrag(e) {
    const drag = placeState.dragging;
    if (!drag) return;
    if (drag.ghost) {
      drag.ghost.style.left = e.clientX + "px";
      drag.ghost.style.top = e.clientY + "px";
    } else if (drag.el) {
      const p = clampToFridge(stagePoint(e.clientX, e.clientY));
      const data = placeState.placed[drag.id];
      data.x = p.x; data.y = p.y;
      applyPlacedStyle(drag.el, data);
    }
  }
  function endPlaceDrag(e) {
    removeEventListener("pointermove", movePlaceDrag);
    const drag = placeState.dragging;
    if (!drag) return;
    const rect = stage.getBoundingClientRect();
    const trayRect = $("#placeTray").getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    const overTray = e.clientX >= trayRect.left && e.clientX <= trayRect.right && e.clientY >= trayRect.top && e.clientY <= trayRect.bottom;
    const p = stagePoint(e.clientX, e.clientY);
    if (drag.type === "new" && inside && !overTray && inFridgeZone(p)) {
      createPlacedItem(drag.id, p.x, p.y);
    }
    drag.ghost?.remove();
    drag.el?.classList.remove("drag");
    placeState.dragging = null;
  }
  function adjustPlaced(kind, delta) {
    const id = placeState.selectedId;
    if (!id) return;
    const data = placeState.placed[id];
    if (kind === "scale") data.s = Math.max(.45, +(data.s + delta).toFixed(2));
    if (kind === "rotate") data.r = +(data.r + delta).toFixed(1);
    const el = document.querySelector(`.placedItem[data-id="${id}"]`);
    if (el) applyPlacedStyle(el, data);
  }
  function showPlacementMode() {
    $("#placeMode").classList.add("show");
    $("#placeMode").classList.remove("done");
    $("#sysTip").textContent = "把留下的东西拖回冰箱里";
    selectPlaced(null);
    renderPlaceList();
  }
  function finishPlacementMode() {
    $("#placeMode").classList.add("done");
    $("#sysTip").textContent = "";
    flashGreet(C.global.finishThanks, C.global.finishThanksNote, true);
  }
  function showEnding() {
    if (state.kept.length > 0) showPlacementMode();
    else {
      $("#placeMode").classList.add("show", "done");
      $("#sysTip").textContent = "";
      flashGreet("好啦，冰箱清爽晒。辛苦喇，坐低饮啖水先。", "好了，冰箱清爽多了。辛苦了，先坐下来喝口水。", true);
    }
  }

  // ---- 事件 ----
  stage.addEventListener("click", e => {
    if (EDIT) return;
    if ($("#placeMode").classList.contains("show")) return;
    const item = e.target.closest(".item");
    if (item) { openItem(item.dataset.id); return; }
    if (e.target.closest("#bag")) { openPanel("kept"); return; }
    if (e.target.closest("#bin")) { openPanel("tossed"); return; }
  });
  modal.querySelectorAll(".choice").forEach(b =>
    b.addEventListener("click", () => chooseWithButton(b)));
  overlay.addEventListener("click", e => {
    if (e.target.classList.contains("dim") || e.target.hasAttribute("data-close")) closeOverlay();
  });
  $("#place-smaller").addEventListener("click", () => adjustPlaced("scale", -.08));
  $("#place-larger").addEventListener("click", () => adjustPlaced("scale", .08));
  $("#place-rot-left").addEventListener("click", () => adjustPlaced("rotate", -6));
  $("#place-rot-right").addEventListener("click", () => adjustPlaced("rotate", 6));
  $("#placeDone").addEventListener("click", finishPlacementMode);
  $("#restartGame").addEventListener("click", () => location.reload());

  // ===================== 编辑模式 =====================
  function initEdit() {
    document.body.classList.add("editing");
    $("#edbar").classList.add("on");

    // 文案可编辑：物品（双击物品打开“编辑卡”）+ 全局气泡
    makeEditable($("#sysTip"), () => C.global, "systemTip", true);
    $("#greet").querySelectorAll("[data-gfield]").forEach(el =>
      bindField(el, () => C.global, el.dataset.gfield));

    enableDrag();
    initLayoutControls();
    document.addEventListener("dblclick", e => {
      const item = e.target.closest(".item");
      if (item) openEditCard(item.dataset.id);
    });

    $("#ed-save").onclick = saveLocal;
    $("#ed-export").onclick = exportJSON;
    $("#ed-smaller").onclick = () => resizeSelected(-0.5);
    $("#ed-larger").onclick = () => resizeSelected(0.5);
    ["x", "y", "w"].forEach(key => {
      const input = $("#ed-" + key);
      input.addEventListener("input", () => updateSelectedFromInputs());
    });
    syncEditInputs();
    $("#ed-reset").onclick = () => {
      if (confirm("清空本地改动并刷新？")) {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LAYOUT_KEY);
        location.reload();
      }
    };
  }

  // 让某节点 contenteditable，失焦写回数据对象
  function bindField(el, getObj, key) {
    el.setAttribute("contenteditable", "true");
    el.addEventListener("blur", () => { getObj()[key] = el.textContent.trim(); });
  }
  function makeEditable(el, getObj, key) { bindField(el, getObj, key); }

  // 拖拽摆位
  let selected = null;
  function labelForTarget(target) {
    if (!target) return "未选中";
    if (target.type === "item") return byId(target.id)?.name || target.id;
    return target.id === "grandma" ? "阿婆" : target.id === "bag" ? "红塑料袋" : "垃圾桶";
  }
  function dataForTarget(type, id) {
    return type === "item" ? byId(id).position : L[id];
  }
  function setTargetStyle(target) {
    const data = dataForTarget(target.type, target.id);
    if (target.type === "item") {
      target.el.style.left = data.x + "%";
      target.el.style.top = data.y + "%";
      target.el.style.width = data.w + "%";
    } else {
      target.el.style.left = data.x + "%";
      target.el.style.bottom = data.y + "%";
      target.el.style.width = data.w + "%";
    }
    syncEditInputs();
  }
  function syncEditInputs() {
    const fields = ["x", "y", "w"];
    fields.forEach(key => {
      const input = $("#ed-" + key);
      if (!input) return;
      input.disabled = !selected;
      input.value = selected ? dataForTarget(selected.type, selected.id)[key] : "";
    });
  }
  function updateSelectedFromInputs() {
    if (!selected) return;
    const data = dataForTarget(selected.type, selected.id);
    ["x", "y", "w"].forEach(key => {
      const input = $("#ed-" + key);
      const value = parseFloat(input.value);
      if (Number.isFinite(value)) data[key] = +(key === "w" ? Math.max(1, value) : value).toFixed(2);
    });
    setTargetStyle(selected);
  }
  function selectTarget(target) {
    document.querySelectorAll(".ed-selected").forEach(el => el.classList.remove("ed-selected"));
    selected = target;
    if (selected) selected.el.classList.add("ed-selected");
    const label = $("#ed-current");
    if (label) label.textContent = labelForTarget(selected);
    syncEditInputs();
  }
  function targetFromEvent(e) {
    const item = e.target.closest(".item");
    if (item) return { type: "item", id: item.dataset.id, el: item };
    const scene = e.target.closest("#grandma,#bag,#bin");
    if (scene) return { type: "scene", id: scene.dataset.sceneId || scene.id, el: scene };
    return null;
  }
  function resizeSelected(delta) {
    if (!selected) return;
    const data = dataForTarget(selected.type, selected.id);
    data.w = Math.max(1, +(data.w + delta).toFixed(2));
    setTargetStyle(selected);
  }
  function moveSelected(dx, dy) {
    if (!selected) return;
    const data = dataForTarget(selected.type, selected.id);
    data.x = +(data.x + dx).toFixed(2);
    data.y = +(data.y + dy).toFixed(2);
    setTargetStyle(selected);
  }
  function initLayoutControls() {
    document.addEventListener("keydown", e => {
      if (!selected || e.target.closest("[contenteditable='true'], input, textarea")) return;
      const step = e.shiftKey ? 1 : 0.2;
      if (e.key === "ArrowLeft") { moveSelected(-step, 0); e.preventDefault(); }
      if (e.key === "ArrowRight") { moveSelected(step, 0); e.preventDefault(); }
      if (e.key === "ArrowUp") { moveSelected(0, selected.type === "item" ? -step : step); e.preventDefault(); }
      if (e.key === "ArrowDown") { moveSelected(0, selected.type === "item" ? step : -step); e.preventDefault(); }
      if (e.key === "+" || e.key === "=") { resizeSelected(0.5); e.preventDefault(); }
      if (e.key === "-" || e.key === "_") { resizeSelected(-0.5); e.preventDefault(); }
    });
  }
  function enableDrag() {
    let drag = null, sx, sy, ox, oy;
    stage.addEventListener("mousedown", e => {
      const target = targetFromEvent(e);
      if (!target) return;
      e.preventDefault();
      selectTarget(target);
      const data = dataForTarget(target.type, target.id);
      drag = target;
      drag.el.classList.add("drag");
      const rect = stage.getBoundingClientRect();
      drag.scale = rect.width / DESIGN_W; // 屏幕像素 → 设计像素
      sx = e.clientX; sy = e.clientY; ox = data.x; oy = data.y;
    });
    addEventListener("mousemove", e => {
      if (!drag) return;
      const rect = stage.getBoundingClientRect();
      const dx = (e.clientX - sx) / rect.width * 100;
      const dy = (e.clientY - sy) / rect.height * 100;
      const data = dataForTarget(drag.type, drag.id);
      data.x = +(ox + dx).toFixed(2);
      data.y = +(drag.type === "item" ? oy + dy : oy - dy).toFixed(2);
      setTargetStyle(drag);
    });
    addEventListener("mouseup", () => { if (drag) { drag.el.classList.remove("drag"); drag = null; } });
  }

  // 双击物品 → 简易编辑卡（改 name/desc_short/story/keep/toss 等）
  function openEditCard(id) {
    const it = byId(id);
    const fields = ["name", "desc_short", "story", "story_note", "keep", "keep_note", "toss", "toss_note"];
    modal.classList.remove("show"); modalBubble.classList.remove("show");
    panel.className = "card noise show";
    panel.querySelector("h3").textContent = `编辑：${it.name}`;
    const list = panel.querySelector(".list");
    list.style.display = "block";
    list.innerHTML = "";
    fields.forEach(f => {
      const row = document.createElement("div");
      row.style.cssText = "width:100%;text-align:left;margin:8px 0;";
      row.innerHTML = `<label style="font-size:12px;color:#9b958a">${f}</label>
        <div contenteditable="true" data-f="${f}"
          style="background:rgba(255,255,255,.06);border-radius:0;padding:6px 10px;font-size:16px;min-height:1.4em">${it[f] ?? ""}</div>`;
      row.querySelector("[data-f]").addEventListener("blur", ev => { it[f] = ev.target.textContent.trim(); });
      list.appendChild(row);
    });
    overlay.classList.add("show");
  }

  function exportData() {
    return { global: C.global, layout: L, items: C.items.map(it => ({
      id: it.id, name: it.name, desc_short: it.desc_short,
      story: it.story, story_note: it.story_note,
      keep: it.keep, keep_note: it.keep_note, toss: it.toss, toss_note: it.toss_note,
      poem_keyword: it.poem_keyword, position: it.position
    })) };
  }
  function saveLocal() {
    localStorage.setItem(LS_KEY, JSON.stringify(exportData()));
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(L));
    flashToast("已保存到本地");
  }
  function exportJSON() {
    saveLocal();
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content-export.json";
    a.click();
  }
  function flashToast(t) {
    let el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast";
      el.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#141210;color:#fff;padding:8px 18px;border-radius:0;z-index:300;font-size:14px"; document.body.appendChild(el); }
    el.textContent = t; el.style.opacity = "1";
    squircle(el);
    setTimeout(() => (el.style.opacity = "0"), 1500);
  }

  // ---- 圆角平滑（squircle / Figma corner smoothing ~100%）----
  const SQ_N = 5.2; // 超椭圆指数，接近 Figma corner smoothing 100%
  function sqPath(w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    const e = 2 / SQ_N, seg = 20;
    const pw = v => Math.sign(v) * Math.pow(Math.abs(v), e);
    const cs = [[w - r, r, -90, 0], [w - r, h - r, 0, 90], [r, h - r, 90, 180], [r, r, 180, 270]];
    const pts = [];
    for (const [cx, cy, a0, a1] of cs)
      for (let i = 0; i <= seg; i++) {
        const a = (a0 + (a1 - a0) * i / seg) * Math.PI / 180;
        pts.push((cx + r * pw(Math.cos(a))).toFixed(2) + "px " + (cy + r * pw(Math.sin(a))).toFixed(2) + "px");
      }
    return "polygon(" + pts.join(",") + ")";
  }
  function setSquircle(el) {
    if (!el) return;
    el.style.clipPath = "none";
  }
  const sqObs = new ResizeObserver(es => es.forEach(en => setSquircle(en.target)));
  function squircle(el) { if (!el) return; setSquircle(el); sqObs.observe(el); }
  function squircleAll() {
    document.querySelectorAll(".bubble, .card, #progress, #edbar button, #toast").forEach(squircle);
  }

  function initCustomCursor() {
    if (!matchMedia("(pointer:fine)").matches) return;
    const cursor = document.createElement("div");
    cursor.id = "cursorHand";
    cursor.innerHTML = `<img src="res/cursors/hand-cursor-clean-48.png" alt="">`;
    document.body.appendChild(cursor);
    document.body.classList.add("cursor-ready");

    let x = -100, y = -100, raf = 0;
    const paint = () => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = 0;
    };
    const move = e => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add("visible");
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const down = e => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      cursor.classList.add("down");
    };
    const up = () => cursor.classList.remove("down");
    const hide = () => {
      cursor.classList.remove("visible", "down");
      x = -100; y = -100;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    addEventListener("pointercancel", up, { passive: true });
    addEventListener("blur", hide);
    document.addEventListener("mouseleave", hide);
  }

  // ---- 启动 ----
  initBgmToggle();
  initCustomCursor();
  fit();
  renderStatic();
  applySceneLayout();
  renderItems();
  warmupItemAudio();
  squircleAll();
  if (EDIT) initEdit();
})();
