/* ==========================================================================
   Parti-Scouts — live feedback wall
   Reads and writes directly to Supabase (public insert + read, no login).
   Only used on feedback/index.html. No build step: plain script.
   ========================================================================== */

(function () {
  "use strict";

  var SUPABASE_URL = "https://yzwikutdhylgybmhmxac.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_KQw1a-_YZuAZBxzLE_Gpew_NE7Mwa9L";
  var TABLE = "feedback";

  var list = document.getElementById("feedback-list");
  var loadingEl = document.getElementById("feedback-loading");
  var emptyEl = document.getElementById("feedback-empty");
  var form = document.getElementById("feedbackForm");
  if (!list || !form || typeof supabase === "undefined") return;

  var client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  var submitBtn = document.getElementById("feedbackSubmit");
  var errorMsg = document.getElementById("feedbackFormError");
  var successPanel = document.getElementById("feedbackSuccess");
  var resetBtn = document.getElementById("feedbackReset");
  var previewPanel = document.getElementById("feedbackPreview");
  var editBtn = document.getElementById("previewEdit");
  var publishBtn = document.getElementById("previewPublish");

  function currentDict() {
    try {
      var lang = document.documentElement.lang || "de";
      return (typeof I18N !== "undefined" && I18N[lang]) ? I18N[lang] : {};
    } catch (e) { return {}; }
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function buildCard(row) {
    var card = document.createElement("div");
    card.className = "feedback-card";

    var mark = document.createElement("span");
    mark.className = "mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "“";
    card.appendChild(mark);

    var quote = document.createElement("p");
    quote.className = "quote";
    quote.textContent = row.review;
    card.appendChild(quote);

    var author = document.createElement("div");
    author.className = "author";

    var avatar = document.createElement("div");
    avatar.className = "author-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials(row.name);
    author.appendChild(avatar);

    var authorText = document.createElement("div");
    authorText.className = "author-text";

    var name = document.createElement("span");
    name.className = "name";
    name.textContent = row.name;
    authorText.appendChild(name);

    if (row.occupation) {
      var role = document.createElement("span");
      role.className = "role";
      role.textContent = row.occupation;
      authorText.appendChild(role);
    }

    author.appendChild(authorText);
    card.appendChild(author);

    return card;
  }

  function renderList(rows) {
    list.innerHTML = "";
    if (rows.length === 0) {
      if (emptyEl) emptyEl.style.display = "";
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";
    rows.forEach(function (row) {
      list.appendChild(buildCard(row));
    });
  }

  function loadFeedback() {
    client
      .from(TABLE)
      .select("id, name, occupation, review, created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(function (result) {
        if (loadingEl) loadingEl.style.display = "none";
        if (result.error) {
          if (emptyEl) {
            emptyEl.style.display = "";
          }
          return;
        }
        renderList(result.data || []);
      });
  }

  // Step 1: form submit shows a preview instead of publishing directly,
  // so people can re-read their review before it goes live.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (errorMsg) errorMsg.classList.remove("show");

    var honeypot = document.getElementById("fb-website");
    var name = document.getElementById("fb-name").value.trim();
    var occupation = document.getElementById("fb-occupation").value.trim();
    var review = document.getElementById("fb-review").value.trim();
    if (!name || !review) return;

    // Silently drop bots that filled the hidden honeypot field.
    if (honeypot && honeypot.value) {
      form.reset();
      return;
    }

    document.getElementById("previewName").textContent = name;
    var roleEl = document.getElementById("previewRole");
    if (occupation) {
      roleEl.textContent = occupation;
      roleEl.style.display = "";
    } else {
      roleEl.textContent = "";
      roleEl.style.display = "none";
    }
    document.getElementById("previewReview").textContent = review;
    document.getElementById("previewAvatar").textContent = initials(name);

    form.style.display = "none";
    if (previewPanel) previewPanel.hidden = false;
  });

  // Step 2: "Edit" goes back to the filled-in form without losing input.
  if (editBtn) {
    editBtn.addEventListener("click", function () {
      if (previewPanel) previewPanel.hidden = true;
      form.style.display = "";
    });
  }

  // Step 3: only now does the feedback actually get written and go live.
  if (publishBtn) {
    publishBtn.addEventListener("click", function () {
      var name = document.getElementById("fb-name").value.trim();
      var occupation = document.getElementById("fb-occupation").value.trim();
      var review = document.getElementById("fb-review").value.trim();
      if (!name || !review) return;

      publishBtn.disabled = true;
      if (editBtn) editBtn.disabled = true;
      var dict = currentDict();
      var originalLabel = publishBtn.textContent;
      if (dict["feedback.form_sending"]) publishBtn.textContent = dict["feedback.form_sending"];

      client
        .from(TABLE)
        .insert([{ name: name, occupation: occupation || null, review: review }])
        .select()
        .then(function (result) {
          publishBtn.disabled = false;
          if (editBtn) editBtn.disabled = false;
          publishBtn.textContent = originalLabel;

          if (result.error) {
            if (errorMsg) {
              var isBlocklist = result.error.message && result.error.message.indexOf("Submission blocked") !== -1;
              var dict = currentDict();
              var key = isBlocklist ? "feedback.form_error_blocklist" : "feedback.form_error";
              if (dict[key]) errorMsg.textContent = dict[key];
              errorMsg.classList.add("show");
            }
            return;
          }

          if (result.data && result.data[0]) {
            list.insertBefore(buildCard(result.data[0]), list.firstChild);
            if (emptyEl) emptyEl.style.display = "none";
          }

          if (previewPanel) previewPanel.hidden = true;
          if (successPanel) {
            successPanel.hidden = false;
            setTimeout(function () {
              successPanel.classList.add("show");
              successPanel.focus();
            }, 0);
          }
        });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.style.display = "";
      if (previewPanel) previewPanel.hidden = true;
      if (successPanel) {
        successPanel.classList.remove("show");
        successPanel.hidden = true;
      }
      document.getElementById("fb-name").focus();
    });
  }

  loadFeedback();
})();
