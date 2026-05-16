import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trophy, Wifi, TrendingUp, Users, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

const API_BASE_URL = '/api';

/* ─── tiny inline style helpers ─── */
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  padding: '18px 16px',
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: 0.4,
  marginTop: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  background: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.35)',
  cursor: 'not-allowed',
};

const inputStyle: React.CSSProperties = {
  padding: '13px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.07)',
  color: '#fff',
  fontSize: 15,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

/* ─── Page wrapper ─── */
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)',
  color: '#fff',
  fontFamily: "'Inter','Segoe UI',sans-serif",
  padding: '0 0 40px',
  maxWidth: 480,
  margin: '0 auto',
};

/* ─── Progress bar ─── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 8, margin: '12px 20px 0' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  );
}

/* ════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════ */
export default function OwnerOnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('None');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/account'); return; }
      const res = await fetch(`${API_BASE_URL}/OwnerOnboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setCurrentStep(1); return; }
      const data = await res.json();
      if (data.isSuccess) {
        const { verificationStatus: vs, currentStep: cs, draftData, rejectReason: rr } = data.data;
        setVerificationStatus(vs);
        setRejectReason(rr || '');
        if (draftData) { try { setFormData(JSON.parse(draftData)); } catch (_) {} }
        if (vs === 'Pending') setCurrentStep(7);
        else if (vs === 'Verified') navigate('/owner');
        else if (vs === 'Rejected') setCurrentStep(8);
        else setCurrentStep(cs || 1);
      } else setCurrentStep(1);
    } catch (e) { console.error(e); setCurrentStep(1); }
    finally { setLoading(false); }
  };

  const saveDraft = async (step: number, data: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/OwnerOnboarding/save-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ step, draftData: JSON.stringify(data) }),
      });
    } catch (e) { console.error(e); }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/OwnerOnboarding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ step: 7, draftData: JSON.stringify(formData) }),
      });
      const data = await res.json();
      if (data.isSuccess) setCurrentStep(7);
      else alert(data.message || 'Có lỗi xảy ra');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleNext = (nextStep: number, newData: any) => {
    const merged = { ...formData, ...newData };
    setFormData(merged);
    setCurrentStep(nextStep);
    saveDraft(nextStep, merged);
  };

  const goBack = () => {
    if (!currentStep) return;
    if (currentStep === 1 || currentStep >= 7) navigate('/settings');
    else if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 6) setCurrentStep(4);
    else setCurrentStep(currentStep - 1);
  };

  const stepsInFlow = [1, 2, 3, 4, 6]; // step 5 skipped, step 6 = confirm
  const stepIndex = stepsInFlow.indexOf(currentStep ?? 1) + 1;

  if (loading || currentStep === null) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#f59e0b' }} />
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 0', position: 'sticky', top: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft color="#fff" size={20} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
          {currentStep < 7 ? 'Đăng ký Chủ sân' : 'Trạng thái hồ sơ'}
        </h1>
        <div style={{ width: 36 }} />
      </div>

      {currentStep < 7 && <ProgressBar step={stepIndex} total={5} />}

      {/* Step label */}
      {currentStep < 7 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          Bước {stepIndex} / 5
        </p>
      )}

      <div style={{ padding: '8px 20px 0' }}>
        {currentStep === 1 && <Step1 onNext={() => handleNext(2, {})} />}
        {currentStep === 2 && <Step2 data={formData} onNext={(d) => handleNext(3, d)} />}
        {currentStep === 3 && <Step3 data={formData} onNext={(d) => handleNext(4, d)} />}
        {currentStep === 4 && <Step4 data={formData} onNext={(d) => handleNext(6, d)} />}
        {currentStep === 6 && <Step6 data={formData} onSubmit={submitOnboarding} />}
        {currentStep === 7 && <StepPending onBack={() => navigate('/me')} />}
        {currentStep === 8 && <StepRejected reason={rejectReason} onBack={() => navigate('/me')} />}
      </div>
    </div>
  );
}

/* ─── STEP 1 — Introduction ─── */
function Step1({ onNext }: { onNext: () => void }) {
  const benefits = [
    { icon: <TrendingUp size={20} color="#f59e0b" />, text: 'Theo dõi lịch đặt & doanh thu theo thời gian thực' },
    { icon: <Wifi size={20} color="#34d399" />, text: 'Cho thuê sân trực tuyến 24/7, không cần gọi điện' },
    { icon: <Users size={20} color="#60a5fa" />, text: 'Tiếp cận hàng nghìn người chơi trong khu vực' },
    { icon: <Trophy size={20} color="#c084fc" />, text: 'Quản lý nhiều sân & chi nhánh trên một nền tảng' },
  ];
  return (
    <div>
      <div style={{ textAlign: 'center', margin: '28px 0 24px' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#f59e0b22,#d9770622)', border: '1px solid #f59e0b44', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trophy size={36} color="#f59e0b" />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Trở thành Chủ sân</h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Mở rộng kinh doanh, tăng thu nhập với SportConnect</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {benefits.map((b, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flexShrink: 0 }}>{b.icon}</div>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{b.text}</span>
          </div>
        ))}
      </div>
      <button style={btnPrimary} onClick={onNext}>Bắt đầu đăng ký <ChevronRight size={18} /></button>
    </div>
  );
}

/* ─── STEP 2 — Sport types ─── */
const SPORT_EMOJIS: Record<string, string> = {
  'Cầu lông': '🏸', 'Tennis': '🎾', 'Pickleball': '🏓', 'Bóng đá': '⚽', 'Bóng rổ': '🏀', 'Khác': '🏟️',
};
function Step2({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [selected, setSelected] = useState<string[]>(data.sportTypes || []);
  const sports = Object.keys(SPORT_EMOJIS);
  const toggle = (s: string) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Loại sân thể thao</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>Chọn một hoặc nhiều loại sân bạn đang kinh doanh</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {sports.map(s => {
          const active = selected.includes(s);
          return (
            <button key={s} onClick={() => toggle(s)} style={{
              padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontSize: 14, fontWeight: 600,
              border: active ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.12)',
              background: active ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
              color: active ? '#fbbf24' : 'rgba(255,255,255,0.75)',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{SPORT_EMOJIS[s]}</div>
              {s}
              {active && <CheckCircle2 size={14} style={{ marginLeft: 6, verticalAlign: 'middle', color: '#f59e0b' }} />}
            </button>
          );
        })}
      </div>
      <button style={selected.length > 0 ? btnPrimary : btnDisabled} disabled={selected.length === 0} onClick={() => onNext({ sportTypes: selected })}>
        Tiếp tục <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── STEP 3 — Basic info ─── */
function Step3({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [venueName, setVenueName] = useState(data.venueName || '');
  const [venueAddress, setVenueAddress] = useState(data.venueAddress || '');
  const [contactPhone, setContactPhone] = useState(data.contactPhone || '');
  const [description, setDescription] = useState(data.description || '');
  const [operatingStartHour, setOperatingStartHour] = useState(data.operatingStartHour || '06:00');
  const [operatingEndHour, setOperatingEndHour] = useState(data.operatingEndHour || '22:00');
  const isValid = venueName.trim() && venueAddress.trim() && contactPhone.trim();

  const LabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Thông tin cơ bản</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Điền thông tin sân của bạn</p>
      </div>
      <div>
        <label style={LabelStyle}>Tên sân *</label>
        <input placeholder="VD: Sân Cầu Lông Thành Công" value={venueName} onChange={e => setVenueName(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={LabelStyle}>Địa chỉ *</label>
        <input placeholder="Số nhà, đường, phường, quận, TP" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} style={inputStyle} />
      </div>
      <div>
        <label style={LabelStyle}>Số điện thoại liên hệ *</label>
        <input placeholder="0901 234 567" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={inputStyle} type="tel" />
      </div>
      <div>
        <label style={LabelStyle}>Mô tả ngắn (không bắt buộc)</label>
        <textarea placeholder="Giới thiệu ngắn về sân của bạn..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={LabelStyle}>Giờ mở cửa</label>
          <input type="time" value={operatingStartHour} onChange={e => setOperatingStartHour(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={LabelStyle}>Giờ đóng cửa</label>
          <input type="time" value={operatingEndHour} onChange={e => setOperatingEndHour(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <button style={isValid ? btnPrimary : btnDisabled} disabled={!isValid} onClick={() => onNext({ venueName, venueAddress, contactPhone, description, operatingStartHour, operatingEndHour })}>
        Tiếp tục <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── STEP 4 — Scale ─── */
function Step4({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [scale, setScale] = useState<number>(data.venueScale || 1);
  const presets = [1, 2, 3, 4, 5, 6, 8, 10];
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Quy mô sân</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 }}>Tổng số sân/court bạn đang vận hành</p>
      <div style={{ textAlign: 'center', margin: '0 0 20px' }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{scale}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>sân / court</div>
      </div>
      {/* Quick select */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {presets.map(p => (
          <button key={p} onClick={() => setScale(p)} style={{
            padding: '8px 16px', borderRadius: 20, border: scale === p ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
            background: scale === p ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
            color: scale === p ? '#fbbf24' : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          }}>{p}</button>
        ))}
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Hoặc nhập số chính xác:</label>
        <input type="number" min={1} max={999} value={scale} onChange={e => setScale(Math.max(1, Number(e.target.value)))} style={{ ...inputStyle, textAlign: 'center', fontSize: 20, fontWeight: 700 }} />
      </div>
      <button style={btnPrimary} onClick={() => onNext({ venueScale: scale })}>
        Tiếp tục <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── STEP 6 — Confirmation ─── */
function Step6({ data, onSubmit }: { data: any; onSubmit: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const rows = [
    ['Loại sân', data.sportTypes?.join(', ')],
    ['Tên sân', data.venueName],
    ['Địa chỉ', data.venueAddress],
    ['Liên hệ', data.contactPhone],
    ['Mô tả', data.description || '—'],
    ['Giờ hoạt động', `${data.operatingStartHour} – ${data.operatingEndHour}`],
    ['Số lượng sân', data.venueScale],
  ];
  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit();
    setSubmitting(false);
  };
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Xác nhận thông tin</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>Kiểm tra lại trước khi gửi yêu cầu</p>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: 600, textAlign: 'right', color: '#fff', wordBreak: 'break-word' }}>{v ?? '—'}</span>
          </div>
        ))}
      </div>
      <button style={{ ...btnPrimary, background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#22c55e,#16a34a)' }} onClick={handleSubmit} disabled={submitting}>
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
      </button>
    </div>
  );
}

/* ─── STEP 7 — Pending ─── */
function StepPending({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(250,204,21,0.12)', border: '2px solid #facc1566', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <Clock size={44} color="#facc15" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>Yêu cầu đang xử lý</h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: 14 }}>
        Hồ sơ Chủ sân của bạn đã được tiếp nhận.<br />
        Admin sẽ liên hệ xác minh trong thời gian sớm nhất.
      </p>
      <div style={{ ...card, marginTop: 28, textAlign: 'left' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          📞 Hotline: <strong style={{ color: '#fff' }}>0901 234 567</strong><br />
          💬 Zalo / Facebook: <strong style={{ color: '#fff' }}>SportConnect Vietnam</strong>
        </p>
      </div>
      <button style={{ ...btnPrimary, background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={onBack}>Quay về trang cá nhân</button>
    </div>
  );
}

/* ─── STEP 8 — Rejected ─── */
function StepRejected({ reason, onBack }: { reason: string; onBack: () => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 40 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid #ef444466', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <XCircle size={44} color="#f87171" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px', color: '#fca5a5' }}>Yêu cầu bị từ chối</h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontSize: 14 }}>
        Rất tiếc, hồ sơ của bạn không được duyệt lần này.
      </p>
      {reason && (
        <div style={{ ...card, marginTop: 16, textAlign: 'left', borderColor: '#ef444440' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <strong>Lý do:</strong> {reason}
          </p>
        </div>
      )}
      <button style={{ ...btnPrimary, background: 'rgba(255,255,255,0.1)' }} onClick={onBack}>Quay về trang cá nhân</button>
    </div>
  );
}
