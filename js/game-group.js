/* ==========================================================================
   "Wie weit gehst du?" — group mode.
   Facilitator hosts a shared session; players join by code and vote on
   their phones; the facilitator advances the shared scene for everyone.
   Same Supabase project as the feedback wall, different tables:
     game_sessions(code, current_scene, active, created_at)
     game_players(id, session_code, nickname, joined_at)
     game_choices(id, session_code, player_id, scene_id, choice_index,
                  choice_label, tags, created_at)
   ========================================================================== */

(function () {
  "use strict";

  var SUPABASE_URL = "https://yzwikutdhylgybmhmxac.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_KQw1a-_YZuAZBxzLE_Gpew_NE7Mwa9L";

  if (typeof supabase === "undefined") return;
  var client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  var CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I

  function generateCode() {
    var code = "";
    for (var i = 0; i < 5; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    return code;
  }

  function createSession() {
    var code = generateCode();
    return client.from("game_sessions")
      .insert([{ code: code, current_scene: "q1", active: true }])
      .select()
      .then(function (result) {
        if (result.error) return { error: result.error };
        return { code: code };
      });
  }

  function getSession(code) {
    return client.from("game_sessions").select("*").eq("code", code).eq("active", true).maybeSingle()
      .then(function (result) { return result; });
  }

  function joinSession(code, nickname) {
    return client.from("game_players")
      .insert([{ session_code: code, nickname: nickname }])
      .select()
      .then(function (result) {
        if (result.error || !result.data || !result.data[0]) return { error: result.error };
        return { player: result.data[0] };
      });
  }

  function submitChoice(code, playerId, sceneId, choiceIndex, choiceLabel, tags) {
    return client.from("game_choices").insert([{
      session_code: code, player_id: playerId, scene_id: sceneId,
      choice_index: choiceIndex, choice_label: choiceLabel, tags: tags || []
    }]);
  }

  function advanceSession(code, nextSceneId) {
    return client.from("game_sessions").update({ current_scene: nextSceneId }).eq("code", code);
  }

  function endSession(code) {
    return client.from("game_sessions").update({ active: false }).eq("code", code);
  }

  function fetchAllChoices(code) {
    return client.from("game_choices").select("*").eq("session_code", code)
      .then(function (result) { return result.data || []; });
  }

  function fetchPlayers(code) {
    return client.from("game_players").select("*").eq("session_code", code).order("joined_at")
      .then(function (result) { return result.data || []; });
  }

  function onSessionChange(code, callback) {
    return client.channel("session-" + code)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions", filter: "code=eq." + code }, function (payload) {
        callback(payload.new);
      })
      .subscribe();
  }

  function onNewChoice(code, callback) {
    return client.channel("choices-" + code)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_choices", filter: "session_code=eq." + code }, function (payload) {
        callback(payload.new);
      })
      .subscribe();
  }

  function onNewPlayer(code, callback) {
    return client.channel("players-" + code)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_players", filter: "session_code=eq." + code }, function (payload) {
        callback(payload.new);
      })
      .subscribe();
  }

  window.GameGroup = {
    createSession: createSession,
    getSession: getSession,
    joinSession: joinSession,
    submitChoice: submitChoice,
    advanceSession: advanceSession,
    endSession: endSession,
    fetchAllChoices: fetchAllChoices,
    fetchPlayers: fetchPlayers,
    onSessionChange: onSessionChange,
    onNewChoice: onNewChoice,
    onNewPlayer: onNewPlayer
  };
})();
