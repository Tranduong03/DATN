import MainLayout from '../../components/layout/MainLayout';
import { Newspaper } from 'lucide-react';

export default function ExplorePage() {
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
          <Newspaper size={48} color="var(--primary-color)" />
        </div>
        <h2 style={{ color: '#0f172a', marginBottom: '8px' }}>Bảng tin Khám phá</h2>
        <p style={{ maxWidth: '320px', margin: '0 auto', fontSize: '14px', lineHeight: '1.6' }}>
          Mạng xã hội thể thao cập nhật các tin tức, giải đấu, lớp training và khuyến mãi đang được xây dựng.
        </p>
      </div>
    </MainLayout>
  );
}
