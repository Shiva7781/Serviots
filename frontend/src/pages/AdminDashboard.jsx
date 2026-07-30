import { useState } from 'react';
import AdminSpaces from './admin/AdminSpaces';
import AdminBookings from './admin/AdminBookings';
import AdminMaintenance from './admin/AdminMaintenance';
import Icon from '../components/Icon';

const TABS = [
  { key: 'bookings', label: 'Bookings', icon: 'calendar' },
  { key: 'spaces', label: 'Spaces', icon: 'grid' },
  { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('bookings');

  return (
    <div className="page">
      <h1>
        <Icon name="shield" size={22} /> Admin Dashboard
      </h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={15} /> {t.label}
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
