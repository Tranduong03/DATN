import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, MapPin, Award, Check, Search } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import axiosClient from '../../api/axiosClient';

export default function TeamListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Create team modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamSport, setNewTeamSport] = useState('Cầu lông');
  const [newTeamLevel, setNewTeamLevel] = useState('Trung bình');
  const [newTeamLocation, setNewTeamLocation] = useState('Quận 7');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res: any = await axiosClient.get(`/teams?sportType=${sportFilter}&skillLevel=${levelFilter}`);
      if (res.isSuccess) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    if (!token) return;
    try {
      const res: any = await axiosClient.get('/teams/my-teams');
      if (res.isSuccess) {
        setMyTeams(res.data);
      }
    } catch (err) {
      console.error("Error loading my teams:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [sportFilter, levelFilter]);

  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyTeams();
    }
  }, [activeTab]);

  const handleJoinTeam = async (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    if (!token) {
      alert('Vui lòng đăng nhập để gia nhập đội nhóm!');
      navigate('/login');
      return;
    }

    try {
      const res: any = await axiosClient.post(`/teams/${teamId}/join`);
      if (res.isSuccess) {
        alert('Đã gửi yêu cầu tham gia đội nhóm thành công. Vui lòng chờ đội trưởng phê duyệt!');
        fetchTeams();
        fetchMyTeams();
      }
    } catch (error: any) {
      alert('Lỗi khi tham gia đội: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('Tên đội nhóm không được để trống!');
      return;
    }

    setSubmitting(true);
    try {
      const res: any = await axiosClient.post('/teams', {
        name: newTeamName,
        description: newTeamDesc,
        sportType: newTeamSport,
        skillLevel: newTeamLevel,
        location: newTeamLocation,
        avatarUrl: `https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=150&auto=format&fit=crop&q=60` // default team sport image
      });

      if (res.isSuccess) {
        alert('Tạo đội nhóm thành công!');
        setShowCreateModal(false);
        setNewTeamName('');
        setNewTeamDesc('');
        fetchTeams();
        setActiveTab('my');
      }
    } catch (err: any) {
      alert('Lỗi tạo đội nhóm: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const displayedTeams = (activeTab === 'all' ? teams : myTeams).filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '85vh' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
              Đội Nhóm & Câu Lạc Bộ
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
              Nơi kết nối các cộng đồng thể thao, cùng tập luyện và thi đấu giao lưu.
            </p>
          </div>
          
          {token && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <Plus size={18} />
              Tạo đội của bạn
            </button>
          )}
        </div>

        {/* Tab Toggle & Search Filters */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'all' ? '#f1f5f9' : 'transparent',
                  color: activeTab === 'all' ? '#0f172a' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                Khám phá đội nhóm
              </button>
              {token && (
                <button
                  onClick={() => setActiveTab('my')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'my' ? '#f1f5f9' : 'transparent',
                    color: activeTab === 'my' ? '#0f172a' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  Đội nhóm của tôi
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Tìm tên đội nhóm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Bộ môn:</span>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              >
                <option value="">Tất cả môn</option>
                <option value="Cầu lông">Cầu lông</option>
                <option value="Bóng đá">Bóng đá</option>
                <option value="Bóng rổ">Bóng rổ</option>
                <option value="Tennis">Tennis</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Trình độ:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              >
                <option value="">Tất cả trình độ</option>
                <option value="Mới chơi">Mới chơi</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Đang tải danh sách đội nhóm...</div>
        ) : displayedTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <Users size={48} style={{ margin: '0 auto 16px auto', color: '#cbd5e1' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#334155', margin: '0 0 8px 0' }}>Chưa có nhóm nào</h3>
            <p style={{ margin: 0 }}>Hãy thay đổi bộ lọc hoặc tự tạo đội nhóm thể thao của riêng mình nhé!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {displayedTeams.map((team) => {
              const userRole = token ? team.members?.find((m: any) => m.userId === JSON.parse(atob(token.split('.')[1])).sub) : null;
              
              return (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.03)';
                  }}
                >
                  <div>
                    {/* Header: Sport Type & Level */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                        {team.sportType?.toUpperCase() || 'CHƯA PHÂN LOẠI'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                        <Award size={14} />
                        {team.skillLevel || 'Mọi cấp độ'}
                      </span>
                    </div>

                    {/* Team Name & Desc */}
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{team.name}</h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px' }}>
                      {team.description || 'Chưa có mô tả chi tiết cho nhóm này.'}
                    </p>

                    {/* Location & Creator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                      <MapPin size={14} color="#94a3b8" />
                      <span>{team.location || 'Chưa cập nhật khu vực'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                      <Users size={14} color="#94a3b8" />
                      <span>Sáng lập: <strong>{team.creatorName}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Member count footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Thành viên</span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{team.memberCount} thành viên</strong>
                    </div>

                    {/* Join button states */}
                    {userRole ? (
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: userRole.status === 'APPROVED' ? '#e6f4ea' : '#fef3c7',
                        color: userRole.status === 'APPROVED' ? '#137333' : '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {userRole.status === 'APPROVED' ? (
                          <>
                            <Check size={14} />
                            Đã tham gia
                          </>
                        ) : (
                          'Đang chờ duyệt'
                        )}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoinTeam(e, team.id)}
                        style={{
                          padding: '8px 16px',
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
                        Gia nhập
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Team */}
        {showCreateModal && (
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
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Tạo đội nhóm thể thao mới</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>Bắt đầu xây dựng cộng đồng thể thao của riêng bạn ngay hôm nay.</p>

              <form onSubmit={handleCreateTeam}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Tên đội nhóm *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cầu Lông Sân Kỳ Hòa Q10"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Mô tả ngắn</label>
                  <textarea
                    placeholder="Giới thiệu mục tiêu nhóm, lịch sinh hoạt..."
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Bộ môn chính</label>
                    <select
                      value={newTeamSport}
                      onChange={(e) => setNewTeamSport(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="Cầu lông">Cầu lông</option>
                      <option value="Bóng đá">Bóng đá</option>
                      <option value="Bóng rổ">Bóng rổ</option>
                      <option value="Tennis">Tennis</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Trình độ đề xuất</label>
                    <select
                      value={newTeamLevel}
                      onChange={(e) => setNewTeamLevel(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="Mọi cấp độ">Mọi cấp độ</option>
                      <option value="Mới chơi">Mới chơi</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Nâng cao">Nâng cao</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Khu vực hoạt động</label>
                  <input
                    type="text"
                    placeholder="VD: Quận 7, TP.HCM"
                    value={newTeamLocation}
                    onChange={(e) => setNewTeamLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                    disabled={submitting}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Đang tạo...' : 'Xác nhận tạo'}
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
