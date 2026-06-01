import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { usePublicVenues } from '../../hooks/queries/usePublicQueries';

export default function AdminVenuesPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: venuesData, isLoading: loading } = usePublicVenues(search);
  const venues = venuesData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <AdminLayout
      title="Quản lý Sân (Venues)"
      subtitle={`Tổng cộng ${venues.length} sân trong hệ thống`}
    >
      {/* Search Bar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-search-form">
          <div className="admin-search-wrapper">
            <svg className="admin-search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Tìm theo tên sân, địa chỉ..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="admin-search-clear" onClick={handleClearSearch}>×</button>
            )}
          </div>
          <button type="submit" className="admin-btn admin-btn--primary">Tìm kiếm</button>
        </form>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="admin-empty">
            <p>Không tìm thấy sân nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Sân</th>
                <th>Địa chỉ</th>
                <th>Giờ hoạt động</th>
                <th>Chủ sân</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue: any) => (
                <tr key={venue.id} className="admin-table-row">
                  <td>
                    <div className="admin-user-cell">
                      {venue.avatarUrl ? (
                        <img src={venue.avatarUrl} alt={venue.name} className="admin-user-avatar" style={{ borderRadius: 8 }} />
                      ) : (
                        <div className="admin-user-avatar admin-user-avatar--initials" style={{ borderRadius: 8 }}>
                          {venue.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="admin-user-name">{venue.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#F5A623' }}>★</span> {venue.rating}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-cell-secondary" style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {venue.address}
                  </td>
                  <td className="admin-cell-secondary">
                    {venue.operatingStartHour} - {venue.operatingEndHour}
                  </td>
                  <td className="admin-cell-secondary">
                    {venue.ownerId}
                  </td>
                  <td>
                    <span className="admin-badge badge-green">Hoạt động</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
