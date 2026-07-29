import { useState } from 'react';
import AdminSpaces from './admin/AdminSpaces';
import AdminBookings from './admin/AdminBookings';
import AdminMaintenance from './admin/AdminMaintenance';

const TABS = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'spaces', label: 'Spaces' },
  { key: 'maintenance', label: 'Maintenance' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('bookings');

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === 'bookings' && <AdminBookings />}
        {tab === 'spaces' && <AdminSpaces />}
        {tab === 'maintenance' && <AdminMaintenance />}
      </div>
    </div>
  );
}
