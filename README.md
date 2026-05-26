# 🗝️ Treasure Hunt — An Algorithm Adventure

A tiny educational game where 5th graders find hidden treasure behind one of
many doors — and quietly learn what algorithms are along the way.

No lectures. No textbook definitions. Just a maze, some clues, and the slow
realization that *how* you search matters as much as *where* you search.

---

## 🎮 How to play

You're standing at the start of a hallway. Somewhere behind one of the doors
is a treasure. Click a door to open it. The game tells you what you found —
sometimes nothing, sometimes a hint about how close you are, sometimes which
direction to go next. Find the treasure in as few moves as you can.

That's it. That's the whole game.

---

## 🌍 The four levels

| Level | Name              | Doors | Clue you get             | Twist            |
|------:|-------------------|------:|--------------------------|------------------|
| 1     | The Maze          | 10    | None at all              | —                |
| 2     | Hot or Cold       | 10    | Temperature (hot ↔ cold) | —                |
| 3     | The Friendly Ghost| 12    | "Treasure is left/right" | —                |
| 4     | The Master Hunter | 20    | "Treasure is left/right" | Only 5 moves!    |

Each level builds on the last. By Level 4 you'll be solving a 20-door maze in
5 moves without realizing you just learned binary search.

---

## ⭐ Stars and scoring

Every level rewards you with up to **three stars** based on how few moves you
used:

- ⭐⭐⭐ — Perfect run. You used the smartest possible strategy.
- ⭐⭐ — Good run. You used the clues well.
- ⭐ — You found it! Try again to beat your record.

Stars unlock the next level, but you can replay any unlocked level any time.

---

## 🎨 What it looks like

The game has a warm, storybook feel — parchment background, hand-drawn doors,
big chunky letters, and a friendly ghost who whispers clues. Doors change
color as you try them: blue for cold, red for hot, gold for treasure. After
each click, a big animated message tells you what you found, and a strip
along the bottom remembers every door you've tried so far.

When you finish a level, you'll see your full path through the maze, your
star rating, and one short reflection question — pick the answer that
matches what you did, and the game gives you a tip for next time.

---

## 🧠 What you'll figure out (without anyone telling you)

- **Algorithms** are just step-by-step plans for solving a problem.
- **Linear search** — checking one door after another — always works, but
  it can be slow.
- **Hints make a huge difference.** A single piece of information can save
  you a dozen moves.
- **Binary search** — picking the middle and cutting the problem in half —
  is the secret to solving giant mazes in just a few clicks.

You won't read those words during gameplay. You'll just *do* them, and the
game will name what you've already mastered.

---

## 👤 Who it's for

This game is built for **5th graders** but works for anyone curious about
how computers find things. It runs in any modern web browser, works on
phones, tablets, and laptops, and needs nothing to install.

Pick a door. Find the treasure. Get faster every time.

🏆

---

## 🛠️ Leaderboard

After each campaign win you’ll see a **preview leaderboard**: pretend names,
stars, and moves so you can try the UI without wiring up a backend. Progress
and journal entries last for your current visit only (they reset on reload).

If you ever want shared real scores via Supabase, there is starter SQL in
[`docs/leaderboard-schema.sql`](docs/leaderboard-schema.sql); you’d plug it
into the app separately from this demo view.