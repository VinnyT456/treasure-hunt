'use client';

export default function StarRating({ count, max = 3, size = 'md', className = '' }) {
  const sizeClass = size === 'lg' ? 'star-rating--lg' : size === 'sm' ? 'star-rating--sm' : '';
  return (
    <div className={`star-rating ${sizeClass} ${className}`.trim()} aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={'star-rating__star' + (i < count ? '' : ' star-rating__star--off')}>
          ★
        </span>
      ))}
    </div>
  );
}

export function StarIcon({ earned }) {
  return <span className={'star-rating__criterion' + (earned ? '' : ' star-rating__criterion--off')}>★</span>;
}
