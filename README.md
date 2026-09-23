# Workshops — Interactive Tools for Youth Violence Prevention

A collection of workshop formats and the interactive tools built to run them, developed for **[Parti-Scouts](https://parti-scouts.de)** — a peer-to-peer violence-prevention and participation project for teenagers and young men in Berlin/Brandenburg, run by Albatros gGmbH in cooperation with the Stiftung Deutsches Forum für Kriminalprävention (DFK).

The idea behind all three: don't lecture young people about violence, prejudice, and conflict — put them inside a situation where they make the decisions themselves, then reflect on what happened. Two are digital tools built from scratch (vanilla JS, no framework, Supabase as a lightweight backend); one is a facilitated in-person exercise.

---

## 🧥 Die Farbe der Jacke (The Colour of the Jacket)

**Format:** facilitated in-person exercise · **Duration:** 90–120 minutes · **Arc:** Experience → Reflect → Act

A live experiential workshop on prejudice, inequality, and power — in the tradition of Jane Elliott's "Blue Eyes / Brown Eyes" exercise, adapted for this project's participants.

Participants are split into two groups by nothing more than jacket colour — red and blue. Over the course of the session, false information and deliberately unequal conditions are introduced between the groups. What starts as an arbitrary label ("red jacket," "blue jacket") turns into "our group" and "the other group"; unequal treatment produces unequal outcomes, and by the end one group holds real power over the other's conditions.

The debrief is where the workshop does its actual work: participants unpack how quickly an arbitrary distinction became identity, how false information shaped their judgment of the "other" group, and how unequal starting conditions — not anything about the people themselves — produced unequal results.

> "It wasn't the people who were different. The conditions were different."

No code here — this one lives entirely in facilitation. See it featured on the [workshops page](https://parti-scouts.de/workshops/).

---

## 🐍 Snake — Konflikt

**Type:** browser game · **Stack:** vanilla HTML/CSS/JS, Supabase (Postgres + Realtime) for score tracking

A reskin of the classic Snake game that turns a familiar mechanic into a conflict-escalation metaphor. Two snakes — you and the computer — share a board and both want the same thing: to grow and survive.

- **Eating food** grows you. Safe, costs nothing.
- **Attacking** means driving your head into the other snake's body. There's no dedicated "attack" button — the collision *is* the attack, and it costs **both** sides a segment, not just the one attacked.
- The computer never attacks first. The moment you do, a tension meter spikes and it strikes back. Distance has to be actively rebuilt to bring tension back down — and it never fully resets to zero. The first hit is a single keystroke; walking it back takes time.
- Scoring rewards restraint, not aggression: only beating the computer counts, ties go to fewer attacks thrown, and the leaderboard (backed by Supabase) makes that visible to the whole room.

Built for the *"Level Up!"* game format inside the workshop series — quick to explain, immediately visceral, and a clean bridge into a group discussion about what happens the moment someone decides to hit back.

---

## 🎮 Wie weit gehst du? (How Far Would You Go?)

**Type:** browser game, solo + group facilitation mode · **Stack:** vanilla HTML/CSS/JS, Supabase (Postgres + Realtime) for live group sessions

An interactive scenario game that walks a player through eight escalating situations — a provocation on a basketball court, peer pressure, an insult about family, a shove, a friend in danger — and asks after each one: *what do you do?* Every question carries its own illustrated scene and a distinct set of responses ranging from de-escalating to escalating to calling for outside help.

**Two ways to play:**
- **Solo** — play through all eight questions at your own pace, end with a personal decision profile (how often you escalated, de-escalated, acted under peer pressure, or sought help).
- **Group** — a facilitator hosts a shared session with a join code; each participant answers privately on their own phone, and the group screen shows a live, anonymous comparison of how the room responded to each situation — a strong prompt for the Teamer-led discussion that follows.

The design choice throughout: no "correct" answer is ever flagged in the moment. The game tracks patterns, not grades, and hands the reflection back to the group instead of delivering a verdict itself.

---

## Tech notes

Both digital tools share the same philosophy as the rest of the Parti-Scouts site: **no build step, no framework** — plain HTML/CSS/JS that runs anywhere static files are served, with [Supabase](https://supabase.com) as a minimal, credential-free backend (a public anon key, row-level security policies scoped to exactly what each table needs, no login system). That keeps them trivially easy to host, fork, and adapt for a different workshop.

---

*Part of the Parti-Scouts project. Website: [parti-scouts.de](https://parti-scouts.de)*
