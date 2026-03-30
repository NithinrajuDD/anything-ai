import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('Password must contain uppercase, lowercase, and a number.'); return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Join TaskFlow today</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required placeholder="John Doe"
              autoComplete="name"
            />
          </div>
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
              onChange={handleChange} required placeholder="Min. 8 chars, uppercase, number"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
