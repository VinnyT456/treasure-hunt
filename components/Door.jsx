'use client';

export default function Door({ index, displayNumber, attempt, disabled, eliminated, isReveal, suggested, onOpen }) {
  const isTried = !!attempt;
  const isFound = attempt?.feedback?.kind === 'found';

  const style = isTried
    ? { '--door-tried-color': attempt.feedback.color || '#94A3B8' }
    : undefined;

  let badgeText = '';
  if (attempt) {
    if (attempt.feedback.kind === 'found') badgeText = 'TREASURE!';
    else if (attempt.feedback.kind === 'distance') badgeText = attempt.feedback.label;
    else if (attempt.feedback.kind === 'direction') {
      badgeText = attempt.feedback.key === 'left' ? '← LEFT' : (attempt.feedback.key === 'right' ? 'RIGHT →' : '');
    } else if (attempt.feedback.kind === 'empty') badgeText = 'EMPTY';
  }

  return (
    <div className={
      'door-wrap' +
      (eliminated ? ' door-wrap--eliminated' : '') +
      (isReveal ? ' door-wrap--reveal' : '') +
      (suggested && !isTried && !eliminated ? ' door-wrap--suggested' : '')
    }>
      <button
        className={
          'door' +
          (isTried ? ' door--tried' : '') +
          (isFound ? ' door--found' : '') +
          (isReveal ? ' door--reveal' : '')
        }
        style={style}
        disabled={disabled || isTried || eliminated}
        onClick={() => onOpen(index)}
        aria-label={
          isReveal
            ? `Door ${displayNumber} — treasure was here!`
            : `Door ${displayNumber}` + (isTried ? `, ${badgeText || 'already tried'}` : '') +
              (eliminated ? ', eliminated' : '')
        }
      >
        {suggested && !isTried && !eliminated && (
          <span className="door__hint-ring" aria-hidden="true">middle</span>
        )}
        {isTried && (
          <span className="door__overlay" aria-hidden="true">
            {attempt.feedback.emoji || '✕'}
          </span>
        )}
        {isReveal && !isTried && (
          <span className="door__overlay" aria-hidden="true">💎</span>
        )}
      </button>
      <span className="door__num">{displayNumber}</span>
      <span
        className={'door__badge' + (badgeText ? '' : ' door__badge--empty')}
        style={badgeText ? { background: attempt.feedback.color, color: attempt.feedback.kind === 'distance' && attempt.feedback.key === 'warm' ? '#1B1B3A' : '#FFF8EC' } : undefined}
      >
        {badgeText || '·'}
      </span>
    </div>
  );
}
