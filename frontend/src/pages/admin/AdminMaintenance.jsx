import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Icon from '../../components/Icon';

const emptyForm = { space: '', date: '', startTime: '', endTime: '', reason: '' };

export default function AdminMaintenance() {
  const [spaces, setSpaces] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/spaces', { params: { limit: 100 } }),
      api.get('/admin/maintenance'),
    ])
      .then(([spacesRes, maintRes]) => {
        setSpaces(spacesRes.data.items);
        setItems(maintRes.data.items);
      })
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/admin/maintenance', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create maintenance block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this maintenance block?')) return;
    try {
      await api.delete(`/admin/maintenance/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove block');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>
          <Icon name="wrench" size={18} /> Maintenance Windows
        </h2>
      </div>

      <form className="form form-inline" onSubmit={handleSubmit}>
        <label>
          Space
          <select
            required
            value={form.space}
            onChange={(e) => setForm({ ...form, space: e.target.value })}
          >
            <option value="">Select…</option>
            {spaces.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label>
          Start
          <input
            type="time"
            required
            step="1800"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </label>
        <label>
          End
          <input
            type="time"
            required
            step="1800"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </label>
        <label className="grow">
          Reason
          <input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="e.g. Deep cleaning"
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          <Icon name="plus" size={15} /> {submitting ? 'Adding…' : 'Add Block'}
        </button>
      </form>
      {formError && <p className="form-error">{formError}</p>}

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

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
                <th>Reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id}>
                  <td>{m.space?.name || 'Deleted space'}</td>
                  <td>{m.date}</td>
                  <td>
                    {m.startTime} – {m.endTime}
                  </td>
                  <td>{m.reason}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>
                      <Icon name="trash" size={13} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p>No maintenance blocks scheduled.</p>}
        </div>
        </>
      )}
    </div>
  );
}
