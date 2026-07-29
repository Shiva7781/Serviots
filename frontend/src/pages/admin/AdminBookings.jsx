import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

export default function AdminBookings() {
  const [filters, setFilters] = useState({ status: 'pending', date: '', space: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;
    if (filters.space) params.space = filters.space;
    api
      .get('/admin/bookings', { params })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleApprove = async (id) => {
    setActionError('');
    setBusyId(id);
    try {
      await api.patch(`/admin/bookings/${id}/approve`);
      load();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to approve booking');
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (id) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const submitReject = async (id) => {
    setActionError('');
    setBusyId(id);
    try {
      await api.patch(`/admin/bookings/${id}/reject`, { reason: rejectReason });
      setRejectingId(null);
      load();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to reject booking');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Booking Approval Queue</h2>
      </div>

      <div className="filters-bar">
        <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => updateFilter('date', e.target.value)}
        />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {actionError && <p className="form-error">{actionError}</p>}

      {!loading && !error && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Space</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b._id}>
                    <td>{b.user?.name || '—'}<br /><span className="muted small">{b.user?.email}</span></td>
                    <td>{b.space?.name || 'Deleted space'}</td>
                    <td>{b.date}</td>
                    <td>{b.startTime} – {b.endTime}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="row-actions">
                      {b.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={busyId === b._id}
                            onClick={() => handleApprove(b._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={busyId === b._id}
                            onClick={() => openReject(b._id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {rejectingId === b._id && (
                        <div className="inline-reject">
                          <input
                            type="text"
                            placeholder="Reason (optional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={busyId === b._id}
                            onClick={() => submitReject(b._id)}
                          >
                            Confirm
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setRejectingId(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>No bookings match these filters.</p>}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
