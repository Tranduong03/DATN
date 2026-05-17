import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE = 'https://localhost:7034/api';

interface Stats {
  totalUsers: number;
  pendingRequests: number;
  verifiedOwners: number;
  rejectedRequests: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingRequests: 0, verifiedOwners: 0, rejectedRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`${API_BASE}/admin/users?page=1&pageSize=1`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()),
      fetch(`${API_BASE}/admin/owner-requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()),
    ]).then(([usersRes, requestsRes]) => {
      const totalUsers = usersRes?.data?.totalCount ?? 0;
      const allRequests: any[] = requestsRes?.data ?? [];
      setStats({
        totalUsers,
        pendingRequests: allRequests.filter((r: any) => r.verificationStatus === 'Pending').length,
        verifiedOwners: allRequests.filter((r: any) => r.verificationStatus === 'Verified').length,
        rejectedRequests: allRequests.filter((r: any) => r.verificationStatus === 'Rejected').length,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      id: 'total-users',
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'indigo',
      trend: '+12% tháng này',
    },
    {
      id: 'pending-requests',
      label: 'Đang chờ duyệt',
      value: stats.pendingRequests,
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'amber',
      trend: 'Cần xem xét',
    },
    {
      id: 'verified-owners',
      label: 'Owners đã duyệt',
      value: stats.verifiedOwners,
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      trend: 'Đang hoạt động',
    },
    {
      id: 'rejected-requests',
      label: 'Đã từ chối',
      value: stats.rejectedRequests,
      icon: (
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'rose',
      trend: 'Không đủ điều kiện',
    },
  ];

  return (
    <AdminLayout title="Tổng quan" subtitle="Chào mừng trở lại, Admin! Đây là tóm tắt hệ thống.">
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="admin-stats-grid">
            {statCards.map(card => (
              <div key={card.id} className={`admin-stat-card admin-stat-card--${card.color}`}>
                <div className="admin-stat-icon">{card.icon}</div>
                <div className="admin-stat-body">
                  <span className="admin-stat-value">{card.value.toLocaleString()}</span>
                  <span className="admin-stat-label">{card.label}</span>
                  <span className="admin-stat-trend">{card.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="admin-section">
            <h2 className="admin-section-title">Thao tác nhanh</h2>
            <div className="admin-quick-actions">
              <a href="/admin/owner-requests" className="admin-quick-action-card">
                <div className="admin-quick-action-icon admin-quick-action-icon--amber">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="admin-quick-action-title">Duyệt yêu cầu Owner</p>
                  <p className="admin-quick-action-desc">{stats.pendingRequests} đơn đang chờ</p>
                </div>
              </a>
              <a href="/admin/users" className="admin-quick-action-card">
                <div className="admin-quick-action-icon admin-quick-action-icon--indigo">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="admin-quick-action-title">Quản lý người dùng</p>
                  <p className="admin-quick-action-desc">{stats.totalUsers} tài khoản</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
