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
          background: '#f8fafc',
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
            padding: '32px',
            textAlign: 'center'
          }}
        >
          <p 
            style={{ 
              color: '#1e293b', 
              fontSize: '14.5px', 
              fontWeight: '550', 
              lineHeight: '1.6',
              maxWidth: '280px',
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
