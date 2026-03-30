import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { PageHeader, Card, Btn, Field, Toast, Badge } from '../components/UI';
import { useToast } from '../hooks/useToast';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const { data } = await usersAPI.updateProfile({ name: nameForm.name });
      setUser(data.data.user);
      showToast('Name updated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSavingName(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    setSavingPw(true);
    try {
      await usersAPI.changePassword(pwForm);
      showToast('Password changed successfully!', 'success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally { setSavingPw(false); }
  };

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={hideToast} />
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Account Info */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, flexShrink: 0,
            }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{user?.name}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>{user?.email}</div>
              <div style={{ marginTop: 6 }}><Badge label={user?.role} /></div>
            </div>
          </div>

          <form onSubmit={handleUpdateName}>
            <Field label="Display Name" required>
              <input
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email">
              <input value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </Field>
            <Btn type="submit" loading={savingName}>Update Name</Btn>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Change Password</h2>
          {pwError && (
            <div style={{ background: 'rgba(247,106,106,0.12)', border: '1px solid rgba(247,106,106,0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>
              {pwError}
            </div>
          )}
          <form onSubmit={handleChangePw}>
            <Field label="Current Password" required>
              <input
                type="password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Current password"
              />
            </Field>
            <Field label="New Password" required>
              <input
                type="password" value={pwForm.newPassword}
                onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Min. 8 chars"
              />
            </Field>
            <Btn type="submit" loading={savingPw}>Change Password</Btn>
          </form>
        </Card>

        {/* Account Details */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Account Details</h2>
          {[
            { label: 'User ID', value: user?._id, mono: true },
            { label: 'Role', value: user?.role },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>{label}</span>
              <span style={{ fontSize: 13, fontFamily: mono ? 'var(--font-mono)' : 'inherit', color: 'var(--text)', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
