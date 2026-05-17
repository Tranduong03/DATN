import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE = 'https://localhost:7034/api';

interface OwnerRequest {
  userId: string;
  fullName: string | null;
  username: string;
  email: string;
  avatarUrl: string | null;
  verificationStatus: string;
  submittedAt: string;
  venueName: string | null;
  venueAddress: string | null;
}

interface OwnerRequestDetail {
  userId: string;
  username: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  trustScore: number;
  userCreatedAt: string;
  verificationStatus: string;
  onboardingStatus: string;
  rejectReason: string | null;
  submittedAt: string;
  draftData: string | null;
  venueId: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venuePhone: string | null;
  description: string | null;
  operatingStartHour: string | null;
  operatingEndHour: string | null;
  sportTypes: string[];
  venueScale: number;
  venueStatus: string | null;
  venueImages: string[];
}

const STATUS_FILTERS = ['All', 'Pending', 'Verified', 'Rejected'];

const STATUS_BADGE: Record<string, string> = {
  Pending: 'badge-amber',
  Verified: 'badge-green',
  Rejected: 'badge-red',
};

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Đang chờ',
  Verified: 'Đã duyệt',
  Rejected: 'Đã từ chối',
  All: 'Tất cả',
};

export default function AdminOwnerRequestsPage() {
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<OwnerRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailTab, setDetailTab] = useState<'user' | 'venue'>('user');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE}/admin/owner-requests${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.isSuccess) setRequests(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openDetail = async (userId: string) => {
    setModalOpen(true);
    setDetailLoading(true);
    setDetailTab('user');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/owner-requests/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.isSuccess) setSelectedUser(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setRejectModalOpen(false);
    setRejectReason('');
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm('Bạn có chắc muốn phê duyệt yêu cầu này? Người dùng sẽ được cấp quyền Owner.')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/owner-requests/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.isSuccess) {
        showToast('success', '✅ Đã phê duyệt thành công!');
        closeModal();
        fetchRequests();
      } else {
        showToast('error', json.message || 'Có lỗi xảy ra.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối server.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedUser) return;
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/owner-requests/${selectedUser.userId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const json = await res.json();
      if (json.isSuccess) {
        showToast('success', '🚫 Đã từ chối yêu cầu.');
        closeModal();
        fetchRequests();
      } else {
        showToast('error', json.message || 'Có lỗi xảy ra.');
      }
    } catch {
      showToast('error', 'Lỗi kết nối server.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getInitials = (req: OwnerRequest | OwnerRequestDetail) => {
    if (req.fullName) return req.fullName.charAt(0).toUpperCase();
    return req.username.charAt(0).toUpperCase();
  };

  const SCALE_LABELS: Record<number, string> = { 1: 'Nhỏ (1-2 sân)', 2: 'Vừa (3-5 sân)', 3: 'Lớn (6-10 sân)', 4: 'Rất lớn (>10 sân)' };

  return (
    <AdminLayout
      title="Duyệt yêu cầu Owner"
      subtitle="Xem xét và phê duyệt các yêu cầu nâng cấp tài khoản Owner Mode"
    >
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-filter-tabs">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={`admin-filter-tab ${statusFilter === s ? 'active' : ''}`}
            onClick={() => { setStatusFilter(s); }}
          >
            {STATUS_LABEL[s]}
            {s === 'Pending' && requests.filter(r => r.verificationStatus === 'Pending').length > 0 && statusFilter !== 'Pending' && (
              <span className="admin-tab-badge">{requests.filter(r => r.verificationStatus === 'Pending').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="admin-empty">
            <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="currentColor" opacity="0.25">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Không có yêu cầu nào {statusFilter !== 'All' ? `ở trạng thái "${STATUS_LABEL[statusFilter]}"` : ''}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Tên sân</th>
                <th>Địa chỉ sân</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.userId} className="admin-table-row">
                  <td>
                    <div className="admin-user-cell">
                      {req.avatarUrl ? (
                        <img src={req.avatarUrl} alt={req.username} className="admin-user-avatar" />
                      ) : (
                        <div className="admin-user-avatar admin-user-avatar--initials">{getInitials(req)}</div>
                      )}
                      <div>
                        <div className="admin-user-name">{req.fullName || req.username}</div>
                        <div className="admin-user-username">@{req.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-cell-secondary">{req.email}</td>
                  <td className="admin-cell-primary">{req.venueName || '—'}</td>
                  <td className="admin-cell-secondary admin-cell-truncate" title={req.venueAddress || ''}>{req.venueAddress || '—'}</td>
                  <td className="admin-cell-secondary">{formatDate(req.submittedAt)}</td>
                  <td>
                    <span className={`admin-badge ${STATUS_BADGE[req.verificationStatus] || 'badge-slate'}`}>
                      {STATUS_LABEL[req.verificationStatus] || req.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <div className="admin-action-btns">
                      <button
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => openDetail(req.userId)}
                        id={`view-btn-${req.userId}`}
                      >
                        Xem chi tiết
                      </button>
                      {req.verificationStatus === 'Pending' && (
                        <>
                          <button
                            className="admin-btn admin-btn--success admin-btn--sm"
                            onClick={() => handleApprove(req.userId)}
                            id={`approve-btn-${req.userId}`}
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            onClick={() => { openDetail(req.userId); setRejectModalOpen(true); }}
                            id={`reject-btn-${req.userId}`}
                          >
                            ✗ Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Chi tiết yêu cầu Owner</h2>
              <button className="admin-modal-close" onClick={closeModal}>×</button>
            </div>

            {detailLoading ? (
              <div className="admin-loading admin-loading--modal">
                <div className="admin-spinner"></div>
                <p>Đang tải chi tiết...</p>
              </div>
            ) : selectedUser ? (
              <>
                {/* User header */}
                <div className="admin-modal-user-header">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} className="admin-modal-avatar" alt="" />
                  ) : (
                    <div className="admin-modal-avatar admin-user-avatar--initials">{getInitials(selectedUser)}</div>
                  )}
                  <div>
                    <div className="admin-modal-user-name">{selectedUser.fullName || selectedUser.username}</div>
                    <div className="admin-modal-user-email">{selectedUser.email}</div>
                    <span className={`admin-badge ${STATUS_BADGE[selectedUser.verificationStatus] || 'badge-slate'}`}>
                      {STATUS_LABEL[selectedUser.verificationStatus] || selectedUser.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="admin-modal-tabs">
                  <button className={`admin-modal-tab ${detailTab === 'user' ? 'active' : ''}`} onClick={() => setDetailTab('user')}>
                    👤 Thông tin cá nhân
                  </button>
                  <button className={`admin-modal-tab ${detailTab === 'venue' ? 'active' : ''}`} onClick={() => setDetailTab('venue')}>
                    🏟️ Thông tin sân
                  </button>
                </div>

                <div className="admin-modal-body">
                  {detailTab === 'user' && (
                    <div className="admin-detail-grid">
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Username</span>
                        <span className="admin-detail-value">@{selectedUser.username}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Họ và tên</span>
                        <span className="admin-detail-value">{selectedUser.fullName || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Email</span>
                        <span className="admin-detail-value">{selectedUser.email}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Số điện thoại</span>
                        <span className="admin-detail-value">{selectedUser.phone || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Trust Score</span>
                        <span className="admin-detail-value">★ {selectedUser.trustScore.toFixed(1)}/5.0</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Ngày tạo TK</span>
                        <span className="admin-detail-value">{formatDate(selectedUser.userCreatedAt)}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Ngày nộp đơn</span>
                        <span className="admin-detail-value">{formatDate(selectedUser.submittedAt)}</span>
                      </div>
                      {selectedUser.rejectReason && (
                        <div className="admin-detail-item admin-detail-item--full">
                          <span className="admin-detail-label">Lý do từ chối</span>
                          <span className="admin-detail-value admin-detail-reject">{selectedUser.rejectReason}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'venue' && (
                    <div className="admin-detail-grid">
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Tên sân</span>
                        <span className="admin-detail-value">{selectedUser.venueName || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Địa chỉ</span>
                        <span className="admin-detail-value">{selectedUser.venueAddress || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Điện thoại sân</span>
                        <span className="admin-detail-value">{selectedUser.venuePhone || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Giờ mở cửa</span>
                        <span className="admin-detail-value">{selectedUser.operatingStartHour || '—'} — {selectedUser.operatingEndHour || '—'}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Quy mô</span>
                        <span className="admin-detail-value">{SCALE_LABELS[selectedUser.venueScale] || `${selectedUser.venueScale} sân`}</span>
                      </div>
                      <div className="admin-detail-item">
                        <span className="admin-detail-label">Môn thể thao</span>
                        <span className="admin-detail-value">
                          {selectedUser.sportTypes.length > 0
                            ? selectedUser.sportTypes.join(', ')
                            : '—'}
                        </span>
                      </div>
                      {selectedUser.description && (
                        <div className="admin-detail-item admin-detail-item--full">
                          <span className="admin-detail-label">Mô tả</span>
                          <span className="admin-detail-value">{selectedUser.description}</span>
                        </div>
                      )}
                      {selectedUser.venueImages.length > 0 && (
                        <div className="admin-detail-item admin-detail-item--full">
                          <span className="admin-detail-label">Ảnh sân ({selectedUser.venueImages.length})</span>
                          <div className="admin-venue-images">
                            {selectedUser.venueImages.map((url, i) => (
                              <img key={i} src={url} alt={`Ảnh sân ${i + 1}`} className="admin-venue-img" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reject reason input */}
                {rejectModalOpen && selectedUser.verificationStatus === 'Pending' && (
                  <div className="admin-reject-form">
                    <label className="admin-reject-label">Lý do từ chối *</label>
                    <textarea
                      id="reject-reason-input"
                      className="admin-reject-textarea"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối rõ ràng để thông báo cho người dùng..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Modal footer */}
                {selectedUser.verificationStatus === 'Pending' && (
                  <div className="admin-modal-footer">
                    {!rejectModalOpen ? (
                      <>
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => setRejectModalOpen(true)}
                        >
                          ✗ Từ chối
                        </button>
                        <button
                          className="admin-btn admin-btn--success"
                          disabled={actionLoading}
                          onClick={() => handleApprove(selectedUser.userId)}
                          id="modal-approve-btn"
                        >
                          {actionLoading ? 'Đang xử lý...' : '✓ Phê duyệt Owner'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="admin-btn admin-btn--ghost" onClick={() => { setRejectModalOpen(false); setRejectReason(''); }}>
                          Huỷ
                        </button>
                        <button
                          className="admin-btn admin-btn--danger"
                          disabled={actionLoading || !rejectReason.trim()}
                          onClick={handleRejectSubmit}
                          id="modal-reject-submit-btn"
                        >
                          {actionLoading ? 'Đang xử lý...' : '✗ Xác nhận từ chối'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="admin-empty">Không tìm thấy thông tin.</div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
