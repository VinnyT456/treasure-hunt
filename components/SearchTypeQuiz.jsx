'use client';

import { useMemo, useState } from 'react';
import { checkApproximateBinarySearch } from '@/lib/gameLogic';

const OPTIONS = [
  { id: 'linear', label: 'Linear search', detail: 'Checked doors one by one.' },
  { id: 'binary', label: 'Binary search', detail: 'Cut the search in half each time.' },
  { id: 'random', label: 'Mostly guessing', detail: 'Tried doors without a steady plan.' },
];

export default function SearchTypeQuiz({ attempts, level }) {
  const [answer, setAnswer] = useState(null);
  const correct = useMemo(() => getSearchType(attempts, level), [attempts, level]);

  return (
    <div className="quiz">
      <div className="quiz__title">What kind of search was that?</div>
      <div className="quiz__options">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            className={
              'quiz__option' +
              (answer === option.id ? ' quiz__option--picked' : '') +
              (answer && option.id === correct ? ' quiz__option--correct' : '')
            }
            onClick={() => setAnswer(option.id)}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.detail}</span>
          </button>
        ))}
      </div>
      {answer && (
        <p className="quiz__result">
          {answer === correct
            ? 'Exactly. You can name the strategy now.'
            : `Good thinking. This run is best described as ${OPTIONS.find((o) => o.id === correct)?.label.toLowerCase()}.`}
        </p>
      )}
      {!answer && (
        <button className="quiz__skip" onClick={() => setAnswer(correct)} type="button">
          I am not sure
        </button>
      )}
    </div>
  );
}

function getSearchType(attempts, level) {
  if (level.feedbackType === 'direction' && checkApproximateBinarySearch(attempts, level.doorCount)) {
    return 'binary';
  }

  const checkedInOrder = attempts.every((attempt, i) => i === 0 || attempt.doorIndex >= attempts[i - 1].doorIndex);
  if (checkedInOrder && attempts.length > Math.ceil(Math.log2(Math.max(2, level.doorCount)))) {
    return 'linear';
  }

  return 'random';
}
