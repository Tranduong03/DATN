import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import './ImagesTab.css';

interface ImagesTabProps {
  images?: any[]; // For owner view: Array of objects { id, imageUrl, imageType }
  galleryImages?: string[]; // For user view: Array of image URLs
  isOwner: boolean;
}

export default function ImagesTab({
  images = [],
  galleryImages = [],
  isOwner,
}: ImagesTabProps) {
  if (isOwner) {
    return (
      <div className="owner-venue-images-tab" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 className="owner-venue-images-title">
          <ImageIcon size={18} /> Hình ảnh cơ sở ({images.length})
        </h3>
        <div className="owner-venue-images-grid">
          {images.map((img: any) => (
            <div key={img.id} className="owner-venue-image-item">
              <img src={img.imageUrl} alt="Venue" className="owner-venue-image-img" />
              <span className="owner-venue-image-badge">
                {img.imageType === 'Avatar' ? 'Đại diện' : 'Thư viện'}
              </span>
            </div>
          ))}
          {images.length === 0 && (
            <p style={{ gridColumn: 'span 3', opacity: 0.7, fontSize: 14, textAlign: 'center', padding: '20px 0', color: '#ffffff' }}>
              Chưa có hình ảnh nào.
            </p>
          )}
        </div>
      </div>
    );
  }

  // User view
  return (
    <div className="sheet-gallery-grid">
      {galleryImages && galleryImages.length > 0 ? (
        galleryImages.map((img: string, idx: number) => (
          <img key={idx} src={img} alt={`Gallery ${idx}`} className="sheet-gallery-img" />
        ))
      ) : (
        <span className="sheet-tab-text" style={{ gridColumn: 'span 2' }}>Không có hình ảnh cơ sở.</span>
      )}
    </div>
  );
}
export type { ImagesTabProps };
