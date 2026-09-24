/* ==========================================================================
   "Virale Videos" — curated real-world clips for workshop discussion.
   Pure data. See js/viral-videos.js for rendering.

   Entry shape:
     id, person (who), title, description (German, 2-4 sentences),
     videoId (YouTube id, or "" if not yet sourced — renders a
     placeholder instead of an embed), sourceUrl (the original clip,
     for attribution/verification).
   ========================================================================== */

var VIRAL_VIDEOS = [
  {
    id: "zidane-2006",
    person: "Zinédine Zidane",
    title: "Der Kopfstoß im WM-Finale 2006",
    description:
      "Im letzten Spiel seiner Karriere, dem WM-Finale 2006 gegen Italien, wird Zidane von " +
      "Marco Materazzi provoziert — mit Beleidigungen über seine Schwester und Mutter. Zidane " +
      "reagiert mit einem Kopfstoß gegen Materazzis Brust, sieht Rot und muss vom Platz. " +
      "Frankreich verliert das anschließende Elfmeterschießen. Einer der besten Spieler der Welt, " +
      "im größten Moment seiner Karriere, lässt sich von wenigen Sätzen zur Eskalation treiben.",
    videoId: "",
    sourceUrl: ""
  },
  {
    id: "ali-cosmopolitan",
    person: "Muhammad Ali",
    title: "„Ich will nur meiner Frau gefallen“",
    description:
      "Ein Interviewer spricht Ali auf einen Zeitschriftenartikel an, der ihn zum „sexuell " +
      "attraktivsten Mann der Welt“ erklärt. Statt stolz zu reagieren, lehnt Ali das Etikett ab — " +
      "für einen verheirateten Mann sei das unpassend. Wichtig sei ihm nur, seiner Frau zu gefallen. " +
      "Mit einem humorvollen Seitenhieb über ihren Aufenthaltsort bleibt er dabei ganz er selbst: " +
      "souverän, mit klaren Prinzipien, ohne sich von der Situation aus der Ruhe bringen zu lassen.",
    videoId: "8Gpvaf9E9Qw",
    sourceUrl: "https://www.youtube.com/shorts/8Gpvaf9E9Qw"
  }
];
