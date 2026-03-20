import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'var(--text-muted)'
    }}>
      <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
      <p>{message}</p>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Loader;
