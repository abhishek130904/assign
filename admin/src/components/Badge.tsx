import React from 'react';

interface BadgeProps { type: 'role' | 'active' | 'verified'; value: string | boolean; }

const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  let cls = '', label = '';
  if (type === 'role') { cls = value === 'admin' ? 'badge-admin' : 'badge-user'; label = String(value); }
  else if (type === 'active') { cls = value ? 'badge-active' : 'badge-inactive'; label = value ? 'Active' : 'Inactive'; }
  else { cls = value ? 'badge-verified' : 'badge-unverified'; label = value ? 'Verified' : 'Unverified'; }
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default Badge;
