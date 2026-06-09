import SubPageHeader from '../../components/common/SubPageHeader';
import MainLayout from '../../components/layout/MainLayout';

export default function MemberPage() {
  return (
    <MainLayout>
      <div 
        className="member-page-wrapper" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          background: '#e4f0f3b9',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <SubPageHeader title="Thông tin thành viên" />
        
        <div 
          style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '28px',
            textAlign: 'center'
          }}
        >
          <p 
            style={{ 
              color: '#204e2e', 
              fontSize: '13px', 
              fontWeight: '350', 
              lineHeight: '1.6',
              maxWidth: '320px',
              margin: '0 auto'
            }}
          >
            Bạn chưa tham gia sân nào có mở hạng thành viên
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
