import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Icon from '../components/Icon';

export default function MemberDashboard() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (status) params.status = status;
    api
      .get('/bookings/mine', { params })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const isFuture = (b) => new Date(`${b.date}T${b.startTime}:00`).getTime() > Date.now();

  const handleCancel = async (id) => {
    setActionError('');
    setCancellingId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page">
      <h1>
        <Icon name="calendar" size={22} /> My Bookings
      </h1>

      <div className="filters-bar">
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {actionError && <p className="form-error">{actionError}</p>}

      {!loading && !error && (
        <>
          <p className="table-scroll-hint">
            <Icon name="chevron-right" size={12} /> Scroll sideways to see all columns
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Space</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <Link to={`/spaces/${b.space?._id}`}>{b.space?.name || 'Deleted space'}</Link>
                    </td>
                    <td>{b.date}</td>
                    <td>
                      {b.startTime} – {b.endTime}
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>{b.purpose || '—'}</td>
                    <td>
                      {['pending', 'approved'].includes(b.status) && isFuture(b) && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancel(b._id)}
                        >
                          <Icon name="x-circle" size={13} />{' '}
                          {cancellingId === b._id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>No bookings yet. Go book a space!</p>}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
