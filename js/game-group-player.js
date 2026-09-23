/* ==========================================================================
   "Wie weit gehst du?" — group mode, player side.
   Active only when the URL has ?code=XXXX. Player answers each fixed
   question privately on their own phone; the facilitator (host screen)
   advances everyone at once. At the end, fetches every player's answers
   and shows a personal-vs-group comparison. Runs alongside game-engine.js,
   which no-ops when ?code is present.
   ========================================================================== */

(function () {
  "use strict";

  var code = new URLSearchParams(window.location.search).get("code");
  var stage = document.getElementById("gameStage");
  if (!code || !stage || typeof GAME_QUESTIONS === "undefined" || typeof GameGroup === "undefined") return;

  code = code.trim().toUpperCase();

  var playerId = null;
  var history = [];
  var reflectionAnswer = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function clearStage() { stage.innerHTML = ""; }

  function questionById(id) {
    for (var i = 0; i < GAME_QUESTIONS.length; i++) if (GAME_QUESTIONS[i].id === id) return GAME_QUESTIONS[i];
    return null;
  }

  function renderJoinForm(errorMsg) {
    clearStage();
    var panel = el("div", "game-mode-card");
    panel.appendChild(el("h3", null, "Session " + code));
    panel.appendChild(el("p", null, "Gib deinen Namen ein, um beizutreten."));
    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Dein Name";
    input.maxLength = 30;
    panel.appendChild(input);
    if (errorMsg) panel.appendChild(el("p", "game-note", errorMsg));
    var btn = el("button", "game-cta", "Beitreten");
    btn.type = "button";
    btn.addEventListener("click", function () {
      var name = input.value.trim();
      if (!name) return;
      btn.disabled = true;
      btn.textContent = "Wird beigetreten …";
      doJoin(name);
    });
    panel.appendChild(btn);
    stage.appendChild(panel);
  }

  function doJoin(name) {
    GameGroup.getSession(code).then(function (result) {
      if (result.error || !result.data) {
        renderJoinForm("Session nicht gefunden oder bereits beendet. Bitte Code prüfen.");
        return;
      }
      GameGroup.joinSession(code, name).then(function (joinResult) {
        if (joinResult.error) {
          renderJoinForm("Beitritt fehlgeschlagen. Bitte erneut versuchen.");
          return;
        }
        playerId = joinResult.player.id;
        try { sessionStorage.setItem("game-player-" + code, playerId); } catch (e) { /* no-op */ }
        startSync(result.data.current_scene);
      });
    });
  }

  function startSync(initialSceneId) {
    renderStep(initialSceneId);
    GameGroup.onSessionChange(code, function (session) { renderStep(session.current_scene); });
  }

  function renderNarration(q) {
    var wrap = el("div", "scene-narration");
    (q.text || []).forEach(function (line) { wrap.appendChild(el("p", "narration-line", line)); });
    if (q.line) {
      var quote = el("div", "scene-quote");
      quote.appendChild(el("span", "quote-who", q.line.who));
      quote.appendChild(el("p", "quote-text", q.line.text));
      wrap.appendChild(quote);
    }
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

  function renderWaiting(chosenLabel) {
    clearStage();
    var panel = el("div", "waiting-panel");
    if (chosenLabel) panel.appendChild(el("p", "waiting-choice", "„" + chosenLabel + "“"));
    var p = el("p", null, null);
    p.appendChild(document.createTextNode("Warte auf die Gruppe "));
    p.appendChild(el("span", "waiting-dot", "•"));
    p.appendChild(el("span", "waiting-dot", "•"));
    p.appendChild(el("span", "waiting-dot", "•"));
    panel.appendChild(p);
    stage.appendChild(panel);
  }

  function pct(count, total) { return total === 0 ? 0 : Math.round((count / total) * 100); }

  function renderResults() {
    clearStage();
    var total = history.length;
    var esc = history.filter(function (h) { return h.tags.indexOf("escalate") !== -1; }).length;
    var deesc = history.filter(function (h) { return h.tags.indexOf("deescalate") !== -1; }).length;
    var peer = history.filter(function (h) { return h.tags.indexOf("peerPressure") !== -1; }).length;
    var help = history.filter(function (h) { return h.tags.indexOf("helpSought") !== -1; }).length;
    var mine = {
      escalate: pct(esc, total), deescalate: pct(deesc, total),
      peerPressure: pct(peer, total), helpSought: pct(help, total)
    };

    var wrap = el("div", "profile-panel");
    wrap.appendChild(el("h2", "profile-title", "DEIN SPIELVERLAUF"));
    if (reflectionAnswer) {
      var infl = el("p", "profile-influence");
      infl.appendChild(document.createTextNode("Am meisten beeinflusst hat dich: "));
      infl.appendChild(el("strong", null, reflectionAnswer));
      wrap.appendChild(infl);
    }
    stage.appendChild(wrap);

    GameGroup.fetchAllChoices(code).then(function (rows) {
      var total2 = rows.length || 1;
      var gEsc = rows.filter(function (r) { return (r.tags || []).indexOf("escalate") !== -1; }).length;
      var gDeesc = rows.filter(function (r) { return (r.tags || []).indexOf("deescalate") !== -1; }).length;
      var gPeer = rows.filter(function (r) { return (r.tags || []).indexOf("peerPressure") !== -1; }).length;
      var gHelp = rows.filter(function (r) { return (r.tags || []).indexOf("helpSought") !== -1; }).length;
      var group = {
        escalate: pct(gEsc, total2), deescalate: pct(gDeesc, total2),
        peerPressure: pct(gPeer, total2), helpSought: pct(gHelp, total2)
      };

      [
        { label: "Eskalation", mine: mine.escalate, group: group.escalate },
        { label: "Deeskalation", mine: mine.deescalate, group: group.deescalate },
        { label: "Entscheidungen unter Gruppendruck", mine: mine.peerPressure, group: group.peerPressure },
        { label: "Hilfe gesucht", mine: mine.helpSought, group: group.helpSought }
      ].forEach(function (b) {
        var row = el("div", "profile-bar-row");
        var labelRow = el("div", "profile-bar-label-row");
        labelRow.appendChild(el("div", "profile-bar-label", b.label));
        labelRow.appendChild(el("div", "profile-bar-compare", "Du " + b.mine + "% · Gruppe " + b.group + "%"));
        row.appendChild(labelRow);
        var track = el("div", "profile-bar-track profile-bar-track-compare");
        var fillGroup = el("div", "profile-bar-fill profile-bar-fill-group");
        fillGroup.style.width = b.group + "%";
        var fillMine = el("div", "profile-bar-fill profile-bar-fill-mine");
        fillMine.style.width = b.mine + "%";
        track.appendChild(fillGroup);
        track.appendChild(fillMine);
        row.appendChild(track);
        wrap.appendChild(row);
      });

      wrap.appendChild(el("p", "profile-disclaimer",
        "Diese Werte beschreiben nur die Entscheidungen im Spiel. " +
        "Sie sagen nichts darüber aus, wie du dich im echten Leben verhalten würdest."));

      GAME_QUESTIONS.forEach(function (q) {
        var mineChoice = history.filter(function (h) { return h.questionId === q.id; })[0];
        var qRows = rows.filter(function (r) { return r.scene_id === q.id; });
        var qTotal = qRows.length || 1;
        var block = el("div", "result-question");
        block.appendChild(el("h3", "result-question-title", q.theme));
        q.options.forEach(function (opt, i) {
          var count = qRows.filter(function (r) { return r.choice_index === i; }).length;
          var isMine = mineChoice && mineChoice.label === opt.label;
          var row = el("div", "tally-row" + (isMine ? " tally-row-mine" : ""));
          var label = el("div", "tally-label");
          label.appendChild(el("span", null, (isMine ? "→ " : "") + opt.label));
          label.appendChild(el("span", null, pct(count, qTotal) + "%"));
          row.appendChild(label);
          var track = el("div", "tally-track");
          var fill = el("div", "tally-fill");
          fill.style.width = Math.min(100, pct(count, qTotal)) + "%";
          track.appendChild(fill);
          row.appendChild(track);
          block.appendChild(row);
        });
        wrap.appendChild(block);
      });
    });
  }

  function renderReflection() {
    clearStage();
    stage.appendChild(el("p", "scene-prompt scene-prompt-lg", GAME_REFLECTION.prompt));
    var wrap = el("div", "scene-choices scene-choices-grid");
    GAME_REFLECTION.options.forEach(function (opt, i) {
      var btn = el("button", "choice-btn", opt);
      btn.type = "button";
      btn.addEventListener("click", function () {
        reflectionAnswer = opt;
        GameGroup.submitChoice(code, playerId, "reflection", i, opt, []);
        renderWaiting(opt);
      });
      wrap.appendChild(btn);
    });
    stage.appendChild(wrap);
  }

  function renderStep(sceneId) {
    if (sceneId === "results") { renderResults(); return; }
    if (sceneId === "reflection") { renderReflection(); return; }

    var q = questionById(sceneId);
    if (!q) return;

    clearStage();
    var img = renderImage(q);
    if (img) stage.appendChild(img);
    var meta = el("div", "scene-meta");
    meta.appendChild(el("span", "level-badge", q.theme.toUpperCase()));
    if (q.location) meta.appendChild(el("span", "scene-location", q.location));
    stage.appendChild(meta);
    stage.appendChild(renderNarration(q));
    stage.appendChild(el("p", "scene-prompt", q.prompt));

    var wrap = el("div", "scene-choices");
    q.options.forEach(function (opt, i) {
      var btn = el("button", "choice-btn", opt.label);
      btn.type = "button";
      btn.addEventListener("click", function () {
        history.push({ questionId: q.id, label: opt.label, tags: opt.tags || [] });
        GameGroup.submitChoice(code, playerId, q.id, i, opt.label, opt.tags);
        renderWaiting(opt.label);
      });
      wrap.appendChild(btn);
    });
    stage.appendChild(wrap);
  }

  renderJoinForm();
})();
