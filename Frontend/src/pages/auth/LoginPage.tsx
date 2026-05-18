import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const data: any = await authService.googleLogin(tokenResponse.access_token);
        localStorage.setItem('token', data.token);
        navigate('/me'); // Navigate to account or home
      } catch (err: any) {
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google Login Failed');
    }
  });
  return (
    <div className="login-container">
      <LoadingOverlay isLoading={isGoogleLoading} text="Đang đăng nhập Google..." />
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
