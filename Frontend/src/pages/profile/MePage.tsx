import { ChevronRight, GraduationCap, Users, Crown, Settings, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import avataBoy1 from '../../assets/icon/avata_boy_1.avif';
import avataBoy2 from '../../assets/icon/avata_boy_2.jpg';
import avataGirl1 from '../../assets/icon/avata_girl_1.jpg';
import avataGirl2 from '../../assets/icon/avata_girl_2.avif';

const defaultAvatars = [avataBoy1, avataBoy2, avataGirl1, avataGirl2];

interface JwtPayload {
  sub: string;
  email: string;
  unique_name: string;
  FullName: string;
  AvatarUrl: string;
  exp: number;
}

export default function MePage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{name: string, email: string, avatar: string}>({
    name: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/account');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      let name = decoded.FullName || decoded.unique_name || 'Người dùng';
      let email = decoded.email || 'Chưa cập nhật email';
      let avatar = decoded.AvatarUrl;

      if (!avatar) {
        // Pick a random avatar based on user ID or just random
        const charCodeSum = (decoded.sub || 'a').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        avatar = defaultAvatars[charCodeSum % defaultAvatars.length];
      }

      setUserInfo({ name, email, avatar });
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/account');
    }
  }, [navigate]);

  return (
    <MainLayout>
      <div className="me-page">
        <div className="me-header-bg"></div>
        
        <div className="me-content">
          <Link to="/profile" className="me-profile-card" style={{ textDecoration: 'none' }}>
            <div className="me-avatar-container">
              <img src={userInfo.avatar || undefined} alt="Avatar" className="me-avatar" />
            </div>
            <div className="me-info">
              <h2 className="me-name">{userInfo.name}</h2>
              <p className="me-email">{userInfo.email}</p>
            </div>
            <ChevronRight color="white" />
          </Link>

          <div className="me-dashboard-box">
            <div className="me-membership">
              <span className="me-membership-icon">💎</span>
              <span className="me-membership-text">Hạng thành viên</span>
              <ChevronRight color="white" size={16} style={{ marginLeft: '4px' }} />
            </div>

            {/* Quick Actions Grid */}
            <div className="me-grid-actions">
              <div className="me-action-item">
                <div className="me-action-icon">
                  <span style={{ fontSize: '28px' }}>📅</span>
                </div>
                <span>Lịch đã đặt</span>
              </div>
              <div className="me-action-item">
                <div className="me-action-icon">
                  <span style={{ fontSize: '28px' }}>🎉</span>
                </div>
                <span>Thông báo</span>
              </div>
              <div className="me-action-item">
                <div className="me-action-icon">
                  <span style={{ fontSize: '28px' }}>📚</span>
                </div>
                <span>Khoá học</span>
              </div>
              <div className="me-action-item">
                <div className="me-action-icon">
                  <span style={{ fontSize: '28px' }}>🎁</span>
                </div>
                <span>Ưu đãi</span>
              </div>
            </div>
          </div>

          <div className="me-card-container">

            <div className="me-menu-section">
              <h3 className="me-menu-title">Hoạt động</h3>
              <div className="me-menu-list">
                <Link to="/groups" className="me-menu-item">
                  <Users className="me-menu-icon" />
                  <span className="me-menu-text">Nhóm của tôi</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
                <Link to="/courses" className="me-menu-item">
                  <GraduationCap className="me-menu-icon" />
                  <span className="me-menu-text">Danh sách lịch học</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
                <Link to="/packages" className="me-menu-item">
                  <Crown className="me-menu-icon" />
                  <span className="me-menu-text">Gói hội viên</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
              </div>
            </div>

            <div className="me-menu-section">
              <h3 className="me-menu-title">Hệ thống</h3>
              <div className="me-menu-list">
                <Link to="/settings" className="me-menu-item">
                  <Settings className="me-menu-icon" />
                  <span className="me-menu-text">Cài đặt</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
                <Link to="/version" className="me-menu-item">
                  <Info className="me-menu-icon" />
                  <span className="me-menu-text">Thông tin phiên bản</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
                <Link to="/terms" className="me-menu-item">
                  <ShieldCheck className="me-menu-icon" />
                  <span className="me-menu-text">Điều khoản và chính sách</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
                <Link to="/whats-new" className="me-menu-item">
                  <Sparkles className="me-menu-icon" />
                  <span className="me-menu-text">Ứng dụng có gì mới</span>
                  <ChevronRight className="me-menu-chevron" size={20} />
                </Link>
              </div>
            </div>

            <div className="me-footer">
              <p>Thông tin phiên bản: 1.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
