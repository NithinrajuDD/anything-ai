import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { PageHeader, Card, StatCard, Badge, Btn, Modal, Spinner, Toast, Empty } from '../components/UI';
import { useToast } from '../hooks/useToast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: '', search: '' });
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ role: 'user', isActive: true });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.role) params.role = filters.role;
      if (filters.search) params.search = filters.search;
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(params),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setMeta(usersRes.data.meta);
    } catch { showToast('Failed to load admin data', 'error'); }
    finally { setLoading(false); }
  }, [filters, showToast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u) => {
    setEditForm({ role: u.role, isActive: u.isActive });
    setEditModal({ open: true, user: u });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editModal.user._id, editForm);
      showToast('User updated!', 'success');
      setEditModal({ open: false });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      setDeleteConfirm(null);
      showToast('User deleted.', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={hideToast} />
      <PageHeader title="Admin Panel" subtitle="Manage users and view platform stats" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="◉" color="var(--accent)" />
        <StatCard label="Total Tasks" value={stats?.totalTasks || 0} icon="◈" color="var(--accent2)" />
        {stats?.tasksByStatus?.map(s => (
          <StatCard key={s._id} label={s._id} value={s.count} icon="○" color="var(--accent3)" />
        ))}
      </div>

      {/* Users table */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search users…" value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          style={{ width: 220 }}
        />
        <select value={filters.role} onChange={(e) => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))} style={{ width: 140 }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {users.length === 0 ? <Empty icon="◉" text="No users found" /> : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 120px', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
          </div>
          {users.map((u, i) => (
            <div key={u._id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px 120px',
              gap: 12, padding: '14px 20px', alignItems: 'center',
              borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 13,
            }}>
              <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
              <div style={{ color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
              <Badge label={u.role} />
              <Badge label={u.isActive ? 'active' : 'inactive'} color={u.isActive ? '#6af7c5' : '#f76a6a'} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => openEdit(u)}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => setDeleteConfirm(u)}>Del</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <Btn size="sm" variant="ghost" disabled={!meta.hasPrevPage} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</Btn>
          <span style={{ padding: '7px 14px', fontSize: 13, color: 'var(--text2)' }}>Page {meta.page} of {meta.totalPages}</span>
          <Btn size="sm" variant="ghost" disabled={!meta.hasNextPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</Btn>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false })} title={`Edit: ${editModal.user?.name}`} width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Role</label>
            <select value={editForm.role} onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Status</label>
            <select value={editForm.isActive ? 'active' : 'inactive'} onChange={(e) => setEditForm(f => ({ ...f, isActive: e.target.value === 'active' }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" onClick={() => setEditModal({ open: false })}>Cancel</Btn>
            <Btn onClick={handleSave} loading={saving}>Save</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User" width={380}>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
          Delete <strong style={{ color: 'var(--text)' }}>{deleteConfirm?.name}</strong>? This will also delete all their tasks.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</Btn>
        </div>
      </Modal>
    </div>
  );
}
