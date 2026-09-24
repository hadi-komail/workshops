/* ==========================================================================
   "Wie weit gehst du?" — question set.
   Pure data: a fixed, ordered list of situations. No branching — every
   player answers the same questions in the same order, like a form. See
   game-engine.js (solo) and game-host.js / game-group-player.js (group)
   for how this is played and compared.

   Question shape:
     id, theme (short label shown as a tag), location (small tag),
     text (array of narration lines), line ({who, text}, optional),
     prompt (the question shown above the options), options (array of
     {label, tags}), image + imageAlt (optional — shown above the
     narration if the file exists; missing files just don't render,
     see the img.onerror handler in each engine).

   Option tags feed the end-of-game profile:
     escalate, deescalate, helpSought (called for outside help),
     peerPressure (a friend is actively pushing in this moment).
   ========================================================================== */

// Resolve images relative to this script, so the game works from any folder
// (and from file://) instead of assuming it sits at the site root.
var GAME_ASSET_BASE = new URL("../assets/", document.currentScript.src).href;

var GAME_QUESTIONS = [

  {
    id: "q1", theme: "Provokation", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q1-provokation.jpg",
    imageAlt: "Zwei Jugendliche stehen sich auf einem Basketballplatz in der Abenddämmerung gegenüber, einer mit herausforderndem Blick.",
    text: [
      "Du bist mit deinen Freunden auf dem Basketballplatz.",
      "Ein anderer Junge kommt näher. Er sieht dich an."
    ],
    line: { who: "Unbekannter", text: "„Was guckst du, Bruder?“" },
    prompt: "WAS MACHST DU?",
    options: [
      { label: "Ignorieren und weitergehen", tags: ["deescalate"] },
      { label: "„Was ist dein Problem?“ fragen", tags: [] },
      { label: "Beleidigung zurückgeben", tags: ["escalate"] },
      { label: "Bedrohung aussprechen", tags: ["escalate"] },
      { label: "Polizei rufen", tags: ["helpSought"] },
      { label: "Zuschlagen", tags: ["escalate"] }
    ]
  },

  {
    id: "q2", theme: "Beleidigung", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q2-beleidigung.jpg",
    imageAlt: "Nahaufnahme zweier Jugendlicher im Streitgespräch auf dem Basketballplatz.",
    text: ["Ein anderer Junge kommt näher."],
    line: { who: "Unbekannter", text: "„Du bist ein Idiot.“" },
    prompt: "WAS MACHST DU?",
    options: [
      { label: "Ruhig bleiben, nichts sagen", tags: ["deescalate"] },
      { label: "Weggehen", tags: ["deescalate"] },
      { label: "Zurückbeleidigen", tags: ["escalate"] },
      { label: "Drohen", tags: ["escalate"] },
      { label: "Zuschlagen", tags: ["escalate"] }
    ]
  },

  {
    id: "q3", theme: "Gruppendruck", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q3-gruppendruck.jpg",
    imageAlt: "Ein Freund redet drängend auf den Protagonisten ein, während der Konflikt im Hintergrund weitergeht.",
    text: ["Deine Freunde stehen dabei und schauen zu."],
    line: { who: "Dein Freund", text: "„Bruder, willst du dir das wirklich gefallen lassen?“" },
    prompt: "WAS MACHST DU?",
    options: [
      { label: "„Mir ist egal, was die anderen denken.“", tags: ["deescalate", "peerPressure"] },
      { label: "„Halt dich da raus“ (zum Freund)", tags: ["deescalate", "peerPressure"] },
      { label: "Ruhig bleiben, auf Zeit spielen", tags: ["deescalate"] },
      { label: "„Du hast recht...“ (lässt sich anstacheln)", tags: ["escalate", "peerPressure"] },
      { label: "Mitmachen und mitschreien", tags: ["escalate", "peerPressure"] }
    ]
  },

  {
    id: "q4", theme: "Ehre", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q4-ehre.jpg",
    imageAlt: "Naher Blick auf das angespannte Gesicht eines Jugendlichen im Gegenlicht der Flutlichter.",
    text: ["Immer mehr Leute schauen jetzt hin."],
    line: { who: "Unbekannter", text: "„Du bist doch kein richtiger Mann.“" },
    prompt: "WAS MACHST DU?",
    options: [
      { label: "Ignorieren — das sagt nichts über dich aus", tags: ["deescalate"] },
      { label: "Ruhig bleiben und gehen", tags: ["deescalate"] },
      { label: "„Sag das nochmal.“ (herausfordern)", tags: ["escalate"] },
      { label: "Zuschlagen, um es zu beweisen", tags: ["escalate"] }
    ]
  },

  {
    id: "q5", theme: "Familie", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q5-familie.jpg",
    imageAlt: "Ein Jugendlicher mit angespanntem Gesichtsausdruck und zitternden Händen.",
    text: ["Der andere kommt noch näher."],
    line: { who: "Unbekannter", text: "„Deine Mutter würde sich für dich schämen.“" },
    prompt: "WAS MACHST DU?",
    options: [
      { label: "Tief durchatmen, nicht reagieren", tags: ["deescalate"] },
      { label: "Weggehen", tags: ["deescalate"] },
      { label: "Laut werden, aber nicht zuschlagen", tags: ["escalate"] },
      { label: "Zuschlagen", tags: ["escalate"] }
    ]
  },

  {
    id: "q6", theme: "Körperkontakt", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q6-koerperkontakt.jpg",
    imageAlt: "Ein Jugendlicher taumelt einen Schritt zurück, unmittelbar nachdem er geschubst wurde.",
    text: ["Die andere Person schubst dich. Du taumelst einen Schritt zurück."],
    prompt: "WAS MACHST DU?",
    options: [
      { label: "„Fass mich nicht an.“ — und gehen", tags: ["deescalate"] },
      { label: "Polizei rufen", tags: ["helpSought"] },
      { label: "Zurückschubsen", tags: ["escalate"] },
      { label: "Zurückschlagen", tags: ["escalate"] }
    ]
  },

  {
    id: "q7", theme: "Freund in Gefahr", location: "Basketballplatz",
    image: GAME_ASSET_BASE + "game-q7-freund-in-gefahr.jpg",
    imageAlt: "Aus der Perspektive des Protagonisten: eine unscharfe Auseinandersetzung im Hintergrund, sein Gesicht alarmiert im Vordergrund.",
    text: ["Es geht plötzlich nicht mehr nur um dich.", "Dein Freund wird angegriffen."],
    prompt: "WAS MACHST DU?",
    options: [
      { label: "Polizei rufen", tags: ["helpSought"] },
      { label: "Rettungsdienst rufen", tags: ["helpSought"] },
      { label: "Deinen Freund in Sicherheit bringen", tags: ["deescalate", "helpSought"] },
      { label: "Eingreifen und mitkämpfen", tags: ["escalate"] },
      { label: "Weglaufen", tags: ["escalate"] }
    ]
  },

  {
    id: "q8", theme: "Die letzte Entscheidung", location: "Straße, auf dem Nachhauseweg",
    image: GAME_ASSET_BASE + "game-q8-letzte-entscheidung.jpg",
    imageAlt: "Eine Gruppe Jugendlicher auf einer abendlichen Straße in einem angespannten Moment.",
    text: [
      "Du bist mit deinen Freunden unterwegs.",
      "Ein anderer Junge provoziert dich. Deine Freunde schauen zu.",
      "Er beleidigt dich. Dann schubst er deinen Freund."
    ],
    prompt: "WIE WEIT GEHST DU?",
    options: [
      { label: "Ignorieren, deinen Freund holen und gehen", tags: ["deescalate", "helpSought"] },
      { label: "Ruhig reden und die Lage entschärfen", tags: ["deescalate"] },
      { label: "Polizei rufen", tags: ["helpSought"] },
      { label: "Ihn zur Rede stellen", tags: [] },
      { label: "Zurückschubsen", tags: ["escalate"] },
      { label: "Zuschlagen", tags: ["escalate"] }
    ]
  }

];

var GAME_REFLECTION = {
  prompt: "Was hat dich im Spiel am meisten beeinflusst?",
  options: ["Ehre", "Freunde", "Wut", "Angst", "Respekt", "Familie", "Gruppendruck", "Selbstkontrolle", "Loyalität"]
};
