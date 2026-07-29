import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const emptyFilters = { search: '', type: '', minCapacity: '', date: '' };

export default function SpacesPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = { page, limit: 6 };
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.minCapacity) params.minCapacity = filters.minCapacity;
    if (filters.date) params.date = filters.date;

    api
      .get('/spaces', { params })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error?.message || 'Failed to load spaces');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="page">
      <h1>Browse Spaces</h1>
      <p className="muted">Find a desk or meeting room and check real-time availability.</p>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search by name or type…"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}>
          <option value="">All types</option>
          <option value="desk">Desk</option>
          <option value="meeting_room">Meeting Room</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Min capacity"
          value={filters.minCapacity}
          onChange={(e) => updateFilter('minCapacity', e.target.value)}
        />
        <input
          type="date"
          value={filters.date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => updateFilter('date', e.target.value)}
        />
        {(filters.search || filters.type || filters.minCapacity || filters.date) && (
          <button className="btn btn-ghost" onClick={() => setFilters(emptyFilters)}>
            Clear
          </button>
        )}
      </div>

      {loading && <p>Loading spaces…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <p className="muted">{data.total} space(s) found</p>
          <div className="space-grid">
            {data.items.map((space) => (
              <Link to={`/spaces/${space._id}`} key={space._id} className="space-card">
                <div className="space-card-header">
                  <h3>{space.name}</h3>
                  <span className="chip">{space.type === 'desk' ? 'Desk' : 'Meeting Room'}</span>
                </div>
                <p className="muted">Capacity: {space.capacity}</p>
                {space.location && <p className="muted">{space.location}</p>}
                {space.amenities?.length > 0 && (
                  <div className="amenities">
                    {space.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="chip chip-outline">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {space.pricePerHour > 0 && <p className="price">₹{space.pricePerHour}/hr</p>}
              </Link>
            ))}
          </div>
          {data.items.length === 0 && <p>No spaces match your filters.</p>}
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
