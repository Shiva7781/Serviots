import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [space, setSpace] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState(todayISO());
  const [selection, setSelection] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api
      .get(`/spaces/${id}`)
      .then((res) => setSpace(res.data.space))
      .catch((err) => setError(err.response?.data?.error?.message || 'Space not found'));
  }, [id]);

  const onSelectionChange = useCallback((sel) => setSelection(sel), []);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');
    if (!selection) {
      setBookError('Select a time range on the calendar first.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        space: id,
        date,
        startTime: selection.start,
        endTime: selection.end,
        purpose,
      });
      setBookSuccess('Booking request submitted and is pending admin approval.');
      setPurpose('');
      setSelection(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setBookError(err.response?.data?.error?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!space) return <div className="page"><p>Loading…</p></div>;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="space-detail-header">
        <h1>{space.name}</h1>
        <span className="chip">{space.type === 'desk' ? 'Desk' : 'Meeting Room'}</span>
      </div>
      <p className="muted">
        Capacity: {space.capacity} {space.location && `• ${space.location}`}
      </p>
      {space.description && <p>{space.description}</p>}
      {space.amenities?.length > 0 && (
        <div className="amenities">
          {space.amenities.map((a) => (
            <span key={a} className="chip chip-outline">
              {a}
            </span>
          ))}
        </div>
      )}
      {space.pricePerHour > 0 && <p className="price">₹{space.pricePerHour}/hr</p>}

      <h2>Availability</h2>
      <AvailabilityCalendar
        spaceId={id}
        date={date}
        onDateChange={setDate}
        selectable={user?.role === 'member'}
        onSelectionChange={onSelectionChange}
        refreshKey={refreshKey}
      />

      {user?.role === 'member' && (
        <form className="form booking-form" onSubmit={handleBook}>
          <h3>Book this space</h3>
          {selection ? (
            <p>
              Selected: <strong>{date}</strong> {selection.start} – {selection.end}
            </p>
          ) : (
            <p className="muted">No time range selected yet.</p>
          )}
          <label>
            Purpose (optional)
            <input
              type="text"
              value={purpose}
              maxLength={300}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. client call"
            />
          </label>
          {bookError && <p className="form-error">{bookError}</p>}
          {bookSuccess && <p className="form-success">{bookSuccess}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting || !selection}>
            {submitting ? 'Booking…' : 'Request Booking'}
          </button>
        </form>
      )}

      {!user && (
        <p className="muted">
          <Link to="/login">Log in</Link> as a member to book this space.
        </p>
      )}
      {user?.role === 'admin' && (
        <p className="muted">Admins manage bookings from the Admin dashboard.</p>
      )}
    </div>
  );
}
