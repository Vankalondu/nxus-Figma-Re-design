import React from 'react';

/**
 * Page control shared by the Lead Scout reports list and the profile Photo library (P-CO19).
 * "Prev 1 … 4 5 6 … 12 Next Last" — numbered pills with the current page filled. Renders
 * nothing when everything fits on one page.
 */
export const Pagination = ({ page, totalPages, onPage, showLast = false }: {
  page: number; totalPages: number; onPage: (p: number) => void; showLast?: boolean;
}) => {
  if (totalPages <= 1) return null;
  const nums: (number | string)[] = [1];
  if (page > 3) nums.push('…l');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) nums.push(p);
  if (page < totalPages - 2) nums.push('…r');
  nums.push(totalPages);
  const pill = 'min-w-9 h-9 px-3 rounded-full font-body font-bold text-[14px] flex items-center justify-center transition-colors';
  const edge = pill + ' bg-surface-card border border-default disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-2 pt-4 shrink-0 flex-wrap">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className={edge + ' text-body hover:text-strong'}>Prev</button>
      {nums.map((n, i) => typeof n === 'string'
        ? <span key={n + i} className="px-1 text-body">…</span>
        : <button key={n} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
            className={pill + (n === page ? ' bg-brand-primary text-on-brand' : ' bg-surface-card border border-default text-strong hover:border-brand-primary')}>{n}</button>
      )}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={edge + ' text-link hover:bg-surface-accent'}>Next</button>
      {showLast && (
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages} className={edge + ' text-link hover:bg-surface-accent'}>Last</button>
      )}
    </nav>
  );
};
