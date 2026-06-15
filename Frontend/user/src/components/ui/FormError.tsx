import React from 'react';

interface FormErrorProps {
  message?: string | null;
  type?: 'error' | 'success';
  className?: string;
  style?: React.CSSProperties;
}

export default function FormError({ message, type = 'error', className = '', style }: FormErrorProps) {
  if (!message) return null;

  const color = type === 'error' ? '#ef4444' : '#10b981';

  return (
    <div 
      className={`form-message-alert ${className}`}
      style={{ 
        color, 
        fontSize: '13px', 
        marginBottom: '12px', 
        textAlign: 'center', 
        fontWeight: '500',
        ...style 
      }}
    >
      {message}
    </div>
  );
}
