import type { InputHTMLAttributes, CSSProperties } from 'react';
import { X } from 'lucide-react';
import vnFlag from '../../assets/images/vn-flag.svg';
import './PhoneInput.css';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  onClear?: () => void;
  wrapperClassName?: string;
  inputStyle?: CSSProperties;
}

export default function PhoneInput({
  label,
  value,
  onClear,
  wrapperClassName = '',
  style,
  inputStyle,
  ...props
}: PhoneInputProps) {
  const showClearButton = value && String(value).length > 0;

  return (
    <div className={`form-group ${wrapperClassName}`} style={style}>
      {label && <label>{label}</label>}
      <div className="phone-input-wrapper">
        <div className="country-code">
          <img src={vnFlag} alt="VN" />
          <span>+ 84</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        
        <div className="phone-divider" />

        <input
          type="tel"
          value={value}
          style={inputStyle}
          {...props}
        />
        
        {showClearButton && onClear && (
          <button 
            type="button" 
            className="clear-btn" 
            onClick={onClear}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
export type { PhoneInputProps };
