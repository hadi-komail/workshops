/* ==========================================================================
   "Wie weit gehst du?" — group mode, facilitator (host) screen.
   Shows the session code, live joined players, and — once the round is
   active — a live vote tally with one button per option to advance the
   whole room through the fixed question set. At the end, shows the full
   group comparison. Meant for a projector or shared screen in the room.
   ========================================================================== */

(function () {
  "use strict";

  var code = new URLSearchParams(window.location.search).get("code");
  var stage = document.getElementById("gameStage");
  if (!code || !stage || typeof GAME_QUESTIONS === "undefined" || typeof GameGroup === "undefined") return;

  code = code.trim().toUpperCase();

  var players = [];
  var currentSceneId = null;
  var currentCounts = {};

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
  function nextStepId(id) {
    if (id === "reflection") return "results";
    var idx = GAME_QUESTIONS.findIndex(function (q) { return q.id === id; });
    if (idx === -1) return "results";
    return idx + 1 < GAME_QUESTIONS.length ? GAME_QUESTIONS[idx + 1].id : "reflection";
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

  function renderError(msg) {
    clearStage();
    stage.appendChild(el("div", "game-mode-card")).appendChild(el("p", null, msg));
  }

  function renderLobby() {
    clearStage();
    var panel = el("div", "game-mode-card");
    panel.appendChild(el("h3", null, "Code für die Teilnehmenden:"));
    panel.appendChild(el("div", "session-code", code));
    var list = el("div", "player-list");
    list.id = "hostPlayerList";
    renderPlayerChips(list);
    panel.appendChild(list);
    var startBtn = el("button", "game-cta", "Runde starten");
    startBtn.type = "button";
    startBtn.addEventListener("click", function () { renderCurrentScene(); });
    panel.appendChild(startBtn);
    stage.appendChild(panel);
  }

  function renderPlayerChips(list) {
    list.innerHTML = "";
    if (players.length === 0) {
      list.appendChild(el("p", "game-note", "Noch niemand beigetreten …"));
      return;
    }
    players.forEach(function (p) {
      list.appendChild(el("span", "player-chip", p.nickname));
    });
  }

  function renderTallyAndControls(items, onAdvance) {
    var total = players.length || 1;
    items.forEach(function (item, i) {
      var count = currentCounts[i] || 0;
      var row = el("div", "tally-row");
      var label = el("div", "tally-label");
      label.appendChild(el("span", null, item.label));
      label.appendChild(el("span", null, count + " / " + players.length));
      row.appendChild(label);
      var track = el("div", "tally-track");
      var fill = el("div", "tally-fill");
      fill.style.width = Math.min(100, Math.round((count / total) * 100)) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      var advBtn = el("button", "choice-btn tally-advance", "Diesen Pfad wählen →");
      advBtn.type = "button";
      advBtn.addEventListener("click", function () { onAdvance(); });
      row.appendChild(advBtn);
      stage.appendChild(row);
    });
  }

  function pct(count, total) { return total === 0 ? 0 : Math.round((count / total) * 100); }

  function renderResults() {
    var topBar = el("div", "scene-meta");
    topBar.appendChild(el("span", "level-badge", "Code: " + code));
    topBar.appendChild(el("span", "scene-location", players.length + " Teilnehmende"));
    stage.appendChild(topBar);

    GameGroup.fetchAllChoices(code).then(function (rows) {
      var wrap = el("div", "profile-panel");
      wrap.appendChild(el("h2", "profile-title", "Ergebnisse der Gruppe"));

      var total = rows.length || 1;
      var esc = rows.filter(function (r) { return (r.tags || []).indexOf("escalate") !== -1; }).length;
      var deesc = rows.filter(function (r) { return (r.tags || []).indexOf("deescalate") !== -1; }).length;
      var peer = rows.filter(function (r) { return (r.tags || []).indexOf("peerPressure") !== -1; }).length;
      var help = rows.filter(function (r) { return (r.tags || []).indexOf("helpSought") !== -1; }).length;
      [
        { label: "Eskalation", value: pct(esc, total) },
        { label: "Deeskalation", value: pct(deesc, total) },
        { label: "Entscheidungen unter Gruppendruck", value: pct(peer, total) },
        { label: "Hilfe gesucht", value: pct(help, total) }
      ].forEach(function (b) {
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

      GAME_QUESTIONS.forEach(function (q) {
        var qRows = rows.filter(function (r) { return r.scene_id === q.id; });
        var qTotal = qRows.length || 1;
        var block = el("div", "result-question");
        block.appendChild(el("h3", "result-question-title", q.theme + ": „" + q.prompt + "“"));
        q.options.forEach(function (opt, i) {
          var count = qRows.filter(function (r) { return r.choice_index === i; }).length;
          var row = el("div", "tally-row");
          var label = el("div", "tally-label");
          label.appendChild(el("span", null, opt.label));
          label.appendChild(el("span", null, count + " / " + qRows.length));
          row.appendChild(label);
          var track = el("div", "tally-track");
          var fill = el("div", "tally-fill");
          fill.style.width = Math.min(100, Math.round((count / qTotal) * 100)) + "%";
          track.appendChild(fill);
          row.appendChild(track);
          block.appendChild(row);
        });
        wrap.appendChild(block);
      });

      wrap.appendChild(el("p", "profile-disclaimer",
        "Diese Werte beschreiben nur die Entscheidungen in diesem Spiel. " +
        "Sie sagen nichts darüber aus, wie sich jemand im echten Leben verhalten würde."));

      var endBtn = el("button", "game-cta game-cta-outline", "Session beenden");
      endBtn.type = "button";
      endBtn.addEventListener("click", function () {
        GameGroup.endSession(code);
        endBtn.disabled = true;
        endBtn.textContent = "Beendet";
      });
      wrap.appendChild(endBtn);
      stage.appendChild(wrap);
    });
  }

  function renderCurrentScene() {
    clearStage();

    if (currentSceneId === "results") { renderResults(); return; }

    var topBar = el("div", "scene-meta");
    topBar.appendChild(el("span", "level-badge", "Code: " + code));
    topBar.appendChild(el("span", "scene-location", players.length + " Teilnehmende"));
    stage.appendChild(topBar);

    if (currentSceneId === "reflection") {
      stage.appendChild(el("p", "scene-prompt", GAME_REFLECTION.prompt));
      stage.appendChild(el("p", "game-note", "Die Teilnehmenden wählen jetzt privat auf ihrem eigenen Bildschirm."));
      var items = GAME_REFLECTION.options.map(function (opt) { return { label: opt }; });
      renderTallyAndControls(items, function () { GameGroup.advanceSession(code, "results"); });
      return;
    }

    var q = questionById(currentSceneId);
    if (!q) return;

    var img = renderImage(q);
    if (img) stage.appendChild(img);
    stage.appendChild(el("p", "scene-location", q.theme.toUpperCase() + (q.location ? " · " + q.location : "")));
    (q.text || []).forEach(function (line) { stage.appendChild(el("p", "narration-line", line)); });
    if (q.line) {
      var quote = el("div", "scene-quote");
      quote.appendChild(el("span", "quote-who", q.line.who));
      quote.appendChild(el("p", "quote-text", q.line.text));
      stage.appendChild(quote);
    }
    stage.appendChild(el("p", "scene-prompt", q.prompt || ""));
    stage.appendChild(el("p", "game-note", "Die Teilnehmenden wählen jetzt privat auf ihrem eigenen Bildschirm."));

    renderTallyAndControls(q.options, function () { GameGroup.advanceSession(code, nextStepId(q.id)); });
  }

  GameGroup.getSession(code).then(function (result) {
    if (result.error || !result.data) {
      renderError("Session nicht gefunden oder bereits beendet.");
      return;
    }
    currentSceneId = result.data.current_scene;

    GameGroup.fetchPlayers(code).then(function (list) {
      players = list;
      renderLobby();
    });

    GameGroup.onNewPlayer(code, function (player) {
      players.push(player);
      var list = document.getElementById("hostPlayerList");
      if (list) renderPlayerChips(list);
    });

    GameGroup.onNewChoice(code, function (row) {
      if (row.scene_id !== currentSceneId) return;
      currentCounts[row.choice_index] = (currentCounts[row.choice_index] || 0) + 1;
      renderCurrentScene();
    });

    GameGroup.onSessionChange(code, function (session) {
      currentSceneId = session.current_scene;
      currentCounts = {};
      renderCurrentScene();
    });
  });
})();
