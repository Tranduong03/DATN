import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAdminUsers } from '../../hooks/queries/useAdminQueries';

interface User {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: boolean;
  trustScore: number;
  createdAt: string;
  roles: string[];
}

const ROLE_BADGE: Record<string, string> = {
  Admin: 'badge-purple',
  Owner: 'badge-indigo',
  Staff: 'badge-blue',
  Default: 'badge-slate',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading: loading } = useAdminUsers(page, search);

  const users: any[] = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const getInitials = (user: User) => {
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    return user.username.charAt(0).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <AdminLayout
      title="Quản lý người dùng"
      subtitle={`Tổng cộng ${totalCount.toLocaleString()} tài khoản trong hệ thống`}
    >
      {/* Search & Filter Bar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-wrapper">
            <svg className="admin-search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="user-search-input"
              type="text"
              className="admin-search-input"
              placeholder="Tìm theo tên, email, username, SĐT..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="admin-search-clear" onClick={handleClearSearch}>×</button>
            )}
          </div>
          <button type="submit" className="admin-btn admin-btn--primary">Tìm kiếm</button>
        </form>
        <div className="admin-toolbar-info">
          {search && <span className="admin-filter-tag">Kết quả cho: "{search}" <button onClick={handleClearSearch}>×</button></span>}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" opacity="0.3">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trust Score</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="admin-table-row">
                  <td>
                    <div className="admin-user-cell">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="admin-user-avatar" />
                      ) : (
                        <div className="admin-user-avatar admin-user-avatar--initials">
                          {getInitials(user)}
                        </div>
                      )}
                      <div>
                        <div className="admin-user-name">{user.fullName || user.username}</div>
                        <div className="admin-user-username">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-cell-secondary">{user.email}</td>
                  <td className="admin-cell-secondary">{user.phone || '—'}</td>
                  <td>
                    <div className="admin-badges">
                      {user.roles.length > 0 ? user.roles.map((role: string) => (
                        <span key={role} className={`admin-badge ${ROLE_BADGE[role] || 'badge-slate'}`}>{role}</span>
                      )) : <span className="admin-badge badge-slate">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-trust-score">
                      <span className={`admin-trust-value ${user.trustScore >= 4 ? 'trust-good' : user.trustScore >= 2.5 ? 'trust-mid' : 'trust-bad'}`}>
                        ★ {user.trustScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.status ? 'badge-green' : 'badge-red'}`}>
                      {user.status ? 'Hoạt động' : 'Bị khoá'}
                    </span>
                  </td>
                  <td className="admin-cell-secondary">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-page-btn"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Trước
          </button>
          <div className="admin-page-numbers">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`admin-page-btn admin-page-number ${pageNum === page ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            className="admin-page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Sau →
          </button>
          <span className="admin-page-info">Trang {page}/{totalPages}</span>
        </div>
      )}
    </AdminLayout>
  );
}
