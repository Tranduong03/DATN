import PricingTable from '../ui/PricingTable';
import './PricingTab.css';

interface PricingTabProps {
  venue: any;
  priceRules: any[];
  loadingPrices?: boolean;
  courts?: any[];
  loadingCourts?: boolean;
  isOwner: boolean;
  onEditPricing?: () => void;
  onViewInventory?: () => void;
  onViewCourts?: () => void;
}

export default function PricingTab({
  venue,
  priceRules,
  loadingPrices = false,
  courts = [],
  loadingCourts = false,
  isOwner,
  onEditPricing,
  onViewInventory,
  onViewCourts,
}: PricingTabProps) {
  // Group courts by sport type for the owner view
  const groupedCourtsList = (() => {
    const groups: { [key: string]: { total: number; active: number } } = {};
    if (courts && courts.length > 0) {
      courts.forEach((c: any) => {
        const sport = c.sportType || 'Cầu lông';
        if (!groups[sport]) {
          groups[sport] = { total: 0, active: 0 };
        }
        groups[sport].total += 1;
        if (c.status === 'AVAILABLE') {
          groups[sport].active += 1;
        }
      });
    }
    return Object.entries(groups).map(([sportType, counts]) => ({
      sportType,
      total: counts.total,
      active: counts.active,
    }));
  })();

  if (isOwner) {
    return (
      <div className="owner-venue-pricing-tab">
        {/* Court list section */}
        <div className="owner-venue-courts-section">
          <div className="owner-venue-courts-header">
            <h3 className="owner-venue-pricing-edit-label">
              Chỉnh sửa sân
            </h3>
            <button
              onClick={onViewCourts}
              className="owner-venue-pricing-title-btn"
            >
              DANH SÁCH SÂN
            </button>
          </div>

          {loadingCourts ? (
            <p className="owner-venue-courts-loading">Đang tải danh sách sân...</p>
          ) : (
            <div className="owner-venue-courts-table-wrapper">
              <table className="owner-venue-courts-table">
                <thead>
                  <tr>
                    <th>Loại sân</th>
                    <th style={{ textAlign: 'center' }}>Số lượng sân</th>
                    <th>Đang hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedCourtsList.length > 0 ? (
                    groupedCourtsList.map((group, idx) => (
                      <tr key={idx} className="owner-venue-court-row">
                        <td className="owner-venue-court-name">Sân {group.sportType}</td>
                        <td className="owner-venue-court-count">{group.total}</td>
                        <td className="owner-venue-court-status">
                          <span className="owner-venue-court-badge owner-venue-court-badge--success">
                            Hoạt động ({group.active})
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="owner-venue-courts-empty">
                        Chưa có sân con nào. Vui lòng thêm sân mới.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="owner-venue-pricing-header">
          <span className="owner-venue-pricing-edit-label">
            Chỉnh sửa bảng giá
          </span>
          <button
            onClick={onEditPricing}
            className="owner-venue-pricing-title-btn"
          >
            BẢNG GIÁ SÂN
          </button>
        </div>

        {loadingPrices ? (
          <p className="owner-venue-pricing-loading">Đang tải bảng giá...</p>
        ) : (
          <PricingTable
            priceRules={priceRules || []}
            sportTypes={venue?.sportTypes || []}
            operatingStartHour={venue?.operatingStartHour}
            operatingEndHour={venue?.operatingEndHour}
          />
        )}

        <div className="owner-venue-services-section">
          <div className="owner-venue-services-header">
            <h3 className="owner-venue-pricing-edit-label">
              Chỉnh sửa dịch vụ
            </h3>
            <button
              onClick={onViewInventory}
              className="owner-venue-pricing-title-btn"
            >
              DANH SÁCH DỊCH VỤ
            </button>
          </div>

          <div className="owner-venue-services-table-wrapper">
            <table className="owner-venue-services-table">
              <tbody>
                {/* Group 1 */}
                <tr>
                  <td colSpan={2} className="owner-venue-services-group-row">
                    A cho thue
                  </td>
                </tr>
                <tr>
                  <td className="owner-venue-services-item-name">A 7UP</td>
                  <td className="owner-venue-services-item-price">20.000 đ / Chai</td>
                </tr>

                {/* Group 2 */}
                <tr>
                  <td colSpan={2} className="owner-venue-services-group-row">
                    A máy bắn bóng
                  </td>
                </tr>
                <tr>
                  <td className="owner-venue-services-item-name">Thuê máy bắn bóng Pickleball</td>
                  <td className="owner-venue-services-item-price">100.000 đ / Giờ</td>
                </tr>
                <tr>
                  <td className="owner-venue-services-item-name">...</td>
                  <td className="owner-venue-services-item-price">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // User view
  return (
    <div className="user-venue-pricing-tab">
      <h3 className="user-venue-pricing-title">BẢNG GIÁ SÂN</h3>
      <PricingTable 
        priceRules={priceRules || []} 
        sportTypes={venue?.sportTypes || []} 
        operatingStartHour={venue?.operatingStartHour}
        operatingEndHour={venue?.operatingEndHour}
      />
    </div>
  );
}
export type { PricingTabProps };
