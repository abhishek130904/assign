import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Stats from './pages/Stats';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';

export default function App() {
  const { user } = useAdminAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/stats" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? '/stats' : '/login'} replace />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="layout">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/stats" element={<Stats />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="*" element={<Navigate to="/stats" replace />} />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
