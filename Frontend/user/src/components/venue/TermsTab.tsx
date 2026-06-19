import { FileText } from 'lucide-react';
import './TermsTab.css';

interface TermsTabProps {
  isOwner: boolean;
}

export default function TermsTab({ isOwner }: TermsTabProps) {
  if (isOwner) {
    return (
      <div className="owner-venue-terms-tab">
        <h3 className="owner-venue-terms-title">
          <FileText size={18} /> Nội quy & Điều khoản đặt sân
        </h3>
        <div className="owner-venue-term-box">
          <strong className="owner-venue-term-box-title">1. Quy định thời gian</strong>
          Người chơi cần có mặt trước thời gian đặt lịch ít nhất 10 phút để nhận sân và chuẩn bị.
        </div>
        <div className="owner-venue-term-box">
          <strong className="owner-venue-term-box-title">2. Hủy hoặc đổi lịch</strong>
          Khách hàng được phép hủy sân hoặc bảo lưu giờ chơi trước giờ bắt đầu tối thiểu 24 tiếng. Hủy sau thời gian này sẽ không được hoàn tiền.
        </div>
        <div className="owner-venue-term-box">
          <strong className="owner-venue-term-box-title">3. Nội quy chung cơ sở</strong>
          Yêu cầu mang giày thể thao phù hợp (đế cao su không ra màu), giữ gìn vệ sinh chung, không mang chất cấm, vũ khí hoặc đồ uống có cồn vào khu vực thi đấu.
        </div>
      </div>
    );
  }

  // User view
  return (
    <div className="user-venue-rules-tab">
      <ul className="user-venue-rules-list">
        <li>Đến đúng giờ đã đặt lịch.</li>
        <li>Mang giày chuyên dụng cho các loại sân tương ứng để bảo vệ mặt thảm.</li>
        <li>Không mang theo thức ăn nhiều dầu mỡ hay đồ có gas lên mặt sân.</li>
        <li>Giữ gìn vệ sinh chung, vứt rác đúng nơi quy định.</li>
      </ul>
    </div>
  );
}
export type { TermsTabProps };
