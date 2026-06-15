import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, ScanFace, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../common/LoadingOverlay';
import { useLogin } from '../../hooks/mutations/useAuthMutations';
import { isValidEmail, isValidPhone, isValidPassword } from '../../utils/validation';
import PhoneInput from '../ui/PhoneInput';
import PasswordInput from '../ui/PasswordInput';
import FormError from '../ui/FormError';

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (activeTab === 'email') {
      if (!email.trim()) {
        setErrorMessage('Vui lòng nhập email');
        return;
      }
      if (!isValidEmail(email)) {
        setErrorMessage('Email không đúng định dạng');
        return;
      }
    } else {
      if (!phone.trim()) {
        setErrorMessage('Vui lòng nhập số điện thoại');
        return;
      }
      if (!isValidPhone(phone)) {
        setErrorMessage('Số điện thoại không đúng định dạng');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const usernameOrEmail = activeTab === 'email' ? email : phone;

    try {
      const data: any = await loginMutation.mutateAsync({
        usernameOrEmail,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/me');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="login-card">
      <LoadingOverlay isLoading={isLoading} text="Đang đăng nhập..." />
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
        ) : (
          <PhoneInput
            label="Số điện thoại của bạn?"
            placeholder="Nhập số điện thoại"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onClear={() => setPhone('')}
          />
        )}

        <PasswordInput
          label="Mật khẩu (*)"
          placeholder="Nhập mật khẩu (*)"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormError message={errorMessage} />

        <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'ĐĂNG NHẬP'}
        </button>
        
        <button type="button" className="biometric-btn" disabled={isLoading}>
          <ScanFace className="scan-icon" size={24} />
          <span>Đăng nhập với sinh trắc học</span>
        </button>

        <div className="forgot-password">
          <span>Bạn quên mật khẩu? </span>
          <Link to="/forgot-password">Quên mật khẩu</Link>
        </div>
      </form>
    </div>
  );
}
