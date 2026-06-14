import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, EyeOff, Eye, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../common/LoadingOverlay';
import { useRegister } from '../../hooks/mutations/useAuthMutations';
import vnFlag from '../../assets/images/vn-flag.svg';
import { isValidEmail, isValidPhone, isValidPassword, isValidFullName } from '../../utils/validation';

export default function RegisterForm() {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() && !phone.trim()) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại');
      return;
    }

    if (email.trim() && !isValidEmail(email)) {
      setErrorMessage('Email không đúng định dạng');
      return;
    }

    if (phone.trim() && !isValidPhone(phone)) {
      setErrorMessage('Số điện thoại không đúng định dạng');
      return;
    }

    if (!isValidFullName(fullName)) {
      setErrorMessage('Họ và tên phải từ 2 ký tự trở lên');
      return;
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      const data: any = await registerMutation.mutateAsync({
        email: email || null,
        username: (email ? email.split('@')[0] : phone) + Math.floor(1000 + Math.random() * 9000), // Randomize username
        password,
        fullName,
        phone: phone || null
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/me');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!');
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
              <img src={vnFlag} alt="VN" />
              <span>+ 84</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              autoComplete="tel"
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
              autoComplete="email"
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
              autoComplete="name"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Nhập lại mật khẩu (*)</label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
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
