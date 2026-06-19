import React from 'react';

const Spinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
    <div style={{ width: 36, height: 36, border: '4px solid #E2E8F0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;
