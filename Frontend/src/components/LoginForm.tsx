import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, EyeOff, Eye, ScanFace, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const usernameOrEmail = activeTab === 'email' ? email : phone;
    if (!usernameOrEmail || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        // Có thể navigate sang trang chủ, tạm thời reload lại trang
        window.location.href = '/me'; 
      } else {
        setErrorMessage(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <form className="form-container" onSubmit={handleLogin}>
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
                <button type="button" className="clear-btn" onClick={() => setEmail('')}>
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
                <button type="button" className="clear-btn" onClick={() => setPhone('')}>
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
            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{ color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'ĐĂNG NHẬP'}
        </button>
        
        <button type="button" className="biometric-btn" disabled={isLoading}>
          <ScanFace className="scan-icon" size={24} />
          <span>Đăng nhập với sinh trắc học</span>
        </button>

        <div className="forgot-password">
          <span>Bạn quên mật khẩu? </span>
          <a href="#">Quên mật khẩu</a>
        </div>
      </form>
    </div>
  );
}
