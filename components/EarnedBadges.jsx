'use client';

export default function EarnedBadges({ badges }) {
  if (!badges?.length) return null;

  return (
    <div className="badges">
      <div className="badges__title">Badges earned this run</div>
      <div className="badges__row">
        {badges.map((badge) => (
          <div className="badge" key={badge.id}>
            <span className="badge__seal" aria-hidden="true">★</span>
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
