import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function AvailabilityCalendar({
  spaceId,
  date,
  onDateChange,
  selectable,
  refreshKey,
  onSelectionChange,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selStart, setSelStart] = useState(null);
  const [selEnd, setSelEnd] = useState(null);

  const load = useCallback(async () => {
    if (!spaceId || !date) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/spaces/${spaceId}/availability`, { params: { date } });
      setSlots(res.data.slots);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [spaceId, date]);

  useEffect(() => {
    load();
    setSelStart(null);
    setSelEnd(null);
  }, [load, refreshKey]);

  const handleClick = (slot, idx) => {
    if (!selectable || slot.status !== 'available') return;
    if (selStart === null || (selStart !== null && selEnd !== null)) {
      setSelStart(idx);
      setSelEnd(null);
      return;
    }
    // choosing the end slot - validate every slot in between is available
    const [from, to] = idx >= selStart ? [selStart, idx] : [idx, selStart];
    const rangeOk = slots.slice(from, to + 1).every((s) => s.status === 'available');
    if (!rangeOk) {
      setSelStart(idx);
      setSelEnd(null);
      return;
    }
    setSelStart(from);
    setSelEnd(to);
  };

  useEffect(() => {
    if (!onSelectionChange) return;
    if (selStart !== null && selEnd !== null) {
      onSelectionChange({ start: slots[selStart]?.start, end: slots[selEnd]?.end });
    } else {
      onSelectionChange(null);
    }
  }, [selStart, selEnd, slots, onSelectionChange]);

  const isSelected = (idx) => {
    if (selStart === null) return false;
    if (selEnd === null) return idx === selStart;
    const [from, to] = selEnd >= selStart ? [selStart, selEnd] : [selEnd, selStart];
    return idx >= from && idx <= to;
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <label>
          Date
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </label>
        <div className="legend">
          <span className="legend-item">
            <i className="dot dot-available" /> Available
          </span>
          <span className="legend-item">
            <i className="dot dot-pending" /> Pending
          </span>
          <span className="legend-item">
            <i className="dot dot-approved" /> Booked
          </span>
          <span className="legend-item">
            <i className="dot dot-maintenance" /> Maintenance
          </span>
        </div>
      </div>

      {loading && <p>Loading availability…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <div className="slot-grid">
          {slots.map((slot, idx) => (
            <button
              type="button"
              key={slot.start}
              className={`slot slot-${slot.status} ${isSelected(idx) ? 'slot-selected' : ''}`}
              disabled={!selectable || slot.status !== 'available'}
              title={`${slot.start} - ${slot.end} (${slot.status})`}
              onClick={() => handleClick(slot, idx)}
            >
              {slot.start}
            </button>
          ))}
        </div>
      )}
      {selectable && (
        <p className="calendar-hint">
          Click a free slot to start a selection, then click another free slot to set the end of
          the range.
        </p>
      )}
    </div>
  );
}
