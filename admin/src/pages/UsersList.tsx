import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';

export default function UsersList() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ users: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [dialog, setDialog] = useState<{ type: 'active' | 'role'; userId: string } | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, limit: 20, search, role, isActive });
      setData(res);
    } catch { } finally { setLoading(false); }
  }, [page, search, role, isActive]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => setPage(1), 400));
  };

  const confirmAction = async (value?: string) => {
    if (!dialog) return;
    try {
      if (dialog.type === 'active') await adminApi.toggleActive(dialog.userId);
      else if (value) await adminApi.changeRole(dialog.userId, value);
      setDialog(null);
      load();
    } catch { }
  };

  return (
    <div>
      <div className="page-header"><h2>Users</h2></div>
      <div className="filters">
        <input placeholder="Search name or email..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option>
        </select>
        <select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }}>
          <option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option>
        </select>
      </div>
      <div className="card">
        {loading ? <Spinner /> : (
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {data.users.map((u: any) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: '#64748B' }}>{u.email}</td>
                  <td><Badge type="role" value={u.role} /></td>
                  <td><Badge type="verified" value={u.isEmailVerified} /></td>
                  <td><Badge type="active" value={u.isActive} /></td>
                  <td style={{ color: '#94A3B8', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-default" onClick={() => navigate(`/users/${u._id}`)}>View</button>
                    <button className="btn btn-default" onClick={() => setDialog({ type: 'active', userId: u._id })}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-default" onClick={() => setDialog({ type: 'role', userId: u._id })}>Role</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
      </div>
      <ConfirmDialog
        isOpen={!!dialog}
        title={dialog?.type === 'active' ? 'Toggle Active Status' : 'Change Role'}
        message={dialog?.type === 'active' ? 'Are you sure you want to toggle this user\'s active status?' : 'Select the new role for this user.'}
        showRoleSelect={dialog?.type === 'role'}
        onConfirm={confirmAction}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
