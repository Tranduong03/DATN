import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Calendar, ArrowRight, Home } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const bookingId = searchParams.get('bookingId');
  const isSuccess = status === 'success';

  return (
    <MainLayout>
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          padding: '24px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {isSuccess ? (
            <div style={{ marginBottom: '24px' }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#e6f4ea',
                  color: '#137333',
                  marginBottom: '16px',
                  animation: 'pulse 2s infinite'
                }}
              >
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                Thanh toán thành công!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Đơn đặt sân của bạn đã được xác nhận. Chúc bạn có những giây phút thể thao vui vẻ!
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#fce8e6',
                  color: '#c5221f',
                  marginBottom: '16px'
                }}
              >
                <XCircle size={48} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                Thanh toán thất bại
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Giao dịch của bạn đã bị hủy hoặc gặp lỗi trong quá trình xử lý thanh toán.
              </p>
            </div>
          )}

          {bookingId && (
            <div 
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '32px',
                textAlign: 'left',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Mã đơn đặt sân:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {bookingId}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => navigate('/me/bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
            >
              <Calendar size={18} />
              Xem lịch sử đặt sân
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Home size={18} />
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
