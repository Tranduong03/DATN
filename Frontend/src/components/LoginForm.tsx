import { useState } from 'react';
import { X, EyeOff, Eye, ScanFace } from 'lucide-react';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
              <input 
                type="email" 
                placeholder="Nhập email của bạn (*)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email.length > 0 && (
                <button className="clear-btn" onClick={() => setEmail('')}>
                  <X size={16} />
                </button>
              )}
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
              <input 
                type="tel" 
                placeholder="Nhập số điện thoại" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phone.length > 0 && (
                <button className="clear-btn" onClick={() => setPhone('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Mật khẩu (*)</label>
          <div className="input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Nhập mật khẩu (*)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
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
