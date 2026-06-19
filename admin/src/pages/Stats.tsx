import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import Spinner from '../components/Spinner';

const COLORS = ['#4F46E5','#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444'];

export default function Stats() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => setError('Failed to load stats'));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: COLORS[0] },
    { label: 'Verified Users', value: stats.verifiedUsers, color: COLORS[1] },
    { label: 'Active Users', value: stats.activeUsers, color: COLORS[2] },
    { label: 'Admins', value: stats.adminCount, color: COLORS[3] },
    { label: 'New (7 days)', value: stats.newUsersLast7Days, color: COLORS[4] },
    { label: 'New (30 days)', value: stats.newUsersLast30Days, color: COLORS[5] },
  ] : [];

  return (
    <div>
      <div className="page-header"><h2>Dashboard Overview</h2></div>
      {error && <div className="alert alert-error">{error}</div>}
      {!stats ? <Spinner /> : (
        <div className="stat-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="card" style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, color: '#64748B' }}>
            Active refresh tokens: <strong>{stats.totalActiveRefreshTokens}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
