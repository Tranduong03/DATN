import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    setIsLoading(true);
    try {
      const data: any = await authService.forgotPassword(email);
      setMessage(data.message || 'Mật khẩu mới đã được gửi vào email của bạn.');
      // Optionally navigate back to login after a few seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <LoadingOverlay isLoading={isLoading} text="Đang gửi email..." />
      {/* Background Curves - Using same classes for consistency, or custom ones if needed */}
      <div className="bg-curves">
        <div className="bg-curve curve-1"></div>
        <div className="bg-curve curve-2"></div>
        <div className="bg-curve curve-3"></div>
      </div>

      <div className="forgot-password-content">
        <header className="login-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft color="#fff" />
          </button>
          <h1>Quên mật khẩu</h1>
          <div className="header-placeholder"></div>
        </header>

        <div className="forgot-password-card">
          <p className="instruction-text">
            Chúng tôi sẽ gửi mật khẩu mới đến email của bạn. 
            Nếu bạn không nhận được email, hãy xóa bớt email nếu bộ nhớ đầy rồi thử lại.
            Nếu bạn chưa liên kết email, hãy liên hệ với chúng tôi để được hỗ trợ.
          </p>

          <form className="form-container" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Nhập email của bạn</label>
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

            {error && (
              <div style={{ color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            {message && (
              <div style={{ color: 'green', fontSize: '13px', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                {message}
              </div>
            )}

            <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'Tiếp tục'}
            </button>
          </form>
        </div>

        <div className="contact-banner">
          <p>
            Nếu bạn chưa liên kết email, vui lòng liên hệ và gửi SỐ ĐIỆN THOẠI kèm EMAIL cần liên kết qua Zalo hoặc Fanpage để được hỗ trợ
          </p>
          <div className="contact-buttons">
            <button className="facebook-btn">
              <span className="icon">f</span> Fanpage
            </button>
            <button className="zalo-btn">
              <span className="icon">Z</span> Zalo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
