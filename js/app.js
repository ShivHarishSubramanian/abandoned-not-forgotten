/* ============================================================
   Abandoned but not Forgotten — app.js
   Vanilla JS, no dependencies. Structure:
     1. Starfield background
     2. Data loading (artifacts.json, fetch with embedded fallback)
     3. NASA image lookup (Image & Video Library API, timeout + cache)
     4. Artifact card rendering + filters
     5. Interactive Moon/Mars map (canvas pins)
     6. Timeline
     7. Text-to-speech ("Listen")
     8. Memorial wall (in-memory only)
     9. Quiz
   ============================================================ */
"use strict";

/* ---------- 1. Starfield ---------- */
(function starfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      p: Math.random() * Math.PI * 2, // twinkle phase
      s: 0.4 + Math.random() * 1.2     // twinkle speed
    }));
    if (reduced) draw();
  }

  function draw(t = 0) {
    ctx.clearRect(0, 0, w, h);
    for (const st of stars) {
      const a = reduced ? 0.7 : 0.35 + 0.45 * Math.sin(t * 0.001 * st.s + st.p);
      ctx.globalAlpha = Math.max(0.1, a);
      ctx.fillStyle = "#dbeafe";
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    draw(t);
    if (!reduced) requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);
})();

/* ---------- Fallback data (used if artifacts.json fails, e.g. file:// quirks) ---------- */
const FALLBACK_ARTIFACTS = [
  {
    id: "offline-fallback", name: "Offline mode", body: "moon", mission: "—", year: "—",
    location: "—", status: "data unavailable", whatLeftBehind: "—",
    firstPersonStory: "The artifact data could not be loaded. Check your connection or serve the site over HTTP.",
    keyFacts: [], lastSignalOrActivity: "—", sourceNote: "—",
    approxLat: 0, approxLon: 0, tags: []
  }
];

/* ---------- 2. NASA image cache (JS variable only) ---------- */
const nasaImageCache = {}; // term -> Promise<{url, title, pageUrl} | null>

function fetchNasaImage(term) {
  if (nasaImageCache[term]) return nasaImageCache[term];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  const url = "https://images-api.nasa.gov/search?q=" +
    encodeURIComponent(term) + "&media_type=image";
  nasaImageCache[term] = fetch(url, { signal: ctrl.signal })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      clearTimeout(timer);
      const items = data && data.collection && data.collection.items;
      if (!items || !items.length) return null;
      // Pick the first item with usable metadata.
      const first = items[0];
      const preview = first.links && first.links[0] && first.links[0].href;
      const nasaId = first.data && first.data.nasa_id;
      return {
        thumb: preview || null,
        title: (first.data && first.data.title) || term,
        pageUrl: nasaId
          ? "https://images.nasa.gov/details/" + encodeURIComponent(nasaId)
          : "https://images.nasa.gov/"
      };
    })
    .catch(() => { clearTimeout(timer); return null; });
  return nasaImageCache[term];
}

/* NASA asset page link */
function nasaAssetPageUrl(pageUrl) {
  return pageUrl || "https://images.nasa.gov/";
}

/* ---------- 3. SVG fallback illustrations ---------- */
function svgFallback(body) {
  const isMoon = body === "moon";
  const base = isMoon ? "#cbd5e1" : "#fb923c";
  const dark = isMoon ? "#64748b" : "#9a3412";
  const label = isMoon ? "Moon" : "Mars";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" role="img" aria-label="Illustration of ' + label + '">' +
    '<rect width="320" height="170" fill="#0a0f1e"/>' +
    '<circle cx="160" cy="85" r="52" fill="' + base + '" opacity="0.9"/>' +
    '<circle cx="142" cy="70" r="9" fill="' + dark + '" opacity="0.5"/>' +
    '<circle cx="178" cy="98" r="6" fill="' + dark + '" opacity="0.5"/>' +
    '<circle cx="170" cy="66" r="4" fill="' + dark + '" opacity="0.4"/>' +
    '<text x="160" y="160" text-anchor="middle" fill="#a8b3d0" font-size="11" font-family="sans-serif">' + label + ' artifact — original SVG illustration</text>' +
    '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ---------- 4. Card rendering ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function buildCard(a) {
  const article = document.createElement("article");
  article.className = "card";
  article.id = "card-" + a.id;
  article.dataset.body = a.body;

  const badges =
    '<div class="card-badges">' +
    '<span class="badge ' + a.body + '">' + a.body + '</span>' +
    '<span class="badge">' + escapeHtml(a.mission) + ' · ' + escapeHtml(String(a.year)) + '</span>' +
    '<span class="badge status">' + escapeHtml(a.status) + '</span>' +
    '</div>';

  const facts = (a.keyFacts || []).map(f => "<li>" + escapeHtml(f) + "</li>").join("");

  article.innerHTML =
    badges +
    "<h3>" + escapeHtml(a.name) + "</h3>" +
    '<p class="mission-line">' + escapeHtml(a.location) + "</p>" +
    '<div class="nasa-img-wrap" data-term="' + escapeHtml(a.name.split(" ").slice(0, 3).join(" ")) + '">' +
      '<img class="card-image" src="' + svgFallback(a.body) + '" alt="Illustration representing ' + escapeHtml(a.name) + '" loading="lazy" />' +
    '</div>' +
    '<p class="card-credit nasa-credit" hidden></p>' +
    '<p class="card-story">' + escapeHtml(a.firstPersonStory) + "</p>" +
    (facts ? '<ul class="card-facts">' + facts + "</ul>" : "") +
    '<p class="last-signal"><strong>Last signal / activity:</strong> ' + escapeHtml(a.lastSignalOrActivity) + "</p>" +
    '<div class="card-actions">' +
      '<button class="btn primary listen-btn" type="button" aria-pressed="false">&#9654; Listen</button>' +
      '<span class="speech-status" aria-live="polite"></span>' +
      '<a class="btn" href="https://nssdc.gsfc.nasa.gov/" target="_blank" rel="noopener">NSSDC catalog</a>' +
    '</div>';

  // Attach speech + NASA image lookup.
  const btn = article.querySelector(".listen-btn");
  const status = article.querySelector(".speech-status");
  const imgWrap = article.querySelector(".nasa-img-wrap");
  const img = article.querySelector(".card-image");
  const credit = article.querySelector(".nasa-credit");
  const term = imgWrap.dataset.term;

  btn.addEventListener("click", () => toggleSpeech(a, btn, status));

  fetchNasaImage(term).then(res => {
    if (!res || !res.thumb) return;
    const proxy = res.thumb; // NASA API returns absolute image URLs
    const probe = new Image();
    probe.onload = () => {
      img.src = proxy;
      img.alt = "NASA image related to " + a.name + ": " + res.title;
      credit.hidden = false;
      credit.innerHTML = 'Image: <a href="' + escapeHtml(nasaAssetPageUrl(res.pageUrl)) +
        '" target="_blank" rel="noopener">NASA Image and Video Library</a> — ' +
        escapeHtml(res.title);
      // Wrap in link
      const link = document.createElement("a");
      link.href = nasaAssetPageUrl(res.pageUrl);
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "nasa-img-link";
      link.textContent = "View on NASA Image Library ↗";
      imgWrap.appendChild(link);
    };
    probe.onerror = () => { /* keep SVG fallback */ };
    probe.src = proxy;
  });

  return article;
}

/* ---------- 5. Text-to-speech ---------- */
let currentUtterance = null;

function toggleSpeech(a, btn, status) {
  if (!("speechSynthesis" in window)) {
    status.textContent = "Read-aloud is not supported in this browser.";
    return;
  }
  if (currentUtterance && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
    document.querySelectorAll(".listen-btn").forEach(b => {
      b.setAttribute("aria-pressed", "false");
      b.innerHTML = "&#9654; Listen";
    });
    document.querySelectorAll(".speech-status").forEach(s => { s.textContent = ""; });
    return;
  }
  const text = a.name + ". " + a.firstPersonStory + " Key facts: " +
    (a.keyFacts || []).join(" ") + ". Last signal or activity: " + a.lastSignalOrActivity + ".";
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.onend = u.onerror = () => {
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = "&#9654; Listen";
    status.textContent = "";
    currentUtterance = null;
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  currentUtterance = u;
  btn.setAttribute("aria-pressed", "true");
  btn.innerHTML = "&#10074;&#10074; Pause";
  status.textContent = "Reading aloud…";
}

/* ---------- 6. Filters ---------- */
function wireFilters(buttonSelector, itemSelector, attr) {
  document.querySelectorAll(buttonSelector).forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(buttonSelector).forEach(b => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      const f = btn.dataset.filter || btn.dataset.timelineFilter;
      document.querySelectorAll(itemSelector).forEach(el => {
        el.classList.toggle("hidden", f !== "all" && el.dataset[attr] !== f);
      });
    });
  });
}

/* ---------- 7. Interactive map ---------- */
const mapState = { body: "moon", hover: null };

function drawMap() {
  const canvas = document.getElementById("map-canvas");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const W = 640, H = 360;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.aspectRatio = W + "/" + H;
  ctx.scale(dpr, dpr);

  const isMoon = mapState.body === "moon";
  const cx = W / 2, cy = H / 2, r = 130;
  const bodyColor = isMoon ? "#cbd5e1" : "#fb923c";
  const edgeColor = isMoon ? "#64748b" : "#9a3412";

  ctx.clearRect(0, 0, W, H);

  // disc
  const grad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, r);
  grad.addColorStop(0, bodyColor);
  grad.addColorStop(1, edgeColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // craters / surface detail (deterministic pseudo-random)
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  const seed = isMoon ? 7 : 13;
  for (let i = 0; i < 14; i++) {
    const a = (i * seed * 2.399) % (Math.PI * 2);
    const d = (i * 37 + seed * 11) % (r * 0.75);
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    const cr = 4 + ((i * 13 + seed) % 14);
    ctx.beginPath();
    ctx.arc(px, py, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // pins for artifacts on this body
  const items = window.__artifacts.filter(a => a.body === mapState.body);
  items.forEach(a => {
    // equirectangular-ish projection onto disc
    const lon = parseFloat(a.approxLon);
    const lat = parseFloat(a.approxLat);
    const x = cx + (lon / 180) * r * 0.92;
    const y = cy - (lat / 90) * r * 0.92;
    const hovered = mapState.hover === a.id;
    ctx.fillStyle = hovered ? "#fbbf24" : "#7dd3fc";
    ctx.strokeStyle = "#04121f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, hovered ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // labels for hovered pin
  if (mapState.hover) {
    const a = items.find(i => i.id === mapState.hover);
    if (a) {
      const lon = parseFloat(a.approxLon), lat = parseFloat(a.approxLat);
      const x = cx + (lon / 180) * r * 0.92;
      const y = cy - (lat / 90) * r * 0.92 - 14;
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#e8ecf8";
      ctx.strokeStyle = "#04121f";
      ctx.lineWidth = 3;
      ctx.strokeText(a.name, x, y);
      ctx.fillText(a.name, x, y);
    }
  }

  updateLegend(items);
}

function updateLegend(items) {
  const ul = document.getElementById("map-legend");
  ul.innerHTML = "";
  items.forEach(a => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = a.name;
    b.addEventListener("click", () => {
      const card = document.getElementById("card-" + a.id);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlight");
        setTimeout(() => card.classList.remove("highlight"), 2200);
      }
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
}

function wireMap() {
  const canvas = document.getElementById("map-canvas");
  const moonBtn = document.getElementById("btn-moon");
  const marsBtn = document.getElementById("btn-mars");

  function setBody(body) {
    mapState.body = body;
    moonBtn.classList.toggle("active", body === "moon");
    marsBtn.classList.toggle("active", body === "mars");
    moonBtn.setAttribute("aria-selected", body === "moon" ? "true" : "false");
    marsBtn.setAttribute("aria-selected", body === "mars" ? "true" : "false");
    mapState.hover = null;
    drawMap();
  }
  moonBtn.addEventListener("click", () => setBody("moon"));
  marsBtn.addEventListener("click", () => setBody("mars"));

  function pinAt(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 360 / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    const cx = 320, cy = 180, r = 130;
    const items = window.__artifacts.filter(a => a.body === mapState.body);
    for (const a of items) {
      const px = cx + (parseFloat(a.approxLon) / 180) * r * 0.92;
      const py = cy - (parseFloat(a.approxLat) / 90) * r * 0.92;
      if (Math.hypot(x - px, y - py) < 12) return a.id;
    }
    return null;
  }

  canvas.addEventListener("mousemove", evt => {
    const id = pinAt(evt);
    if (id !== mapState.hover) { mapState.hover = id; drawMap(); }
  });
  canvas.addEventListener("mouseleave", () => { mapState.hover = null; drawMap(); });
  canvas.addEventListener("click", evt => {
    const id = pinAt(evt);
    if (id) {
      const card = document.getElementById("card-" + id);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

/* ---------- 8. Timeline ---------- */
function buildTimeline(artifacts) {
  const list = document.getElementById("timeline-list");
  const sorted = [...artifacts].sort((a, b) => {
    const ya = parseInt(a.year, 10) || 9999;
    const yb = parseInt(b.year, 10) || 9999;
    return ya - yb;
  });
  sorted.forEach(a => {
    const li = document.createElement("li");
    li.dataset.body = a.body;
    li.className = a.body === "mars" ? "mars" : "moon";
    li.innerHTML =
      '<span class="tl-year">' + escapeHtml(String(a.year)) + "</span>" +
      '<span class="tl-name">' + escapeHtml(a.name) + '</span>' +
      '<span class="tl-body">' + escapeHtml(a.body === "moon" ? "Moon" : "Mars") + "</span>";
    list.appendChild(li);
  });
}

/* ---------- 9. Memorial wall (memory only) ---------- */
function wireEpitaph(artifacts) {
  const form = document.getElementById("epitaph-form");
  const select = document.getElementById("epitaph-artifact");
  const input = document.getElementById("epitaph-text");
  const wall = document.getElementById("memorial-wall");
  const error = document.getElementById("epitaph-error");
  const tributes = []; // in-memory only

  artifacts.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    select.appendChild(opt);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim().replace(/\s+/g, " ");
    if (!text) {
      error.textContent = "Please write a tribute first.";
      error.hidden = false;
      return;
    }
    if (text.length > 140) {
      error.textContent = "Tributes are limited to 140 characters.";
      error.hidden = false;
      return;
    }
    // Light content filter: block obvious abuse patterns only.
    if (/(<|>|script|http)/i.test(text)) {
      error.textContent = "Please keep tributes respectful and free of links or markup.";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const artifact = artifacts.find(a => a.id === select.value);
    tributes.push({ text, artifactName: artifact ? artifact.name : select.value });
    renderWall();
    input.value = "";
    input.focus();
  });

  function renderWall() {
    wall.innerHTML = "";
    tributes.forEach((t, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.className = "wall-artifact";
      span.textContent = t.artifactName;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "wall-remove";
      remove.textContent = "remove";
      remove.setAttribute("aria-label", "Remove this tribute");
      remove.addEventListener("click", () => {
        tributes.splice(i, 1);
        renderWall();
      });
      li.appendChild(span);
      li.appendChild(document.createTextNode("\u201C" + t.text + "\u201D "));
      li.appendChild(remove);
      wall.appendChild(li);
    });
    if (!tributes.length) {
      const li = document.createElement("li");
      li.textContent = "The wall is empty. Be the first to leave a tribute.";
      li.style.fontStyle = "normal";
      li.style.color = "var(--text-dim)";
      wall.appendChild(li);
    }
  }
  renderWall();
}

/* ---------- 10. Quiz ---------- */
function buildQuiz(artifacts) {
  const container = document.getElementById("quiz-container");
  const usable = artifacts.filter(a => a.keyFacts && a.keyFacts.length >= 2);

  // Deterministic shuffle helper.
  function shuffle(arr) {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  const questions = [];

  // Q type 1: "Which artifact…?" using a key fact as the answer hint.
  const factPool = [];
  usable.forEach(a => a.keyFacts.forEach(f => factPool.push({ a, f })));
  shuffle(factPool).slice(0, 3).forEach(({ a, f }) => {
    const distractors = shuffle(usable.filter(x => x.id !== a.id)).slice(0, 3).map(x => x.name);
    questions.push({
      q: "Which artifact is described by this fact? \u201C" + f + "\u201D",
      options: shuffle([a.name, ...distractors]),
      answer: a.name,
      explain: a.name + " — " + a.mission + ", " + a.year + ". " + a.location + "."
    });
  });

  // Q type 2: body identification.
  shuffle(usable).slice(0, 2).forEach(a => {
    questions.push({
      q: "Where is \u201C" + a.name + "\u201D located?",
      options: shuffle([a.body === "moon" ? "The Moon" : "Mars", a.body === "moon" ? "Mars" : "The Moon", "Earth orbit", "Deep space"]),
      answer: a.body === "moon" ? "The Moon" : "Mars",
      explain: a.name + " is on " + (a.body === "moon" ? "the Moon" : "Mars") + " (" + a.location + ")."
    });
  });

  // Q type 3: year ordering / status.
  const sorted = [...usable].sort((x, y) => (parseInt(x.year, 10) || 0) - (parseInt(y.year, 10) || 0));
  const earliest = sorted[0];
  questions.push({
    q: "Which of these artifacts was left behind first?",
    options: shuffle([earliest.name, ...shuffle(sorted.slice(-3)).map(x => x.name)]),
    answer: earliest.name,
    explain: earliest.name + " (" + earliest.year + ") predates the others listed."
  });

  const quiz = shuffle(questions).slice(0, 6);
  let idx = 0, score = 0, results = [];

  function render() {
    container.innerHTML = "";
    if (idx >= quiz.length) {
      const review = results.map(r =>
        '<li>' + (r.correct ? "✓" : "✗") + " " + escapeHtml(r.q) +
        " — answer: " + escapeHtml(r.answer) + ". " + escapeHtml(r.explain) + "</li>"
      ).join("");
      container.innerHTML =
        '<div class="quiz-card">' +
        '<p class="quiz-score">You scored <strong>' + score + " / " + quiz.length + "</strong>.</p>" +
        '<ul class="quiz-review">' + review + "</ul>" +
        '<button class="btn primary" id="quiz-restart" type="button">Try again</button>' +
        "</div>";
      document.getElementById("quiz-restart").addEventListener("click", () => { idx = 0; score = 0; results = []; render(); });
      return;
    }
    const q = quiz[idx];
    const card = document.createElement("div");
    card.className = "quiz-card";
    card.innerHTML =
      '<p class="quiz-progress">Question ' + (idx + 1) + " of " + quiz.length + "</p>" +
      '<p class="quiz-question">' + escapeHtml(q.q) + "</p>" +
      '<div class="quiz-options">' +
      q.options.map((o, i) =>
        '<button class="quiz-option" type="button" data-i="' + i + '">' + escapeHtml(o) + "</button>"
      ).join("") +
      "</div>" +
      '<div class="quiz-explanation" hidden></div>';
    container.appendChild(card);

    const expl = card.querySelector(".quiz-explanation");
    card.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen = q.options[parseInt(btn.dataset.i, 10)];
        const correct = chosen === q.answer;
        if (correct) score++;
        results.push({ q: q.q, correct, answer: q.answer, explain: q.explain });
        card.querySelectorAll(".quiz-option").forEach(b => {
          b.disabled = true;
          if (q.options[parseInt(b.dataset.i, 10)] === q.answer) b.classList.add("correct");
        });
        if (!correct) btn.classList.add("wrong");
        expl.hidden = false;
        expl.textContent = (correct ? "Correct. " : "Not quite. ") + q.explain;
        const next = document.createElement("button");
        next.className = "btn primary";
        next.type = "button";
        next.textContent = idx === quiz.length - 1 ? "See results" : "Next question";
        next.style.marginTop = "0.8rem";
        next.addEventListener("click", () => { idx++; render(); });
        expl.appendChild(document.createElement("br"));
        expl.appendChild(next);
      });
    });
  }
  render();
}

/* ---------- Boot ---------- */
(async function init() {
  let artifacts;
  try {
    const res = await fetch("data/artifacts.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    artifacts = await res.json();
  } catch (err) {
    artifacts = FALLBACK_ARTIFACTS;
  }
  window.__artifacts = artifacts;

  const grid = document.getElementById("artifact-grid");
  artifacts.forEach(a => grid.appendChild(buildCard(a)));

  buildTimeline(artifacts);
  wireFilters(".filter-btn[data-filter]", ".card", "body");
  wireFilters(".filter-btn[data-timeline-filter]", "#timeline-list li", "body");
  wireMap();
  wireEpitaph(artifacts);
  buildQuiz(artifacts);
  drawMap();
})();
