'use client';

import { BADGES, BADGE_GROUPS } from '@/lib/badges';

function BadgeCard({ badge, earned }) {
  return (
    <div
      className={
        'coin-badge coin-badge--compact' +
        (earned ? ' coin-badge--earned' : ' coin-badge--locked')
      }
    >
      <div className="coin-badge__coin" aria-hidden="true">
        <span className="coin-badge__face">{earned ? (badge.icon || '⚓') : '?'}</span>
      </div>
      <div className="coin-badge__copy">
        <strong className="coin-badge__label">{badge.label}</strong>
        <span className="coin-badge__detail">{badge.detail}</span>
      </div>
    </div>
  );
}

export default function BadgesPage({ badgesEarned, onBack }) {
  const earnedIds = new Set((badgesEarned || []).map((b) => b.id));
  const all = Object.values(BADGES);
  const total = all.length;

  return (
    <div className="badges-page">
      <button className="btn btn--ghost badges-page__back" type="button" onClick={onBack}>
        ← Menu
      </button>
      <h2 className="badges-page__title">My Coin Collection</h2>
      <p className="badges-page__sub">
        Earn pirate coins by mastering hunts. {earnedIds.size} of {total} collected.
      </p>

      <div className="badges-page__mosaic">
        {BADGE_GROUPS.map((group) => {
          const coins = all.filter((b) => b.group === group.id);
          if (!coins.length) return null;
          return (
            <div key={group.id} className="badges-page__group">
              <h3 className="badges-page__section-title">{group.title}</h3>
              <div className="badges-page__grid">
                {coins.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} earned={earnedIds.has(badge.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
