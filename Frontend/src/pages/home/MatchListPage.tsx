import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllMatches } from '../../hooks/queries/useMatchQueries';
import { useJoinMatch } from '../../hooks/mutations/useMatchMutations';
import { Users, MapPin, Calendar, CircleDollarSign, ShieldAlert, Award } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function MatchListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { data: matchesData = [], isLoading } = useAllMatches(statusFilter);
  const joinMutation = useJoinMatch();

  const filteredMatches = matchesData.filter((match: any) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      match.title.toLowerCase().includes(lowerSearch) ||
      match.venueName.toLowerCase().includes(lowerSearch) ||
      match.courtName.toLowerCase().includes(lowerSearch)
    );
  });

  const handleJoin = async (matchId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để tham gia kèo!');
      navigate('/login');
      return;
    }

    try {
      await joinMutation.mutateAsync(matchId);
      alert('Đã gửi yêu cầu tham gia thành công. Vui lòng chờ host phê duyệt!');
    } catch (error: any) {
      alert('Lỗi khi tham gia kèo: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <MainLayout>
      <div 
        style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          minHeight: '80vh'
        }}
      >
        {/* Header Section */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Tìm Đối & Ghép Đội
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
              Gia nhập các trận đấu giao lưu, tìm bạn chơi cùng sở thích và nâng cao sức khỏe.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Tìm tên kèo, tên sân..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '10px 16px 10px 40px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '250px'
                }}
              />
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
            {['OPEN', 'FULL', ''].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                  color: statusFilter === status ? '#0f172a' : '#475569',
                  boxShadow: statusFilter === status ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {status === 'OPEN' ? 'Đang tuyển' : status === 'FULL' ? 'Đã đủ' : 'Tất cả'}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách kèo đấu...</div>
        ) : filteredMatches.length === 0 ? (
          <div 
            style={{
              padding: '80px 40px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              color: '#64748b'
            }}
          >
            <ShieldAlert size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 8px 0' }}>
              Không tìm thấy kèo đấu nào
            </h3>
            <p style={{ margin: 0 }}>Hãy thử thay đổi bộ lọc hoặc quay lại sau.</p>
          </div>
        ) : (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredMatches.map((match: any) => {
              const startVal = new Date(match.startTime);
              const dateStr = startVal.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
              const timeStr = `${startVal.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(match.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <div
                  key={match.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => navigate(`/matches/${match.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div>
                    {/* Badge and Level */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span 
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: match.status === 'OPEN' ? '#e6f4ea' : '#f1f5f9',
                          color: match.status === 'OPEN' ? '#137333' : '#475569'
                        }}
                      >
                        {match.status === 'OPEN' ? 'ĐANG TUYỂN' : 'ĐÃ ĐỦ'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                        <Award size={14} />
                        Trình độ: <strong>{match.skillLevel}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {match.title}
                    </h3>

                    {/* Venue & Court */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#475569', fontSize: '14px', marginBottom: '8px' }}>
                      <MapPin size={16} style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                      <span>{match.venueName} ({match.courtName})</span>
                    </div>

                    {/* Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px', marginBottom: '16px' }}>
                      <Calendar size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                      <span>{dateStr} | <strong>{timeStr}</strong></span>
                    </div>
                  </div>

                  {/* Footer Stats & Call to Action */}
                  <div 
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '16px',
                      marginTop: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        <Users size={14} />
                        Thành viên:
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                        {match.currentPlayers} / {match.maxPlayers}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                        <CircleDollarSign size={14} />
                        Phí/người:
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                        {match.feePerPlayer === 0 ? 'Miễn phí' : `${match.feePerPlayer.toLocaleString()}đ`}
                      </div>
                    </div>

                    {match.status === 'OPEN' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(match.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                      >
                        Tham gia
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f1f5f9',
                          color: '#94a3b8',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'not-allowed'
                        }}
                      >
                        Đầy chỗ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
