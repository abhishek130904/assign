import React, { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  showRoleSelect?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel, showRoleSelect }) => {
  const [role, setRole] = useState('user');
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        {showRoleSelect && (
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <div className="modal-actions">
          <button className="btn btn-default" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm(showRoleSelect ? role : undefined)}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
