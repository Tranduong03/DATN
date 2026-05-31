import MainLayout from '../../components/layout/MainLayout';
import { MapPin } from 'lucide-react';

export default function MapPage() {
  return (
    <MainLayout>
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b'
      }}>
        <div style={{
          backgroundColor: '#e2f0e6',
          padding: '20px',
          borderRadius: '50%',
          marginBottom: '16px'
        }}>
          <MapPin size={48} color="var(--primary-color)" />
        </div>
        <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>Bản đồ sân đấu</h2>
        <p style={{ maxWidth: '320px', margin: '0 auto', fontSize: '14px', lineHeight: '1.6' }}>
          Tính năng định vị GPS tìm kiếm các sân thể thao trong bán kính 5km đang được xây dựng.
        </p>
      </div>
    </MainLayout>
  );
}
