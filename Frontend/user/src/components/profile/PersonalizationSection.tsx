import { MapPin, Activity, Trophy, Calendar, Check, Edit2 } from 'lucide-react';

interface PersonalizationSectionProps {
  favPosition: string;
  setFavPosition: (val: string) => void;
  sportsLevel: string;
  setSportsLevel: (val: string) => void;
  goals: string;
  setGoals: (val: string) => void;
  frequency: string;
  setFrequency: (val: string) => void;
  isEditingPersonalization: boolean;
  setIsEditingPersonalization: (val: boolean) => void;
  handleSavePersonalization: () => Promise<void>;
}

export default function PersonalizationSection({
  favPosition,
  setFavPosition,
  sportsLevel,
  setSportsLevel,
  goals,
  setGoals,
  frequency,
  setFrequency,
  isEditingPersonalization,
  setIsEditingPersonalization,
  handleSavePersonalization
}: PersonalizationSectionProps) {
  return (
    <div className="overview-section-card">
      <div className="section-card-header">
        <h3 className="section-card-title">CÁ NHÂN HÓA</h3>
        <button 
          onClick={() => {
            if (isEditingPersonalization) {
              handleSavePersonalization();
            }
            setIsEditingPersonalization(!isEditingPersonalization);
          }} 
          className={`section-edit-btn ${isEditingPersonalization ? 'active' : ''}`}
          aria-label="Sửa cá nhân hóa"
        >
          {isEditingPersonalization ? <Check size={14} /> : <Edit2 size={14} />}
        </button>
      </div>

      <div className="personalization-list">
        {/* Vị trí yêu thích */}
        <div className="personal-list-item">
          <div className="item-left">
            <MapPin size={18} className="item-icon" />
            <div className="item-details">
              <span className="item-label">Vị trí yêu thích</span>
              {isEditingPersonalization ? (
                <input 
                  type="text" 
                  value={favPosition} 
                  onChange={(e) => setFavPosition(e.target.value)} 
                  className="item-input"
                />
              ) : (
                <span className="item-value">
                  {favPosition === 'Chưa cập nhật' ? (
                    <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                      + Thêm vị trí
                    </button>
                  ) : (
                    favPosition
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thể thao & Trình độ */}
        <div className="personal-list-item">
          <div className="item-left">
            <Activity size={18} className="item-icon" />
            <div className="item-details">
              <span className="item-label">Thể thao & Trình độ</span>
              {isEditingPersonalization ? (
                <input 
                  type="text" 
                  value={sportsLevel} 
                  onChange={(e) => setSportsLevel(e.target.value)} 
                  className="item-input"
                />
              ) : (
                <span className="item-value">
                  {sportsLevel === 'Chưa cập nhật' ? (
                    <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                      + Chọn trình độ
                    </button>
                  ) : (
                    sportsLevel
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mục tiêu */}
        <div className="personal-list-item">
          <div className="item-left">
            <Trophy size={18} className="item-icon" />
            <div className="item-details">
              <span className="item-label">Mục tiêu</span>
              {isEditingPersonalization ? (
                <input 
                  type="text" 
                  value={goals} 
                  onChange={(e) => setGoals(e.target.value)} 
                  className="item-input"
                />
              ) : (
                <span className="item-value">
                  {goals === 'Chưa cập nhật' ? (
                    <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                      + Thêm mục tiêu
                    </button>
                  ) : (
                    goals
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tần suất chơi */}
        <div className="personal-list-item no-border">
          <div className="item-left">
            <Calendar size={18} className="item-icon" />
            <div className="item-details">
              <span className="item-label">Tần suất chơi</span>
              {isEditingPersonalization ? (
                <input 
                  type="text" 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)} 
                  className="item-input"
                />
              ) : (
                <div className="frequency-display-row">
                  <span className="item-value">
                    {frequency === 'Chưa cập nhật' ? (
                      <button onClick={() => setIsEditingPersonalization(true)} className="cta-link-btn">
                        + Thiết lập tần suất
                      </button>
                    ) : (
                      frequency
                    )}
                  </span>
                  
                  <div className={`frequency-mini-calendar2 ${frequency === 'Chưa cập nhật' ? 'not-configured' : ''}`}>
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                      const isActive = frequency !== 'Chưa cập nhật' && ['T2', 'T4', 'T6'].includes(day);
                      return (
                        <span key={day} className={`mini-day2 ${isActive ? 'active' : ''}`}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
