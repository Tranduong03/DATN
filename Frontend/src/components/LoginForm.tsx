import { useState } from 'react';
import { X, EyeOff, ScanFace } from 'lucide-react';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');

  return (
    <div className="login-card">
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'phone' ? 'active' : ''}`}
          onClick={() => setActiveTab('phone')}
        >
          Số điện thoại
        </button>
        <button 
          className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Email
        </button>
      </div>

      <div className="form-container">
        {activeTab === 'email' ? (
          <div className="form-group">
            <label>Email của bạn?</label>
            <div className="input-wrapper">
              <input type="email" placeholder="Nhập email của bạn (*)" />
              <button className="clear-btn"><X size={16} /></button>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Số điện thoại của bạn?</label>
            <div className="phone-input-wrapper">
              <div className="country-code">
                <img src="https://flagcdn.com/w20/vn.png" alt="VN" />
                <span>+ 84</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              <input type="tel" placeholder="Nhập số điện thoại" />
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Mật khẩu (*)</label>
          <div className="input-wrapper">
            <input type="password" placeholder="Nhập mật khẩu (*)" />
            <button className="eye-btn"><EyeOff size={20} /></button>
          </div>
        </div>

        <button className="primary-btn">ĐĂNG NHẬP</button>
        
        <button className="biometric-btn">
          <ScanFace className="scan-icon" size={24} />
          <span>Đăng nhập với sinh trắc học</span>
        </button>

        <div className="forgot-password">
          <span>Bạn quên mật khẩu? </span>
          <a href="#">Quên mật khẩu</a>
        </div>
      </div>
    </div>
  );
}
