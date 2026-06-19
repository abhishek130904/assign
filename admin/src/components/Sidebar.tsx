import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚙️ AdminHub</h1>
        <span>Management Panel</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/stats" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          📊 Stats
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          👥 Users
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="admin-name">{user?.name}</div>
        <div className="admin-role">{user?.role}</div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
