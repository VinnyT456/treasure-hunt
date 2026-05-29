export const TUTORIALS = {
  linear: {
    id: 'linear',
    title: 'Linear Search',
    steps: [
      {
        title: 'One door at a time',
        body: 'Linear search means checking doors in order — door 1, then 2, then 3 — until you find the treasure.',
        visual: 'linear-demo',
      },
      {
        title: 'Penny uses this too',
        body: 'Remember Penny? She always searches this way. It always works, but on big mazes it can take many doors opened.',
        visual: 'penny',
      },
      {
        title: 'Your turn',
        body: 'On the next levels, clues will help you skip doors — but linear search is the backup plan every hunter knows.',
        visual: null,
      },
    ],
  },
  binary: {
    id: 'binary',
    title: 'Split the Search',
    steps: [
      {
        title: 'Pick the middle',
        body: 'When the ghost says left or right, you can eliminate half the hallway. Start by opening the middle door of what is left.',
        visual: 'binary-demo',
      },
      {
        title: 'Cut in half again',
        body: 'Each clue shrinks the hunt zone. Pick the new middle of the smaller range. That strategy is called binary search.',
        visual: 'binary-demo',
      },
      {
        title: 'Few moves, big mazes',
        body: 'With binary search, even 100 doors can be solved in about 7 smart moves. Level 4 is up next — good luck!',
        visual: null,
      },
    ],
  },
};

export function getLevelIntro(level, tutorialsSeen) {
  if (level.id === 5 && tutorialsSeen?.binarySeen && level.introBinary) {
    return level.introBinary;
  }
  return level.intro;
}
