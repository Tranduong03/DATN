import React from 'react';
import { X } from 'lucide-react';
import vnFlag from '../../assets/images/vn-flag.svg';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  onClear?: () => void;
  wrapperClassName?: string;
  inputStyle?: React.CSSProperties;
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
      <div className="phone-input-wrapper" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div className="country-code" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none' }}>
          <img src={vnFlag} alt="VN" style={{ width: '20px', height: '15px', objectFit: 'cover' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>+ 84</span>
          <span className="dropdown-arrow" style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '2px' }}>▼</span>
        </div>
        
        {/* Divider for cleaner presentation, especially for pages without full CSS styling */}
        <div className="phone-divider" style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />

        <input
          type="tel"
          value={value}
          style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', ...inputStyle }}
          {...props}
        />
        
        {showClearButton && onClear && (
          <button 
            type="button" 
            className="clear-btn" 
            onClick={onClear}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              zIndex: 2
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
