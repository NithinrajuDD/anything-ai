import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, adminAPI } from '../services/api';
import { PageHeader, StatCard, Card, Badge, Spinner } from '../components/UI';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [taskStatsRes, recentRes] = await Promise.all([
          tasksAPI.getStats(),
          tasksAPI.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
        ]);
        setStats(taskStatsRes.data.data);
        setRecentTasks(recentRes.data.data);

        if (user?.role === 'admin') {
          const adminRes = await adminAPI.getStats();
          setAdminStats(adminRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const getStatusCount = (status) =>
    stats?.byStatus?.find(s => s._id === status)?.count || 0;

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`You have ${getStatusCount('todo')} tasks pending · ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        action={
          <Link to="/tasks">
            <button style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              + New Task
            </button>
          </Link>
        }
      />

      {/* Task stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={stats?.total || 0} icon="◈" color="var(--accent)" />
        <StatCard label="To Do" value={getStatusCount('todo')} icon="○" color="var(--text2)" />
        <StatCard label="In Progress" value={getStatusCount('in-progress')} icon="◑" color="var(--accent2)" />
        <StatCard label="Done" value={getStatusCount('done')} icon="●" color="var(--accent3)" />
      </div>

      {/* Admin stats */}
      {user?.role === 'admin' && adminStats && (
        <>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: 'var(--accent2)' }}>⬟ Admin Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Users" value={adminStats.totalUsers} icon="◉" color="var(--accent)" />
            <StatCard label="Total Tasks" value={adminStats.totalTasks} icon="◈" color="var(--accent2)" />
          </div>
        </>
      )}

      {/* Recent tasks */}
      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Recent Tasks</h2>
      {recentTasks.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>◈</div>
            <div style={{ fontWeight: 600 }}>No tasks yet</div>
            <Link to="/tasks" style={{ fontSize: 13, marginTop: 8, display: 'block' }}>Create your first task →</Link>
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {recentTasks.map((task, i) => (
            <div key={task._id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < recentTasks.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(task.createdAt).toLocaleDateString()}</div>
              </div>
              <Badge label={task.priority} />
              <Badge label={task.status} />
            </div>
          ))}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <Link to="/tasks" style={{ fontSize: 13 }}>View all tasks →</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
