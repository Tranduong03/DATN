import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Award, Check, X, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import axiosClient from '../../api/axiosClient';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.sub);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, [token]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const res: any = await axiosClient.get(`/teams/${id}`);
      if (res.isSuccess) {
        setTeam(res.data);
      }
    } catch (err) {
      console.error("Error loading team details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const handleApprove = async (memberId: string) => {
    try {
      const res: any = await axiosClient.put(`/teams/${id}/approve/${memberId}`);
      if (res.isSuccess) {
        alert('Đã duyệt thành viên thành công!');
        fetchTeamDetails();
      }
    } catch (err: any) {
      alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (memberId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu gia nhập này?')) return;
    try {
      const res: any = await axiosClient.put(`/teams/${id}/reject/${memberId}`);
      if (res.isSuccess) {
        alert('Đã từ chối yêu cầu gia nhập!');
        fetchTeamDetails();
      }
    } catch (err: any) {
      alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi đội nhóm này?')) return;
    setSubmitting(true);
    try {
      const res: any = await axiosClient.post(`/teams/${id}/leave`);
      if (res.isSuccess) {
        alert('Đã rời khỏi nhóm thành công!');
        fetchTeamDetails();
      }
    } catch (err: any) {
      alert('Lỗi khi rời nhóm: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để gia nhập!');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await axiosClient.post(`/teams/${id}/join`);
      if (res.isSuccess) {
        alert('Đã gửi yêu cầu gia nhập thành công!');
        fetchTeamDetails();
      }
    } catch (err: any) {
      alert('Lỗi khi gia nhập: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Đang tải thông tin đội nhóm...</div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>Không tìm thấy đội nhóm</h2>
          <button onClick={() => navigate('/teams')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Quay lại</button>
        </div>
      </MainLayout>
    );
  }

  const isCaptain = currentUserId === team.creatorId;
  const userMembership = team.members?.find((m: any) => m.userId === currentUserId);
  
  const pendingRequests = team.members?.filter((m: any) => m.status === 'PENDING') || [];
  const approvedMembers = team.members?.filter((m: any) => m.status === 'APPROVED') || [];

  return (
    <MainLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/teams')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          Quay lại danh sách nhóm
        </button>

        {/* Team Cover Banner Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          {/* Cover gradient banner */}
          <div style={{ height: '140px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'flex-end', padding: '24px' }}>
          </div>

          <div style={{ padding: '32px', position: 'relative', marginTop: '-40px' }}>
            {/* Avatar overlay */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              border: '4px solid #ffffff',
              backgroundColor: '#e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: '#059669',
              marginBottom: '16px'
            }}>
              {team.name[0]}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>{team.name}</h1>
                
                {/* Meta details */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                    {team.sportType}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                    <Award size={14} />
                    Trình độ: <strong>{team.skillLevel || 'Mọi cấp độ'}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                    <MapPin size={14} />
                    {team.location || 'Chưa rõ khu vực'}
                  </span>
                </div>
              </div>

              {/* Join / Leave / Pending Status Action */}
              <div>
                {isCaptain ? (
                  <span style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} />
                    Đội trưởng
                  </span>
                ) : userMembership ? (
                  userMembership.status === 'APPROVED' ? (
                    <button
                      onClick={handleLeaveTeam}
                      disabled={submitting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 20px',
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={16} />
                      Rời đội nhóm
                    </button>
                  ) : (
                    <span style={{ padding: '10px 20px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
                      Đang chờ duyệt...
                    </span>
                  )
                ) : (
                  <button
                    onClick={handleJoinTeam}
                    disabled={submitting}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Yêu cầu gia nhập
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: '0 0 8px 0' }}>Mô tả câu lạc bộ</h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {team.description || 'Đội nhóm chưa cập nhật mô tả chi tiết.'}
              </p>
            </div>
          </div>
        </div>

        {/* Members and Requests Section */}
        <div style={{ display: 'grid', gridTemplateColumns: isCaptain && pendingRequests.length > 0 ? '1.2fr 0.8fr' : '1fr', gap: '32px' }}>
          
          {/* List of Members */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#10b981" />
              Thành viên ({approvedMembers.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {approvedMembers.map((member: any) => (
                <div key={member.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: member.role === 'CAPTAIN' ? '#10b981' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700'
                    }}>
                      {member.userName[0]}
                    </div>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#334155' }}>{member.userName}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Đã tham gia {new Date(member.joinedAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>

                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: member.role === 'CAPTAIN' ? '#d1fae5' : '#f1f5f9',
                    color: member.role === 'CAPTAIN' ? '#065f46' : '#475569'
                  }}>
                    {member.role === 'CAPTAIN' ? 'ĐỘI TRƯỞNG' : 'THÀNH VIÊN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Captain-only: Join Requests */}
          {isCaptain && pendingRequests.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Yêu cầu gia nhập ({pendingRequests.length})</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingRequests.map((req: any) => (
                  <div key={req.userId} style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyItems: 'center', fontWeight: '700', justifyContent: 'center' }}>
                        {req.userName[0]}
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#451a03' }}>{req.userName}</strong>
                        <div style={{ fontSize: '11px', color: '#b45309' }}>Gửi lúc {new Date(req.joinedAt).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(req.userId)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={14} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(req.userId)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '8px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
}
