import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OwnerView() {
  const navigate = useNavigate();

  return (
    <div className="owner-view-wrapper" style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
      <button className="settings-back-btn" onClick={() => navigate('/me')} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', cursor: 'pointer' }}>
        <ChevronLeft color="#333" size={24} />
      </button>
      <h2>Chế độ Chủ sân</h2>
      <p style={{ marginTop: '20px', color: '#666' }}>Dashboard dành cho Chủ sân đang được phát triển (Coming Soon).</p>
    </div>
  );
}
