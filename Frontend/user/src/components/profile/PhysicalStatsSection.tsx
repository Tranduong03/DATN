import { Edit2, Check } from 'lucide-react';

interface PhysicalStatsSectionProps {
  height: number;
  setHeight: (height: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  specialNotes: string;
  setSpecialNotes: (notes: string) => void;
  isEditingPhysical: boolean;
  setIsEditingPhysical: (isEditing: boolean) => void;
  isEditingNotes: boolean;
  setIsEditingNotes: (isEditing: boolean) => void;
  handleSavePhysical: () => Promise<void>;
  handleSaveNotes: (notes: string) => Promise<void>;
  bmi: string;
  bmiStatus: string;
  bmiClass: string;
}

export default function PhysicalStatsSection({
  height,
  setHeight,
  weight,
  setWeight,
  specialNotes,
  setSpecialNotes,
  isEditingPhysical,
  setIsEditingPhysical,
  isEditingNotes,
  setIsEditingNotes,
  handleSavePhysical,
  handleSaveNotes,
  bmi,
  bmiStatus,
  bmiClass
}: PhysicalStatsSectionProps) {
  return (
    <div className="overview-section-card">
      <div className="section-card-header">
        <h3 className="section-card-title">THÔNG TIN THỂ CHẤT</h3>
        <button 
          onClick={() => {
            if (isEditingPhysical) {
              handleSavePhysical();
            }
            setIsEditingPhysical(!isEditingPhysical);
          }} 
          className={`section-edit-btn ${isEditingPhysical ? 'active' : ''}`}
          aria-label="Sửa thông tin thể chất"
        >
          {isEditingPhysical ? <Check size={14} /> : <Edit2 size={14} />}
        </button>
      </div>

      <div className="physical-cards-row">
        <div className="physical-stat-card">
          <div className="card-stat-header">
            <span className="card-stat-title">Chiều cao</span>
          </div>
          <div className="card-stat-value">{height} <span className="unit">cm</span></div>
          {isEditingPhysical && (
            <input 
              type="range" 
              min="130" 
              max="220" 
              value={height} 
              onChange={(e) => setHeight(Number(e.target.value))} 
              className="stat-slider-mini"
            />
          )}
        </div>

        <div className="physical-stat-card">
          <div className="card-stat-header">
            <span className="card-stat-title">Cân nặng</span>
          </div>
          <div className="card-stat-value">{weight} <span className="unit">kg</span></div>
          {isEditingPhysical && (
            <input 
              type="range" 
              min="30" 
              max="150" 
              value={weight} 
              onChange={(e) => setWeight(Number(e.target.value))} 
              className="stat-slider-mini"
            />
          )}
        </div>

        <div className="physical-stat-card bmi-card-highlight">
          <div className="card-stat-header">
            <span className="card-stat-title">Chỉ số BMI</span>
          </div>
          <div className="card-stat-value">{bmi}</div>
          <div className={`bmi-status-badge ${bmiClass}`}>{bmiStatus}</div>
        </div>
      </div>

      {/* Special Notes Box */}
      {specialNotes && specialNotes !== 'Chưa có ghi chú đặc biệt' ? (
        <div className="special-notes-wrapper2">
          <div className="notes-header">
            <span className="notes-label">Ghi chú đặc biệt</span>
            <button 
              onClick={() => setIsEditingNotes(!isEditingNotes)} 
              className="notes-edit-btn"
              aria-label="Sửa ghi chú"
            >
              <Edit2 size={12} />
            </button>
          </div>
          {isEditingNotes ? (
            <div className="notes-edit-container">
              <textarea 
                value={specialNotes} 
                onChange={(e) => setSpecialNotes(e.target.value)} 
                className="notes-textarea"
              />
              <button onClick={() => handleSaveNotes(specialNotes)} className="notes-save-btn">
                Xác nhận
              </button>
            </div>
          ) : (
            <div className="notes-content-box">
              <span className="notes-text">{specialNotes}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="special-notes-placeholder-row">
          <span className="placeholder-text">Chưa có ghi chú đặc biệt nào</span>
          {isEditingNotes ? (
            <div className="notes-edit-container inline-edit">
              <textarea 
                value={specialNotes === 'Chưa có ghi chú đặc biệt' ? '' : specialNotes} 
                onChange={(e) => setSpecialNotes(e.target.value)} 
                placeholder="Nhập ghi chú đặc biệt của bạn..."
                className="notes-textarea"
              />
              <button onClick={() => handleSaveNotes(specialNotes)} className="notes-save-btn">
                Xác nhận
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setSpecialNotes('');
                setIsEditingNotes(true);
              }} 
              className="add-notes-btn"
            >
              + Thêm ghi chú
            </button>
          )}
        </div>
      )}
    </div>
  );
}
