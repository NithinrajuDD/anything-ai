import React from 'react';

/* ─── Toast notification ─── */
export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  const colors = { success: '#6af7c5', error: '#f76a6a', info: '#7c6af7' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: 'var(--bg3)', border: `1px solid ${colors[type]}`,
      borderRadius: 10, padding: '14px 20px', maxWidth: 340,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideIn 0.25s ease',
    }}>
      <span style={{ color: colors[type], fontSize: 18 }}>
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 16, padding: 0 }}>×</button>
      <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}

/* ─── Page header ─── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 26, letterSpacing: -0.5, marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Card ─── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 24, ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Stat Card ─── */
export function StatCard({ label, value, color = 'var(--accent)', icon }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}22`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      </div>
    </Card>
  );
}

/* ─── Primary Button ─── */
export function Btn({ children, onClick, variant = 'primary', disabled, loading, size = 'md', type = 'button', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: size === 'sm' ? '7px 14px' : '11px 22px',
    fontSize: size === 'sm' ? 13 : 14,
    fontWeight: 700, borderRadius: 8, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, transition: 'all 0.2s',
    ...style
  };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    danger: { background: 'var(--danger)', color: '#fff' },
    ghost: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' },
    success: { background: 'var(--accent3)', color: 'var(--bg)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant] }}>
      {loading ? '⟳ Loading…' : children}
    </button>
  );
}

/* ─── Badge ─── */
export function Badge({ label, color }) {
  const colors = {
    todo: '#8888aa', 'in-progress': '#f7c56a', done: '#6af7c5',
    low: '#6af7c5', medium: '#f7c56a', high: '#f76a6a',
    user: '#7c6af7', admin: '#f7c56a',
  };
  const c = color || colors[label] || '#8888aa';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
      background: `${c}22`, color: c, border: `1px solid ${c}44`,
      fontFamily: 'var(--font-mono)',
    }}>{label}</span>
  );
}

/* ─── Empty state ─── */
export function Empty({ icon = '◈', text = 'Nothing here yet' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text2)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{text}</div>
    </div>
  );
}

/* ─── Loading spinner ─── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 28, width: '100%', maxWidth: width,
        animation: 'fadeUp 0.2s ease',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 22, padding: 0 }}>×</button>
        </div>
        {children}
      </div>
      <style>{`@keyframes fadeUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </div>
  );
}

/* ─── Form field ─── */
export function Field({ label, error, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5 }}>{error}</div>}
    </div>
  );
}
