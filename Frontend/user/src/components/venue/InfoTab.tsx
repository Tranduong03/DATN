import { MapPin, Clock, Phone, Copy, Check, Pencil } from 'lucide-react';
import { formatOperatingHour } from '../../utils/time';
import './InfoTab.css';

interface InfoTabProps {
  venue: any;
  isOwner: boolean;
  copied: boolean;
  onCopyLink: () => void;
  onlineLink: string;
  onEditInfo?: () => void;
}

export default function InfoTab({
  venue,
  isOwner,
  copied,
  onCopyLink,
  onlineLink,
  onEditInfo,
}: InfoTabProps) {
  if (isOwner) {
    return (
      <div className="owner-venue-info-tab">
        <div className="owner-venue-info-list">
          <div className="owner-venue-info-item">
            <MapPin size={20} className="owner-venue-info-icon" />
            <span>{venue.address}</span>
          </div>
          <div className="owner-venue-info-item">
            <Clock size={20} className="owner-venue-info-icon" />
            <span>Giờ hoạt động: {formatOperatingHour(venue.operatingStartHour) || '5:00'} - {formatOperatingHour(venue.operatingEndHour) || '24:00'}</span>
          </div>
          <div className="owner-venue-info-item">
            <Phone size={20} className="owner-venue-info-icon" />
            <span>{venue.contactPhone || 'Chưa cấu hình SĐT'}</span>
          </div>
        </div>

        <div className="owner-venue-link-section">
          <h3 className="owner-venue-link-title">Link đặt sân online</h3>
          <div className="owner-venue-link-box">
            <p className="owner-venue-link-text">{onlineLink}</p>
            <button className="owner-venue-copy-btn" onClick={onCopyLink} title="Sao chép link">
              {copied ? <Check size={25} color="#10b981" /> : <Copy size={25} color="#fff" />}
            </button>
          </div>
        </div>

        <button className="owner-venue-info-edit-btn" onClick={onEditInfo}>
          <Pencil size={18} />
          <span>Chỉnh sửa thông tin</span>
        </button>
      </div>
    );
  }

  // User view
  return (
    <div className="user-venue-info-tab">
      <h4 className="user-venue-link-title">Link đặt sân online</h4>
      <div className="user-venue-link-box">
        <a
          href={onlineLink}
          target="_blank"
          rel="noreferrer"
          className="user-venue-link-url"
        >
          {onlineLink}
        </a>
        <button
          onClick={onCopyLink}
          className={`user-venue-copy-btn ${copied ? 'copied' : ''}`}
        >
          {copied ? <span className="user-venue-copy-text">Đã chép</span> : <Copy size={24} />}
        </button>
      </div>
    </div>
  );
}
export type { InfoTabProps };
