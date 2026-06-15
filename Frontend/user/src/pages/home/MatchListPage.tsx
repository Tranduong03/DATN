import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllMatches } from '../../hooks/queries/useMatchQueries';
import { useSportCategories } from '../../hooks/queries/usePublicQueries';
import { useJoinMatch } from '../../hooks/mutations/useMatchMutations';
import { Users, MapPin, Calendar, CircleDollarSign, ShieldAlert, Award, Sparkles, Brain } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import axiosClient from '../../api/axiosClient';

export default function MatchListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // AI Recommendation states
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showQuickMatchModal, setShowQuickMatchModal] = useState(false);
  const [quickSport, setQuickSport] = useState('Cầu lông');
  const [quickLevel, setQuickLevel] = useState('Trung bình');
  const [quickLocation, setQuickLocation] = useState('Quận 7');
  const [quickMatching, setQuickMatching] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axiosClient.get('/users/recommendations/matches')
        .then((res: any) => {
          if (res.isSuccess) {
            setRecommendations(res.data);
          }
        })
        .catch(err => console.error("Error loading recommendations:", err));
    }
  }, [token]);

  const handleQuickMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng tính năng tìm nhanh kèo!');
      navigate('/login');
      return;
    }

    setQuickMatching(true);
    try {
      const res: any = await axiosClient.post('/users/quick-match', {
        sportType: quickSport,
        skillLevel: quickLevel,
        preferredLocation: quickLocation
      });

      if (res.isSuccess && res.data) {
        alert('Đã tìm thấy kèo đấu hoàn hảo! Đang chuyển hướng bạn...');
        setShowQuickMatchModal(false);
        navigate(`/matches/${res.data.id}`);
      } else {
        alert(res.message || 'Không tìm thấy kèo đấu nào phù hợp với yêu cầu hiện tại. Bạn có thể tự tạo kèo đấu mới hoặc xem các gợi ý khác!');
      }
    } catch (err: any) {
      alert('Lỗi ghép đối nhanh: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuickMatching(false);
    }
  };
  
  const { data: matchesData = [], isLoading } = useAllMatches(statusFilter);
  const { data: sportsData = [] } = useSportCategories();
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
            {/* Quick Match button */}
            {token && (
              <button
                onClick={() => setShowQuickMatchModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                <Brain size={16} />
                Ghép đối nhanh
              </button>
            )}

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
      </div>

      {/* AI Recommendations panel */}
      {token && recommendations.length > 0 && (
        <div 
          style={{
            marginBottom: '40px',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Brain size={22} color="#10b981" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Gợi ý kèo đấu phù hợp cho bạn <Sparkles size={16} color="#f59e0b" fill="#f59e0b" />
            </h2>
          </div>
          
          <div 
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '12px',
              scrollbarWidth: 'thin'
            }}
          >
            {recommendations.map((rec: any) => {
              const match = rec.match;
              const startVal = new Date(match.startTime);
              const dateStr = startVal.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
              const timeStr = `${startVal.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(match.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/matches/${match.id}`)}
                  style={{
                    flex: '0 0 320px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: rec.matchScore >= 80 ? '#d1fae5' : '#dbeafe', color: rec.matchScore >= 80 ? '#065f46' : '#1e40af' }}>
                        ĐỘ PHÙ HỢP: {rec.matchScore}%
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        {match.skillLevel}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {match.title}
                    </h4>

                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#94a3b8" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.venueName}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color="#94a3b8" />
                      <span>{dateStr} | {timeStr}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px' }}>
                    {rec.matchReasons.map((reason: string, i: number) => (
                      <span key={i} style={{ fontSize: '10px', color: '#047857', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                          backgroundColor: match.status === 'OPEN' ? '#e6f4ea' : match.status === 'CANCELLED' ? '#fee2e2' : '#f1f5f9',
                          color: match.status === 'OPEN' ? '#137333' : match.status === 'CANCELLED' ? '#ef4444' : '#475569'
                        }}
                      >
                        {match.status === 'OPEN' ? 'ĐANG TUYỂN' : match.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'ĐÃ ĐỦ'}
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
                        {match.status === 'CANCELLED' ? 'Đã hủy' : 'Đầy chỗ'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Modal: Quick Match */}
        {showQuickMatchModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Brain size={24} color="#10b981" />
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Ghép đối nhanh AI</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
                Hệ thống AI sẽ quét toàn bộ các kèo đấu đang hoạt động và ghép nối bạn vào trận đấu phù hợp nhất với trình độ và khu vực của bạn.
              </p>

              <form onSubmit={handleQuickMatchSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Môn thể thao</label>
                  <select
                    value={quickSport}
                    onChange={(e) => setQuickSport(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    {sportsData.map((cat: any) => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Trình độ mong muốn</label>
                  <select
                    value={quickLevel}
                    onChange={(e) => setQuickLevel(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="Mới chơi">Mới chơi</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Khu vực hoạt động</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quận 7"
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowQuickMatchModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={quickMatching}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: quickMatching ? 0.7 : 1
                    }}
                  >
                    {quickMatching ? 'Đang ghép...' : 'Bắt đầu ghép'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
