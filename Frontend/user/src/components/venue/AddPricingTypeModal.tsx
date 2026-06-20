import { useState } from 'react';
import { X } from 'lucide-react';
import './AddPricingTypeModal.css';

interface AddPricingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, englishName?: string) => void;
}

export default function AddPricingTypeModal({ isOpen, onClose, onAdd }: AddPricingTypeModalProps) {
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên kiểu bảng giá.');
      return;
    }
    onAdd(name.trim(), englishName.trim() || undefined);
    setName('');
    setEnglishName('');
    onClose();
  };

  return (
    <div className="add-pricing-modal-overlay">
      <div className="add-pricing-modal-container">
        {/* Header */}
        <div className="add-pricing-modal-header">
          <div className="add-pricing-modal-title">Thêm Kiểu Bảng Giá Mới</div>
          <button onClick={onClose} className="add-pricing-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-pricing-modal-form">
          <div className="add-pricing-modal-field">
            <label className="add-pricing-modal-label">Tên kiểu bảng giá</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="add-pricing-modal-input"
              required
            />
          </div>

          <div className="add-pricing-modal-field">
            <label className="add-pricing-modal-label">Tên kiểu bảng giá (tiếng Anh)</label>
            <input
              type="text"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder="Bỏ trống nếu muốn lấy tên tiếng Việt"
              className="add-pricing-modal-input"
            />
          </div>

          <button type="submit" className="add-pricing-modal-submit-btn">
            THÊM
          </button>
        </form>
      </div>
    </div>
  );
}
