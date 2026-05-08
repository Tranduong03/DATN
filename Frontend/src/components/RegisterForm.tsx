import { useState } from 'react';
import { X, EyeOff, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterForm() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="login-card register-card">
      <div className="form-container">
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

        <div className="form-group">
          <label>Email của bạn?</label>
          <div className="input-wrapper">
            <input 
              type="email" 
              placeholder="Nhập email của bạn" 
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

        <div className="form-group">
          <label>Tên đầy đủ (*)</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Nhập họ và tên" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fullName.length > 0 && (
              <button className="clear-btn" onClick={() => setFullName('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

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

        <div className="form-group">
          <label>Nhập mật khẩu</label>
          <div className="input-wrapper">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Nhập lại mật khẩu" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <button className="primary-btn">ĐĂNG KÝ</button>

        <div className="login-link">
          <span>Bạn đã có tài khoản? </span>
          <Link to="/">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
