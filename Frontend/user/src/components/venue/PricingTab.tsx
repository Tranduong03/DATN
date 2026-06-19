import PricingTable from '../ui/PricingTable';
import './PricingTab.css';

interface PricingTabProps {
  venue: any;
  priceRules: any[];
  loadingPrices?: boolean;
  isOwner: boolean;
  onEditPricing?: () => void;
  onViewInventory?: () => void;
}

export default function PricingTab({
  venue,
  priceRules,
  loadingPrices = false,
  isOwner,
  onEditPricing,
  onViewInventory,
}: PricingTabProps) {
  if (isOwner) {
    return (
      <div className="owner-venue-pricing-tab">
        <div className="owner-venue-pricing-header">
          <button
            onClick={onEditPricing}
            className="owner-venue-pricing-btn-edit"
          >
            Chỉnh sửa bảng giá
          </button>
          <span className="owner-venue-pricing-title">
            BẢNG GIÁ SÂN
          </span>
        </div>

        {loadingPrices ? (
          <p className="owner-venue-pricing-loading">Đang tải bảng giá...</p>
        ) : (
          <PricingTable
            priceRules={priceRules || []}
            sportTypes={venue?.sportTypes || []}
          />
        )}

        <div className="owner-venue-services-section">
          <div className="owner-venue-services-header">
            <h3 className="owner-venue-services-title">
              DANH SÁCH DỊCH VỤ
            </h3>
            <button
              onClick={onViewInventory}
              className="owner-venue-services-more-btn"
            >
              Xem thêm &gt;&gt;
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
      <PricingTable 
        priceRules={priceRules || []} 
        sportTypes={venue?.sportTypes || []} 
      />
    </div>
  );
}
export type { PricingTabProps };
