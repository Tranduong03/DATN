import { useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../../hooks/mutations/useAuthMutations';
import SubPageHeader from '../../components/common/SubPageHeader';
import PasswordInput from '../../components/ui/PasswordInput';
import FormError from '../../components/ui/FormError';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const changeMutation = useChangePassword();
  const isLoading = changeMutation.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu mới và xác nhận');
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

    try {
      const data: any = await changeMutation.mutateAsync({ oldPassword, newPassword });
      
      setSuccessMessage(data.message || 'Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Return to settings after 2 seconds
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="settings-page-wrapper">
      <SubPageHeader title="Đổi mật khẩu" />

      <div className="settings-content">
        <form className="form-container" onSubmit={handleSubmit} style={{ borderRadius: '12px', marginTop: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <PasswordInput
            label="Mật khẩu cũ (Bỏ qua nếu đăng nhập bằng Google)"
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <PasswordInput
            label="Mật khẩu mới (*)"
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới (*)"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <FormError message={errorMessage} />
          <FormError message={successMessage} type="success" />

          <button type="submit" className="primary-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, marginTop: '8px' }}>
            {isLoading ? <Loader2 className="animate-spin inline-block mr-2" size={20} /> : 'XÁC NHẬN ĐỔI'}
          </button>
        </form>
      </div>
    </div>
  );
}
