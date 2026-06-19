import type { CSSProperties } from 'react';
import './FormError.css';

interface FormErrorProps {
  message?: string | null;
  type?: 'error' | 'success';
  className?: string;
  style?: CSSProperties;
}

export default function FormError({ message, type = 'error', className = '', style }: FormErrorProps) {
  if (!message) return null;

  return (
    <div 
      className={`form-message-alert ${type} ${className}`}
      style={style}
    >
      {message}
    </div>
  );
}
export type { FormErrorProps };
