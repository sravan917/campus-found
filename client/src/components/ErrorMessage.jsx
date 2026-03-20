import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: '#FEF2F2',
      color: 'var(--danger)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid #FCA5A5',
      margin: '1rem 0'
    }}>
      <AlertCircle size={20} />
      <span style={{ fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export default ErrorMessage;
