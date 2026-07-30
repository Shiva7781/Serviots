import Icon from './Icon';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevron-left" size={15} /> Prev
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next <Icon name="chevron-right" size={15} />
      </button>
    </div>
  );
}
