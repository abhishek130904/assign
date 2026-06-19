import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [dialog, setDialog] = useState<'active' | 'role' | null>(null);

  const load = () => adminApi.getUserById(id!).then(setUser).catch(() => {});

  useEffect(() => { load(); }, [id]);

  const confirmAction = async (value?: string) => {
    try {
      if (dialog === 'active') await adminApi.toggleActive(id!);
      else if (dialog === 'role' && value) await adminApi.changeRole(id!, value);
      setDialog(null);
      load();
    } catch { }
  };

  if (!user) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h2>User Detail</h2>
        <button className="btn btn-default" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        {[
          ['Name', user.name],
          ['Email', user.email],
          ['Role', <Badge type="role" value={user.role} />],
          ['Email Verified', <Badge type="verified" value={user.isEmailVerified} />],
          ['Status', <Badge type="active" value={user.isActive} />],
          ['Joined', new Date(user.createdAt).toLocaleString()],
          ['Active Sessions', user.activeRefreshTokens],
        ].map(([label, val]) => (
          <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#64748B', fontSize: 14 }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-default" onClick={() => setDialog('active')}>
            {user.isActive ? 'Deactivate' : 'Activate'} User
          </button>
          <button className="btn btn-primary" onClick={() => setDialog('role')}>Change Role</button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!dialog}
        title={dialog === 'active' ? 'Toggle Active' : 'Change Role'}
        message={dialog === 'active' ? 'Toggle this user\'s active status?' : 'Select the new role.'}
        showRoleSelect={dialog === 'role'}
        onConfirm={confirmAction}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
