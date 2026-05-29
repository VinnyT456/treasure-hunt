# Treasure Hunt — An Algorithm Adventure

A tiny educational game where 5th graders find hidden treasure behind one of
many doors — and quietly learn what algorithms are along the way.

No lectures. No textbook definitions. Just a maze, some clues, and the slow
realization that *how* you search matters as much as *where* you search.

---

## How to play

You're standing at the start of a hallway. Somewhere behind one of the doors
is a treasure. Click a door to open it. The game tells you what you found —
sometimes nothing, sometimes a hint about how close you are, sometimes which
direction to go next. Find the treasure in as few moves as you can.

That's it. That's the whole game.

---

## The five levels

| Level | Name              | Doors | Clue you get             | Twist            |
|------:|-------------------|------:|--------------------------|------------------|
| 1     | The Maze          | 10    | None at all              | —                |
| 2     | Hot or Cold       | 10    | Temperature (hot ↔ cold) | —                |
| 3     | The Friendly Ghost| 12    | "Treasure is left/right" | —                |
| 4     | The Master Hunter | 20    | "Treasure is left/right" | Only 5 moves!    |
| 5     | The Legend        | 100   | "Treasure is left/right" | Only 7 moves!    |

After Level 5, unlock **Maker Mode** (build custom mazes) and **Class Challenge**
(join a room code and compete on a local scoreboard).

Each level builds on the last. Short **tutorials** teach **linear search** (after
Level 1) and **binary search** (before Level 4). Level 5 is the capstone where
splitting the hallway in half every move is required.

---

## Stars and scoring

Stars depend on the level — not just move count:

- **Level 1:** Found the treasure (1 star)
- **Level 2:** Found + followed hot/cold clues wisely (2 stars)
- **Level 3:** Found + finished in 5 moves or fewer (2 stars)
- **Level 4:** Found + finished within the 5-move limit (2 stars)
- **Level 5:** Found + move limit + split the search in half each time (3 stars)

Any win unlocks the next level. Replay to earn more stars.

---

## Difficulty modes

| Mode     | Hints |
|----------|--------|
| **Easy** | A helpful hint after every try until you find the treasure |
| **Standard** | One hint at the start of the level only |
| **Expert** | No hints (banner shows in the HUD) |

Difficulty is available from Level 1. Maker Mode and Class Challenge unlock
after you complete Level 5.

---

## Penny the Linear Seeker

On Levels 4 and 5, **Penny** races you using **linear search** — she opens doors
1, 2, 3… in order. Your goal is to find the treasure with **fewer doors opened**
than Penny would need. The UI says **doors opened**, not "checks."

---

## Progress, badges, and leaderboards

Progress, tutorials, badges, and scores are saved in your browser (**localStorage**)
so they survive a refresh on the same device.

- **My Coin Collection** — view all pirate coin badges (earned and locked)
- **Per-level leaderboard** — after each campaign win, with your best run saved locally
- **Campaign rank board** — after beating Level 5, totals stars across all levels
- **Class Challenge board** — scores grouped by room code after you win a shared maze

---

## What you'll figure out (without anyone telling you)

- **Algorithms** are step-by-step plans for solving a problem.
- **Linear search** — checking one door after another — always works, but can be slow.
- **Hints make a huge difference.** A single clue can save many moves.
- **Binary search** — picking the middle and cutting the problem in half — solves
  giant mazes in just a few clicks.

---

## Who it's for

Built for **5th graders**, works in any modern browser on phones, tablets, and
laptops. Nothing to install.

Pick a door. Find the treasure. Get faster every time.

---

## Optional: Supabase

Custom maze codes can be saved via Supabase if configured. A starter schema for
real shared leaderboards lives in [`docs/leaderboard-schema.sql`](docs/leaderboard-schema.sql).
