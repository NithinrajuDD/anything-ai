import React, { useEffect, useState, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import { PageHeader, Card, Badge, Btn, Modal, Field, Empty, Spinner, Toast } from '../components/UI';
import { useToast } from '../hooks/useToast';

const EMPTY_FORM = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1, limit: 10 });
  const [modal, setModal] = useState({ open: false, mode: 'create', task: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data);
      setMeta(data.meta);
    } catch { showToast('Failed to load tasks', 'error'); }
    finally { setLoading(false); }
  }, [filters, showToast]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal({ open: true, mode: 'create', task: null }); };
  const openEdit = (task) => {
    setForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setFormError('');
    setModal({ open: true, mode: 'edit', task });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    setSaving(true); setFormError('');
    try {
      if (modal.mode === 'create') {
        await tasksAPI.create(form);
        showToast('Task created!', 'success');
      } else {
        await tasksAPI.update(modal.task._id, form);
        showToast('Task updated!', 'success');
      }
      setModal({ open: false });
      loadTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save task.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      setDeleteConfirm(null);
      showToast('Task deleted.', 'success');
      loadTasks();
    } catch { showToast('Failed to delete task.', 'error'); }
  };

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={hideToast} />

      <PageHeader
        title="Tasks"
        subtitle={`${meta.total || 0} task${meta.total !== 1 ? 's' : ''} total`}
        action={<Btn onClick={openCreate}>+ New Task</Btn>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search tasks…" value={filters.search}
          onChange={(e) => handleFilter('search', e.target.value)}
          style={{ width: 220 }}
        />
        <select value={filters.status} onChange={(e) => handleFilter('status', e.target.value)} style={{ width: 140 }}>
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filters.priority} onChange={(e) => handleFilter('priority', e.target.value)} style={{ width: 140 }}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? <Spinner /> : tasks.length === 0 ? (
        <Empty icon="◈" text="No tasks found. Create one!" />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {tasks.map((task, i) => (
            <div key={task._id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              {/* Status circle */}
              <div
                onClick={async () => {
                  const next = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
                  await tasksAPI.update(task._id, { status: next });
                  loadTasks();
                }}
                title="Click to cycle status"
                style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  background: task.status === 'done' ? 'var(--accent3)' : task.status === 'in-progress' ? 'var(--accent2)' : 'var(--border)',
                  border: '2px solid',
                  borderColor: task.status === 'done' ? 'var(--accent3)' : task.status === 'in-progress' ? 'var(--accent2)' : 'var(--text2)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: 14, marginBottom: 2,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'var(--text2)' : 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.description}
                  </div>
                )}
                {task.dueDate && (
                  <div style={{ fontSize: 11, color: task.isOverdue ? 'var(--danger)' : 'var(--text2)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {task.isOverdue ? '⚠ ' : ''}Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <Badge label={task.priority} />
                <Badge label={task.status} />
                <Btn size="sm" variant="ghost" onClick={() => openEdit(task)}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => setDeleteConfirm(task)}>Del</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <Btn size="sm" variant="ghost" disabled={!meta.hasPrevPage} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</Btn>
          <span style={{ padding: '7px 14px', fontSize: 13, color: 'var(--text2)' }}>Page {meta.page} of {meta.totalPages}</span>
          <Btn size="sm" variant="ghost" disabled={!meta.hasNextPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</Btn>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.mode === 'create' ? 'Create Task' : 'Edit Task'}
      >
        <form onSubmit={handleSave}>
          {formError && <div style={{ background: 'rgba(247,106,106,0.12)', border: '1px solid rgba(247,106,106,0.4)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>{formError}</div>}
          <Field label="Title" required>
            <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" rows={3} style={{ resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>
          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal({ open: false })}>Cancel</Btn>
            <Btn type="submit" loading={saving}>{modal.mode === 'create' ? 'Create' : 'Save'}</Btn>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" width={380}>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{deleteConfirm?.title}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</Btn>
        </div>
      </Modal>
    </div>
  );
}
