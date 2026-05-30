import { useParams, useNavigate } from 'react-router-dom';
import { useMatchDetail } from '../../hooks/queries/useMatchQueries';
import { useJoinMatch, useApproveJoinRequest } from '../../hooks/mutations/useMatchMutations';
import { ChevronLeft, User, Users, MapPin, Calendar, CircleDollarSign, Check, Info } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';

export default function MatchDetailPage() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading } = useMatchDetail(matchId!);
  const joinMutation = useJoinMatch();
  const approveMutation = useApproveJoinRequest();

  // Get current logged-in user id (decode JWT from localStorage if needed)
  const token = localStorage.getItem('token');
  let currentUserId: string | null = null;
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      currentUserId = JSON.parse(atob(base64)).nameid || null;
    } catch (e) {
      console.error(e);
    }
  }

  const handleJoin = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để tham gia kèo!');
      navigate('/login');
      return;
    }

    try {
      await joinMutation.mutateAsync(matchId!);
      alert('Gửi yêu cầu tham gia thành công!');
    } catch (error: any) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveMutation.mutateAsync({ matchId: matchId!, userId });
      alert('Đã duyệt người chơi tham gia trận đấu!');
    } catch (error: any) {
      alert('Lỗi khi duyệt: ' + (error.response?.data?.message || error.message));
    }
  };

  if (isLoading) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Đang tải thông tin kèo đấu...</div></MainLayout>;
  if (!match) return <MainLayout><div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy thông tin kèo đấu.</div></MainLayout>;

  const isHost = currentUserId === match.hostId;
  const isPlayer = match.players.some(p => p.userId === currentUserId && p.status === 'APPROVED');
  const hasRequested = match.players.some(p => p.userId === currentUserId && p.status === 'PENDING');

  const approvedPlayers = match.players.filter(p => p.status === 'APPROVED');
  const pendingRequests = match.players.filter(p => p.status === 'PENDING');

  const startVal = new Date(match.startTime);
  const dateStr = startVal.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = `${startVal.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(match.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <MainLayout>
      <div style={{ padding: '24px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
        <button 
          className="icon-btn" 
          onClick={() => navigate('/matches')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 24, 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontSize: '15px',
            color: '#64748b',
            fontWeight: '600'
          }}
        >
          <ChevronLeft size={20} /> Danh sách kèo
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          {/* Match Specs Column */}
          <div>
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span 
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: match.status === 'OPEN' ? '#e6f4ea' : '#f1f5f9',
                    color: match.status === 'OPEN' ? '#137333' : '#475569'
                  }}
                >
                  {match.status === 'OPEN' ? 'ĐANG TUYỂN' : 'ĐÃ ĐỦ'}
                </span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Trình độ: <strong>{match.skillLevel}</strong>
                </span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px 0', lineHeight: 1.3 }}>
                {match.title}
              </h1>

              {/* Specs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <MapPin size={20} style={{ color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Địa điểm sân</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {match.venueName} - {match.courtName}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Calendar size={20} style={{ color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Thời gian</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {dateStr} <span style={{ color: '#64748b', fontWeight: '400' }}>({timeStr})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CircleDollarSign size={20} style={{ color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Phí tham gia dự kiến</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {match.feePerPlayer === 0 ? 'Miễn phí' : `${match.feePerPlayer.toLocaleString()}đ / người`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <User size={20} style={{ color: '#64748b', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Chủ kèo (Host)</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>
                      {match.hostName} {isHost && <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'normal' }}>(Bạn)</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isHost && (
                <div>
                  {isPlayer ? (
                    <div style={{ padding: '12px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Check size={18} /> Bạn đã tham gia kèo đấu này
                    </div>
                  ) : hasRequested ? (
                    <div style={{ padding: '12px', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Info size={18} /> Đã gửi yêu cầu (Chờ host duyệt)
                    </div>
                  ) : match.status === 'OPEN' ? (
                    <button
                      onClick={handleJoin}
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      Gửi yêu cầu tham gia kèo
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'not-allowed'
                      }}
                    >
                      Kèo đấu đã đầy
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Members & Requests Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Approved Members Card */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} />
                Thành viên đã tham gia ({approvedPlayers.length + 1}/{match.maxPlayers})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Host Item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#ffffff', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', justifyContent: 'center' }}>
                      H
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{match.hostName}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>
                    HOST
                  </span>
                </div>

                {/* Other Approved Players */}
                {approvedPlayers.map((player) => (
                  <div key={player.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', justifyContent: 'center' }}>
                        {player.userName[0]?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{player.userName}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#137333', fontWeight: '600', backgroundColor: '#e6f4ea', padding: '4px 8px', borderRadius: '6px' }}>
                      Đã duyệt
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Requests Card (Host view only) */}
            {isHost && (
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
                }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Yêu cầu đang chờ duyệt ({pendingRequests.length})
                </h2>

                {pendingRequests.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0, textAlign: 'center', padding: '20px 0' }}>
                    Không có yêu cầu nào đang chờ.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingRequests.map((request) => (
                      <div 
                        key={request.userId} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px 16px', 
                          backgroundColor: '#fff7ed', 
                          border: '1px solid #ffedd5',
                          borderRadius: '12px' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{request.userName}</span>
                        </div>
                        <button
                          onClick={() => handleApprove(request.userId)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                          Duyệt
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </MainLayout>
  );
}
