import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';

const emptyForm = {
  name: '',
  type: 'desk',
  capacity: 1,
  amenities: '',
  description: '',
  location: '',
  pricePerHour: 0,
  isActive: true,
};

export default function AdminSpaces() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/spaces', { params: { page, limit: 8 } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load spaces'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (space) => {
    setEditingId(space._id);
    setForm({
      name: space.name,
      type: space.type,
      capacity: space.capacity,
      amenities: (space.amenities || []).join(', '),
      description: space.description || '',
      location: space.location || '',
      pricePerHour: space.pricePerHour || 0,
      isActive: space.isActive,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    const payload = {
      name: form.name,
      type: form.type,
      capacity: Number(form.capacity),
      amenities: form.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      description: form.description,
      location: form.location,
      pricePerHour: Number(form.pricePerHour) || 0,
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await api.patch(`/spaces/${editingId}`, payload);
      } else {
        await api.post('/spaces', payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to save space');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (space) => {
    if (!window.confirm(`Delete "${space.name}"? This also removes its bookings.`)) return;
    try {
      await api.delete(`/spaces/${space._id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete space');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Spaces</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Space
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.type === 'desk' ? 'Desk' : 'Meeting Room'}</td>
                    <td>{s.capacity}</td>
                    <td>{s.isActive ? 'Yes' : 'No'}</td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p>No spaces yet.</p>}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Space' : 'Add Space'}</h3>
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="desk">Desk</option>
                  <option value="meeting_room">Meeting Room</option>
                </select>
              </label>
              <label>
                Capacity
                <input
                  type="number"
                  min="1"
                  required
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </label>
              <label>
                Amenities (comma separated)
                <input
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  placeholder="projector, whiteboard"
                />
              </label>
              <label>
                Location
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </label>
              <label>
                Price per hour
                <input
                  type="number"
                  min="0"
                  value={form.pricePerHour}
                  onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              {editingId && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active (visible to visitors)
                </label>
              )}
              {formError && <p className="form-error">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
