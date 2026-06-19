import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
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
      <div className="input-wrapper">
        <input 
          type={showPassword ? "text" : "password"} 
          className={className}
          {...props} 
        />
        <button 
          type="button" 
          className="eye-btn" 
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>
    </div>
  );
}
export type { PasswordInputProps };
