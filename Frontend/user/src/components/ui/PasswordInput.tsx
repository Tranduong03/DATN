import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
}

export default function PasswordInput({ 
  label, 
  wrapperClassName = '', 
  className = '',
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`form-group ${wrapperClassName}`}>
      {label && <label>{label}</label>}
      <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input 
          type={showPassword ? "text" : "password"} 
          className={className}
          {...props} 
        />
        <button 
          type="button" 
          className="eye-btn" 
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
}
