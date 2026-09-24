/* ==========================================================================
   "Virale Videos" — renders VIRAL_VIDEOS into #viralVideoList.
   ========================================================================== */

(function () {
  "use strict";

  var list = document.getElementById("viralVideoList");
  if (!list || typeof VIRAL_VIDEOS === "undefined") return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  VIRAL_VIDEOS.forEach(function (entry) {
    var card = el("article", "video-card");

    var media = el("div", "video-media");
    if (entry.videoId) {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + entry.videoId;
      iframe.title = entry.person + " — " + entry.title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      media.appendChild(iframe);
    } else {
      media.appendChild(el("p", "video-placeholder", "Video wird ergänzt"));
    }
    card.appendChild(media);

    var body = el("div", "video-body");
    body.appendChild(el("span", "video-person", entry.person));
    body.appendChild(el("h3", null, entry.title));
    body.appendChild(el("p", null, entry.description));
    if (entry.sourceUrl) {
      var link = document.createElement("a");
      link.href = entry.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "video-source";
      link.textContent = "Quelle ansehen ↗";
      body.appendChild(link);
    }
    card.appendChild(body);

    list.appendChild(card);
  });
})();
