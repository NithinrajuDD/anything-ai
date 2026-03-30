import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
    { to: '/tasks', label: 'Tasks', icon: '◈' },
    { to: '/profile', label: 'Profile', icon: '◉' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: '⬟' }] : []),
  ];

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>TF</span>
          <span className={styles.logoText}>TaskFlow</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⇥</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <main className={styles.main}>
        <button className={styles.hamburger} onClick={() => setMobileOpen(true)}>☰</button>
        <Outlet />
      </main>
    </div>
  );
}
