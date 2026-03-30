import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden>
        {[...Array(6)].map((_, i) => <div key={i} className={styles.orb} style={{ '--i': i }} />)}
      </div>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>TF</span>
          <span className={styles.brandName}>TaskFlow</span>
        </div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Demo credentials</div>
          <div className={styles.demoRow}>
            <span>User</span>
            <code>user@demo.com / Demo1234</code>
          </div>
          <div className={styles.demoRow}>
            <span>Admin</span>
            <code>admin@demo.com / Admin1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}
