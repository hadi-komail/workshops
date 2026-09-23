/* ==========================================================================
   "Wie weit gehst du?" — solo play engine.
   Walks GAME_QUESTIONS in order, one at a time, form-style. No branching:
   the same fixed sequence every time. Renders into #gameStage. No network.
   ========================================================================== */

(function () {
  "use strict";

  var stage = document.getElementById("gameStage");
  if (!stage || typeof GAME_QUESTIONS === "undefined") return;
  if (new URLSearchParams(window.location.search).get("code")) return; // group mode handles this page instead

  var state = {
    index: 0,
    history: [],          // {questionId, label, tags}
    reflectionAnswer: null
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function clearStage() { stage.innerHTML = ""; }

  function renderProgress(index, total) {
    var wrap = el("div", "progress-wrap");
    var track = el("div", "progress-track");
    var fill = el("div", "progress-fill");
    fill.style.width = Math.round((index / total) * 100) + "%";
    track.appendChild(fill);
    wrap.appendChild(track);
    wrap.appendChild(el("span", "progress-label", "Frage " + (index + 1) + " von " + total));
    return wrap;
  }

  function renderImage(q) {
    if (!q.image) return null;
    var img = document.createElement("img");
    img.className = "scene-image";
    img.src = q.image;
    img.alt = q.imageAlt || "";
    img.loading = "lazy";
    img.addEventListener("error", function () { img.remove(); });
    return img;
  }

  function renderMeta(q) {
    var meta = el("div", "scene-meta");
    meta.appendChild(el("span", "level-badge", q.theme.toUpperCase()));
    if (q.location) meta.appendChild(el("span", "scene-location", q.location));
    return meta;
  }

  function renderNarration(q) {
    var wrap = el("div", "scene-narration");
    (q.text || []).forEach(function (line) {
      wrap.appendChild(el("p", "narration-line", line));
    });
    if (q.line) {
      var quote = el("div", "scene-quote");
      quote.appendChild(el("span", "quote-who", q.line.who));
      quote.appendChild(el("p", "quote-text", q.line.text));
      wrap.appendChild(quote);
    }
    return wrap;
  }

  function renderQuestion() {
    var q = GAME_QUESTIONS[state.index];
    clearStage();
    stage.appendChild(renderProgress(state.index, GAME_QUESTIONS.length));
    var img = renderImage(q);
    if (img) stage.appendChild(img);
    stage.appendChild(renderMeta(q));
    stage.appendChild(renderNarration(q));
    stage.appendChild(el("p", "scene-prompt", q.prompt));

    var wrap = el("div", "scene-choices");
    q.options.forEach(function (opt) {
      var btn = el("button", "choice-btn", opt.label);
      btn.type = "button";
      btn.addEventListener("click", function () {
        state.history.push({ questionId: q.id, label: opt.label, tags: opt.tags || [] });
        state.index++;
        if (state.index < GAME_QUESTIONS.length) {
          renderQuestion();
        } else {
          renderReflection();
        }
        stage.scrollIntoView({ block: "start" });
      });
      wrap.appendChild(btn);
    });
    stage.appendChild(wrap);
  }

  function renderReflection() {
    clearStage();
    stage.appendChild(el("p", "scene-prompt scene-prompt-lg", GAME_REFLECTION.prompt));
    var wrap = el("div", "scene-choices scene-choices-grid");
    GAME_REFLECTION.options.forEach(function (opt) {
      var btn = el("button", "choice-btn", opt);
      btn.type = "button";
      btn.addEventListener("click", function () {
        state.reflectionAnswer = opt;
        renderProfile();
        stage.scrollIntoView({ block: "start" });
      });
      wrap.appendChild(btn);
    });
    stage.appendChild(wrap);
  }

  function pct(count, total) { return total === 0 ? 0 : Math.round((count / total) * 100); }

  function renderProfile() {
    clearStage();
    var total = state.history.length;
    var esc = state.history.filter(function (h) { return h.tags.indexOf("escalate") !== -1; }).length;
    var deesc = state.history.filter(function (h) { return h.tags.indexOf("deescalate") !== -1; }).length;
    var peer = state.history.filter(function (h) { return h.tags.indexOf("peerPressure") !== -1; }).length;
    var help = state.history.filter(function (h) { return h.tags.indexOf("helpSought") !== -1; }).length;

    var bars = [
      { label: "Eskalation", value: pct(esc, total) },
      { label: "Deeskalation", value: pct(deesc, total) },
      { label: "Entscheidungen unter Gruppendruck", value: pct(peer, total) },
      { label: "Hilfe gesucht", value: pct(help, total) }
    ];

    var wrap = el("div", "profile-panel");
    wrap.appendChild(el("h2", "profile-title", "DEIN SPIELVERLAUF"));
    if (state.reflectionAnswer) {
      var infl = el("p", "profile-influence");
      infl.appendChild(document.createTextNode("Am meisten beeinflusst hat dich: "));
      infl.appendChild(el("strong", null, state.reflectionAnswer));
      wrap.appendChild(infl);
    }
    bars.forEach(function (b) {
      var row = el("div", "profile-bar-row");
      row.appendChild(el("div", "profile-bar-label", b.label));
      var track = el("div", "profile-bar-track");
      var fill = el("div", "profile-bar-fill");
      fill.style.width = b.value + "%";
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(el("div", "profile-bar-pct", b.value + "%"));
      wrap.appendChild(row);
    });
    wrap.appendChild(el("p", "profile-note",
      "Du hast allein gespielt — es gibt keine Gruppe zum Vergleichen. " +
      "Spielt gemeinsam mit einem Teamer-Code, um eure Entscheidungen zu vergleichen."));
    wrap.appendChild(el("p", "profile-disclaimer",
      "Diese Werte beschreiben nur deine Entscheidungen im Spiel. " +
      "Sie sagen nichts darüber aus, wie du dich im echten Leben verhalten würdest."));
    var restart = el("button", "choice-btn", "Neu starten");
    restart.type = "button";
    restart.addEventListener("click", function () {
      state.index = 0;
      state.history = [];
      state.reflectionAnswer = null;
      renderQuestion();
    });
    wrap.appendChild(restart);
    stage.appendChild(wrap);
  }

  renderQuestion();
})();
