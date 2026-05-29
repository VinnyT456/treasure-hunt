'use client';

export default function EarnedBadges({ badges, newBadgeIds }) {
  if (!badges?.length) return null;

  const newSet = new Set(newBadgeIds || []);

  return (
    <div className="badges">
      <div className="badges__title">Coins earned this run</div>
      <div className="badges__row">
        {badges.map((badge) => (
          <div
            className={
              'badge coin-badge coin-badge--earned coin-badge--compact' +
              (newSet.has(badge.id) ? ' coin-badge--fresh' : '')
            }
            key={badge.id}
          >
            <div className="coin-badge__coin" aria-hidden="true">
              <span className="coin-badge__rim" />
              <span className="coin-badge__face">{badge.icon || '⚓'}</span>
            </div>
            <div>
              <strong>{badge.label}</strong>
              <span>{badge.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
