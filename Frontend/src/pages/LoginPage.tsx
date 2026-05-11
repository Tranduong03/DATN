import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('/api/Auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          navigate('/account'); // Navigate to account or home
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Google login failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });
  return (
    <div className="login-container">
      {/* Background layer */}
      <div className="bg-curves">
        <div className="bg-curve curve-1"></div>
        <div className="bg-curve curve-2"></div>
        <div className="bg-curve curve-3"></div>
      </div>

      <div className="login-content">
        <header className="login-header">
          <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft color="#fff" /></button>
          <h1>Đăng nhập</h1>
          <div className="header-placeholder"></div>
        </header>

        <main className="login-main">
          <LoginForm />
          
          <div className="signup-link">
            <span>Bạn chưa có tài khoản? </span>
            <Link to="/register">Đăng ký</Link>
          </div>

          {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

          <button className="google-btn" onClick={() => googleLogin()}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
            <span>Google</span>
          </button>
        </main>
      </div>

      <div className="login-banner">
        <p>Nếu bạn là CHỦ SÂN hoặc NHÂN VIÊN, Bấm vào đây để tải ứng dụng ALOBO - Quản lý sân thể thao!</p>
      </div>
    </div>
  );
}
