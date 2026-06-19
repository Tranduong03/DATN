import React from 'react';
import { MapPin, Clock, Phone, Copy, Check } from 'lucide-react';
import './InfoTab.css';

interface InfoTabProps {
  venue: any;
  isOwner: boolean;
  copied: boolean;
  onCopyLink: () => void;
  onlineLink: string;
}

export default function InfoTab({
  venue,
  isOwner,
  copied,
  onCopyLink,
  onlineLink,
}: InfoTabProps) {
  if (isOwner) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="owner-venue-info-list">
          <div className="owner-venue-info-item">
            <MapPin size={20} className="owner-venue-info-icon" />
            <span>{venue.address}</span>
          </div>
          <div className="owner-venue-info-item">
            <Clock size={20} className="owner-venue-info-icon" />
            <span>Giờ hoạt động: {venue.operatingStartHour || '05:00'} - {venue.operatingEndHour || '24:00'}</span>
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
      </div>
    );
  }

  // User view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <h4 style={{ fontSize: 15, fontWeight: 550, color: '#e06e1b', margin: '8px 0 8px 0' }}>Link đặt sân online</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
        <a
          href={onlineLink}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: '#02471fff', wordBreak: 'break-all', textDecoration: 'none', fontWeight: 300 }}
        >
          {onlineLink}
        </a>
        <button
          onClick={onCopyLink}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          {copied ? <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>Đã chép</span> : <Copy size={24} />}
        </button>
      </div>
    </div>
  );
}
export type { InfoTabProps };
