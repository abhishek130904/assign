import React from 'react';

interface PaginationProps { page: number; totalPages: number; onPage: (p: number) => void; }

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPage }) => (
  <div className="pagination">
    <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ Prev</button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
      <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>{p}</button>
    ))}
    <button className="page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next ›</button>
  </div>
);

export default Pagination;
