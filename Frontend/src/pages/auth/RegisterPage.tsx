import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();

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
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft color="#fff" />
          </button>
          <h1>Đăng ký</h1>
          <div className="header-placeholder"></div>
        </header>

        <main className="login-main">
          <RegisterForm />
        </main>
      </div>
    </div>
  );
}
