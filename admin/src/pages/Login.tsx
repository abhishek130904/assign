import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/stats');
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>🔐 Admin Panel</h1>
        <p className="subtitle">Sign in to access the dashboard</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94A3B8' }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@example.com" style={{ width: '100%' }} required />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#94A3B8' }}>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={{ width: '100%' }} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', height: 44, fontSize: 15, justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}
