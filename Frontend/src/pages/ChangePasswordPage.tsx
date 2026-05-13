import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/Auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Return to settings after 2 seconds
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setErrorMessage(data.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!');
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-page-wrapper">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft color="#fff" size={24} />
        </button>
        <h1 className="settings-title">Đổi mật khẩu</h1>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="settings-content">
        <form className="form-container" onSubmit={handleSubmit} style={{ borderRadius: '12px', marginTop: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div className="form-group">
            <label>Mật khẩu cũ (*)</label>
            <div className="input-wrapper">
              <input 
                type={showOldPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu hiện tại" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowOldPassword(!showOldPassword)}>
                {showOldPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu mới (*)</label>
            <div className="input-wrapper">
              <input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu mới" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu mới (*)</label>
            <div className="input-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{ color: '#e53935', fontSize: '14px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ color: '#00A859', fontSize: '14px', marginBottom: '16px', textAlign: 'center', fontWeight: '500' }}>
              {successMessage}
            </div>
          )}

          <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, marginTop: '8px' }}>
            {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'XÁC NHẬN ĐỔI'}
          </button>
        </form>
      </div>
    </div>
  );
}
