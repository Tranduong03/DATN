import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, EyeOff, Eye, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../common/LoadingOverlay';
import { authService } from '../../services/authService';

export default function RegisterForm() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password || !fullName || !phone) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await authService.register({
        email,
        username: email.split('@')[0] + Math.floor(1000 + Math.random() * 9000), // Randomize username
        password,
        fullName,
        phone
      });

      localStorage.setItem('token', data.token);
      navigate('/me');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-card register-card">
      <LoadingOverlay isLoading={isLoading} text="Đang đăng ký..." />
      <form className="form-container" onSubmit={handleRegister}>
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
              <button type="button" className="clear-btn" onClick={() => setEmail('')}>
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
              <button type="button" className="clear-btn" onClick={() => setFullName('')}>
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
            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
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
            <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{ color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'ĐĂNG KÝ'}
        </button>

        <div className="login-link">
          <span>Bạn đã có tài khoản? </span>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}
