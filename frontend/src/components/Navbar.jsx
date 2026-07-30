import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <header className="navbar">
      <div className={`navbar-inner ${open ? 'open' : ''}`}>
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <Icon name="building" size={20} />
          Serviots
        </NavLink>
        <button
          type="button"
          className="navbar-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'x' : 'menu'} size={20} />
        </button>

        <nav className="nav-links">
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
            <Icon name="grid" size={16} /> Spaces
          </NavLink>
          {user?.role === 'member' && (
            <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              <Icon name="calendar" size={16} /> My Bookings
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
              <Icon name="shield" size={16} /> Admin
            </NavLink>
          )}
        </nav>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">
                {user.name} <span className="role-pill">{user.role}</span>
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                <Icon name="log-out" size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>
                <Icon name="log-in" size={15} /> Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                <Icon name="user-plus" size={15} /> Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
