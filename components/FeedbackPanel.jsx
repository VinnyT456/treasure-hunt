'use client';

import { TEMPERATURE_LEVELS } from '@/lib/gameLogic';

export default function FeedbackPanel({ feedback, level, predictionResult }) {
  if (!feedback) {
    return (
      <div className="feedback feedback--idle">
        <div className="feedback__emoji" aria-hidden="true">🗺️</div>
        <div className="feedback__text">
          <div className="feedback__label">Pick a door to begin.</div>
          <div className="feedback__detail">{level.intro}</div>
        </div>
        {level.feedbackType === 'distance' && <TempLegend doorCount={level.doorCount} />}
      </div>
    );
  }

  const color = feedback.color || '#1B1B3A';
  const style = { '--feedback-color': color };

  if (feedback.kind === 'direction' && feedback.key !== 'found') {
    return (
      <div className={'feedback' + feedbackClass(predictionResult)} style={style}>
        <div className="feedback__emoji" aria-hidden="true">👻</div>
        <div className="feedback__text">
          <div className="feedback__label">
            {feedback.key === 'left'
              ? <><span className="feedback__arrow">←</span> Treasure is to the LEFT</>
              : <>Treasure is to the RIGHT <span className="feedback__arrow">→</span></>}
          </div>
          <div className="feedback__detail">
            {predictionText(predictionResult) || 'whispers the friendly ghost'}
          </div>
        </div>
      </div>
    );
  }

  if (feedback.kind === 'found') {
    return (
      <div className="feedback" style={style}>
        <div className="feedback__emoji" aria-hidden="true">💎</div>
        <div className="feedback__text">
          <div className="feedback__label">YOU FOUND IT!</div>
          <div className="feedback__detail">The treasure is yours, smart hunter</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback" style={style}>
      <div className="feedback__emoji" aria-hidden="true">{feedback.emoji}</div>
      <div className="feedback__text">
        <div className="feedback__label">{feedback.label}</div>
        <div className="feedback__detail">
          {feedback.kind === 'distance' && distanceHint(feedback.key)}
          {feedback.kind === 'empty' && 'Just dust and cobwebs in this one.'}
        </div>
      </div>
      {level.feedbackType === 'distance' && <TempLegend doorCount={level.doorCount} activeTempKey={feedback.key} />}
    </div>
  );
}

function feedbackClass(predictionResult) {
  if (predictionResult === 'correct') return ' feedback--prediction-correct';
  if (predictionResult === 'wrong') return ' feedback--prediction-wrong';
  return '';
}

function predictionText(predictionResult) {
  if (predictionResult === 'correct') return 'You called it!';
  if (predictionResult === 'wrong') return 'Good guess. Now follow the clue.';
  return '';
}

// Horizontal temperature scale legend for distance-based levels.
function TempLegend({ doorCount, activeTempKey }) {
  // Compute which temperature labels actually appear for this door count.
  const maxDist = doorCount - 1;
  const seen = new Set();
  for (let d = 1; d <= maxDist; d++) {
    const ratio = d / maxDist;
    for (let i = 1; i < TEMPERATURE_LEVELS.length; i++) {
      if (ratio <= TEMPERATURE_LEVELS[i].threshold) {
        seen.add(TEMPERATURE_LEVELS[i].key);
        break;
      }
    }
  }
  const tiers = TEMPERATURE_LEVELS.slice(1).filter(t => seen.has(t.key));

  return (
    <div className="temp-legend">
      {tiers.map(t => (
        <span
          key={t.key}
          className={'temp-legend__tier' + (activeTempKey === t.key ? ' temp-legend__tier--active' : '')}
          style={{ '--tier-color': t.color }}
        >
          {t.emoji} {t.label}
        </span>
      ))}
    </div>
  );
}

function distanceHint(key) {
  switch (key) {
    case 'blazing': return "you're practically on top of it!";
    case 'hot':     return 'getting really close...';
    case 'warm':    return 'you can feel it nearby.';
    case 'cool':    return 'a bit far. try elsewhere.';
    case 'cold':    return 'way off — try the other side.';
    default:        return '';
  }
}
