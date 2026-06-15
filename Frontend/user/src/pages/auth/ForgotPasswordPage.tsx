import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronLeft, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useForgotPassword } from '../../hooks/mutations/useAuthMutations';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import PhoneInput from '../../components/ui/PhoneInput';
import FormError from '../../components/ui/FormError';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const forgotMutation = useForgotPassword();
  const isLoading = forgotMutation.isPending;

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (method === 'email') {
      if (!email.trim()) {
        setError('Vui lòng nhập email của bạn');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Email không đúng định dạng');
        return;
      }
    }
    if (method === 'phone') {
      if (!phone.trim()) {
        setError('Vui lòng nhập số điện thoại của bạn');
        return;
      }
      if (!isValidPhone(phone)) {
        setError('Số điện thoại không đúng định dạng');
        return;
      }
    }

    try {
      const payload = method === 'email' ? { email } : { phone: phone.startsWith('0') ? phone : '0' + phone };
      const data: any = await forgotMutation.mutateAsync(payload);
      if (method === 'email') {
        setMessage(data.message || 'Mật khẩu mới đã được gửi vào email của bạn.');
      } else {
        setMessage(data.message || 'Mật khẩu mới đã được in ra backend console (SMS Mock).');
      }
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  return (
    <div className="forgot-password-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoadingOverlay isLoading={isLoading} text="Đang xử lý yêu cầu..." />

      <div className="forgot-password-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <header style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0 24px 0'
        }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft color="#fff" size={24} />
          </button>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>Quên mật khẩu</h1>
          <div style={{ width: '24px' }}></div>
        </header>

        <div className="forgot-password-card" style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            Nhập email hoặc số điện thoại đã đăng ký để tìm kiếm và lấy lại mật khẩu.
          </p>

          <form onSubmit={handleForgotPassword}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0' }}>
              Tìm kiếm tài khoản theo
            </h3>

            {/* Selection Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {/* Email selector */}
              <div 
                onClick={() => setMethod('email')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: method === 'email' ? '2px solid #059669' : '1px solid #d1d5db',
                  backgroundColor: method === 'email' ? '#ecfdf5' : '#ffffff',
                  color: method === 'email' ? '#059669' : '#4b5563',
                  fontWeight: '600', transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: method === 'email' ? '5px solid #059669' : '2px solid #d1d5db',
                  boxSizing: 'border-box'
                }} />
                <span style={{ fontSize: '14px' }}>Email</span>
              </div>

              {/* Phone selector */}
              <div 
                onClick={() => setMethod('phone')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: method === 'phone' ? '2px solid #059669' : '1px solid #d1d5db',
                  backgroundColor: method === 'phone' ? '#ecfdf5' : '#ffffff',
                  color: method === 'phone' ? '#059669' : '#4b5563',
                  fontWeight: '600', transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: method === 'phone' ? '5px solid #059669' : '2px solid #d1d5db',
                  boxSizing: 'border-box'
                }} />
                <span style={{ fontSize: '14px' }}>Số điện thoại</span>
              </div>
            </div>

            {/* Input Label & Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#064e3b', marginBottom: '8px' }}>
                {method === 'email' ? 'Email' : 'Số điện thoại'}
              </label>

              {method === 'email' ? (
                <div style={{ 
                  position: 'relative', display: 'flex', alignItems: 'center',
                  border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 12px',
                  backgroundColor: '#ffffff'
                }}>
                  <input 
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1, border: 'none', outline: 'none', padding: '12px 0',
                      fontSize: '15px', color: '#1f2937'
                    }}
                  />
                  {email && (
                    <button type="button" onClick={() => setEmail('')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <X size={16} color="#9ca3af" />
                    </button>
                  )}
                </div>
              ) : (
                <PhoneInput
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onClear={() => setPhone('')}
                  inputStyle={{ padding: '12px 0', fontSize: '15px', color: '#1f2937' }}
                  style={{ margin: 0 }}
                />
              )}
            </div>

            <FormError message={error} />
            <FormError message={message} type="success" />

            <button 
              type="submit" 
              className="primary-btn" 
              disabled={isLoading} 
              style={{ 
                width: '100%', padding: '14px', borderRadius: '8px', 
                backgroundColor: '#064e3b', color: '#ffffff', border: 'none',
                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Tiếp tục'}
            </button>
          </form>
        </div>

        {/* Support Section */}
        <div style={{ marginTop: 'auto', paddingBottom: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#ffffff', opacity: 0.9, lineHeight: '1.6', marginBottom: '16px' }}>
            Bạn gặp vấn đề hoặc cần hỗ trợ? Vui lòng liên hệ với chúng tôi qua Zalo hoặc Fanpage để được hỗ trợ
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="https://facebook.com" target="_blank" rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '8px', backgroundColor: '#1877f2', color: '#ffffff',
                textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>f</span> Fanpage
            </a>
            <a 
              href="https://zalo.me" target="_blank" rel="noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '8px', backgroundColor: '#00b863', color: '#ffffff',
                textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>💬</span> Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
