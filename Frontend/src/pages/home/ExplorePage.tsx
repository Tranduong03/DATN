import { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { 
  Newspaper, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  BookOpen, 
  Tag, 
  Send, 
  Image, 
  Check, 
  Sparkles
} from 'lucide-react';

// Interfaces
interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'USER' | 'OWNER' | 'ADMIN';
  time: string;
  content: string;
  image?: string;
  category: 'General' | 'Tournament' | 'Class' | 'Promo';
  likes: number;
  liked: boolean;
  comments: Comment[];
}

interface Tournament {
  id: string;
  title: string;
  venueName: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  fee: string;
  maxTeams: number;
  registeredTeams: number;
  status: 'OPEN' | 'ONGOING' | 'CLOSED';
  image: string;
  registered: boolean;
}

interface TrainingClass {
  id: string;
  title: string;
  coachName: string;
  coachAvatar: string;
  sportType: string;
  schedule: string;
  price: string;
  rating: number;
  duration: string;
  registered: boolean;
}

interface Promo {
  id: string;
  code: string;
  discount: string;
  minSpend: string;
  description: string;
  expiry: string;
  venueName: string;
  copied: boolean;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'tournaments' | 'classes' | 'promos'>('feed');
  const [postCategoryFilter, setPostCategoryFilter] = useState<'ALL' | 'General' | 'Tournament' | 'Class' | 'Promo'>('ALL');

  // Local Storage persistence simulation
  const [posts, setPosts] = useState<Post[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  // Post Creator State
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'General' | 'Tournament' | 'Class' | 'Promo'>('General');
  const [newPostImage, setNewPostImage] = useState('');

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Khởi tạo dữ liệu ban đầu
  useEffect(() => {
    // 1. Khởi tạo Posts
    const initialPosts: Post[] = [
      {
        id: 'post-1',
        authorName: 'Trần Nguyên Phi Dương',
        authorAvatar: '',
        authorRole: 'USER',
        time: '10 phút trước',
        content: '🏸 Cần tìm 2 đối giao lưu cầu lông tối nay lúc 19h - 21h tại Sân cầu lông Ngôi Sao. Trình độ trung bình, anh em thân thiện vui vẻ, chi phí chia đều sân. Có nước trà đá miễn phí! Ai tham gia cmt bên dưới nhé.',
        category: 'General',
        likes: 12,
        liked: false,
        comments: [
          { id: 'c-1', author: 'Lê Văn Nam', avatar: '', content: 'Cho mình xin một slot nhé bạn ơi, trình độ trung bình yếu.', time: '8 phút trước' },
          { id: 'c-2', author: 'Nguyễn Minh Tuấn', avatar: '', content: 'Còn slot không chủ thớt? Mình đi 2 người.', time: '5 phút trước' }
        ]
      },
      {
        id: 'post-2',
        authorName: 'Sân Pickleball Demo Siêu VIP',
        authorAvatar: 'https://images.unsplash.com/photo-1545809074-59472b3f5ecc',
        authorRole: 'OWNER',
        time: '2 giờ trước',
        content: '🏆 Giải đấu "Pickleball Summer Open 2026" chính thức mở cổng đăng ký tại cơ sở của chúng tôi! Tổng giải thưởng lên tới 20.000.000đ cùng cúp vô địch mạ vàng danh giá. Cơ hội cọ sát với các vợt thủ hàng đầu. Đăng ký ngay trong tab Giải đấu bên trên!',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        category: 'Tournament',
        likes: 45,
        liked: true,
        comments: []
      },
      {
        id: 'post-3',
        authorName: 'Sân Test Onboarding ABC',
        authorAvatar: '',
        authorRole: 'OWNER',
        time: '5 giờ trước',
        content: '🔥 KHUYẾN MÃI CỰC KHỦNG! Giảm giá ngay 15% tổng hóa đơn đặt sân cầu lông & pickleball trong khung giờ vàng 08:00 - 15:00 từ thứ 2 đến thứ 6. Copy ngay voucher "GOLDENHOUR" trong phần Khuyến mãi nhé cả nhà!',
        category: 'Promo',
        likes: 28,
        liked: false,
        comments: [
          { id: 'c-3', author: 'Hoàng Long', avatar: '', content: 'Quá đã, mai rủ hội văn phòng đi quất thôi.', time: '3 giờ trước' }
        ]
      },
      {
        id: 'post-4',
        authorName: 'HLV Nguyễn Tiến Minh',
        authorAvatar: '',
        authorRole: 'ADMIN',
        time: '1 ngày trước',
        content: '🏸 Khai giảng khóa học cầu lông Nâng cao Kỹ thuật di chuyển và Đập cầu tấn công. Lớp giới hạn 8 học viên để đảm bảo chất lượng giảng dạy. Hỗ trợ sửa form tay và tư duy chiến thuật đánh đôi cực hiệu quả.',
        image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
        category: 'Class',
        likes: 67,
        liked: false,
        comments: []
      }
    ];

    // 2. Khởi tạo Tournaments
    const initialTournaments: Tournament[] = [
      {
        id: 't-1',
        title: 'Pickleball Summer Open 2026',
        venueName: 'Sân Pickleball Demo Siêu VIP',
        startDate: '15/06/2026',
        endDate: '18/06/2026',
        prizePool: '20.000.000 VNĐ',
        fee: '300.000 VNĐ / Cặp',
        maxTeams: 32,
        registeredTeams: 24,
        status: 'OPEN',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        registered: false
      },
      {
        id: 't-2',
        title: 'Giải Vô địch Cầu lông Đơn nam Quận 9',
        venueName: 'Sân Cầu Lông Huỳnh An',
        startDate: '22/06/2026',
        endDate: '24/06/2026',
        prizePool: '10.000.000 VNĐ',
        fee: '150.000 VNĐ / Người',
        maxTeams: 64,
        registeredTeams: 64,
        status: 'CLOSED',
        image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff',
        registered: false
      },
      {
        id: 't-3',
        title: 'Giao lưu Tennis Trẻ TP.HCM',
        venueName: 'CLB Quần vợt Ngôi Sao',
        startDate: '05/07/2026',
        endDate: '07/07/2026',
        prizePool: 'Hiện vật & Cúp lưu niệm',
        fee: 'Miễn phí',
        maxTeams: 16,
        registeredTeams: 8,
        status: 'OPEN',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
        registered: false
      }
    ];

    // 3. Khởi tạo Classes
    const initialClasses: TrainingClass[] = [
      {
        id: 'cl-1',
        title: 'Khóa học Cầu lông Cơ bản & Nâng cao',
        coachName: 'HLV Nguyễn Tiến Minh',
        coachAvatar: '',
        sportType: 'Cầu lông',
        schedule: 'Tối Thứ 2 - 4 - 6 (18:00 - 20:00)',
        price: '1.200.000đ / tháng',
        rating: 4.9,
        duration: '12 buổi / khóa',
        registered: false
      },
      {
        id: 'cl-2',
        title: 'Lớp Nhập môn Pickleball siêu tốc',
        coachName: 'Coach Anna Trịnh',
        coachAvatar: '',
        sportType: 'Pickleball',
        schedule: 'Sáng Thứ 7 - CN (08:00 - 10:00)',
        price: '800.000đ / khóa',
        rating: 4.7,
        duration: '6 buổi / khóa',
        registered: false
      },
      {
        id: 'cl-3',
        title: 'Chiến thuật Tennis Đánh đôi Chuyên nghiệp',
        coachName: 'HLV Phạm Hoàng Nam',
        coachAvatar: '',
        sportType: 'Quần vợt',
        schedule: 'Chiều Thứ 3 - 5 (16:00 - 18:00)',
        price: '1.800.000đ / tháng',
        rating: 4.8,
        duration: '8 buổi / khóa',
        registered: false
      }
    ];

    // 4. Khởi tạo Khuyến mãi
    const initialPromos: Promo[] = [
      {
        id: 'p-1',
        code: 'GOLDENHOUR',
        discount: '15%',
        minSpend: 'Không giới hạn',
        description: 'Giảm giá đặt sân trong khung giờ vàng 8:00 - 15:00 từ Thứ 2 đến Thứ 6.',
        expiry: '15/06/2026',
        venueName: 'Sân Test Onboarding ABC',
        copied: false
      },
      {
        id: 'p-2',
        code: 'NEWBIEPLAY',
        discount: '50.000 VNĐ',
        minSpend: 'Hóa đơn từ 200.000 VNĐ',
        description: 'Mã giảm giá cho khách đặt sân lần đầu tiên trên hệ thống SportConnect.',
        expiry: '30/06/2026',
        venueName: 'Tất cả các cơ sở',
        copied: false
      },
      {
        id: 'p-3',
        code: 'PICKLEBEST',
        discount: '20%',
        minSpend: 'Hóa đơn đặt sân Pickleball',
        description: 'Mã ưu đãi đặc quyền cho các tín đồ đam mê môn Pickleball cực HOT.',
        expiry: '10/06/2026',
        venueName: 'Sân Pickleball Demo Siêu VIP',
        copied: false
      }
    ];

    setPosts(initialPosts);
    setTournaments(initialTournaments);
    setClasses(initialClasses);
    setPromos(initialPromos);
  }, []);

  // Likes Handler
  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  // Add Comment Handler
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `c-${Date.now()}`,
          author: 'Bạn (Người dùng)',
          avatar: '',
          content: text,
          time: 'Vừa xong'
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Post Submit Handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorName: 'Bạn (Người dùng)',
      authorAvatar: '',
      authorRole: 'USER',
      time: 'Vừa xong',
      content: newPostText,
      image: newPostImage || undefined,
      category: newPostCategory,
      likes: 0,
      liked: false,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    setNewPostImage('');
    setNewPostCategory('General');
  };

  // Copy Coupon Handler
  const handleCopyPromo = (promoId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setPromos(prev => prev.map(p => {
      if (p.id === promoId) {
        return { ...p, copied: true };
      }
      return p;
    }));
    setTimeout(() => {
      setPromos(prev => prev.map(p => {
        if (p.id === promoId) {
          return { ...p, copied: false };
        }
        return p;
      }));
    }, 2000);
  };

  // Register Tournament Handler
  const handleRegisterTournament = (tId: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tId) {
        const alreadyRegistered = t.registered;
        return {
          ...t,
          registered: !alreadyRegistered,
          registeredTeams: alreadyRegistered ? t.registeredTeams - 1 : t.registeredTeams + 1
        };
      }
      return t;
    }));
  };

  // Register Training Class Handler
  const handleRegisterClass = (cId: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === cId) {
        return { ...c, registered: !c.registered };
      }
      return c;
    }));
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (postCategoryFilter === 'ALL') return true;
    return post.category === postCategoryFilter;
  });

  return (
    <MainLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f1f5f9', // Nền sáng sạch sẽ sang trọng
        minHeight: '100%',
        fontFamily: "'Montserrat', sans-serif",
        color: '#1e293b'
      }}>
        {/* 1. Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a24 0%, #326441 100%)',
          color: 'white',
          padding: '20px 16px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(50, 100, 65, 0.15)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Sparkles size={20} className="text-yellow-400" />
            Bảng tin Khám phá
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
            Kết nối thể thao, cập nhật giải đấu, lớp học và săn khuyến mãi độc quyền
          </p>
        </div>

        {/* 2. Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'white',
          padding: '4px',
          margin: '12px 16px',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          gap: 4
        }}>
          {[
            { id: 'feed', label: 'Bảng tin', icon: Newspaper },
            { id: 'tournaments', label: 'Giải đấu', icon: Award },
            { id: 'classes', label: 'Lớp học', icon: BookOpen },
            { id: 'promos', label: 'Ưu đãi', icon: Tag }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 0',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: active ? 'rgba(50, 100, 65, 0.1)' : 'transparent',
                  color: active ? '#326441' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 500,
                  fontSize: 11,
                  gap: 4,
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div style={{ padding: '0 16px 20px 16px', flex: 1 }}>
          
          {/* TAB 1: SOCIAL FEED */}
          {activeTab === 'feed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Post Creator Box */}
              <form onSubmit={handleCreatePost} style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    backgroundColor: '#326441', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    U
                  </div>
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Bạn đang nghĩ gì? Chia sẻ kèo đấu, tìm đối..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: 13,
                      height: 50,
                      fontFamily: 'inherit',
                      color: '#1e293b'
                    }}
                  />
                </div>

                {/* Optional Image URL Input */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: 8,
                  padding: '6px 10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image size={14} color="#64748b" style={{ marginRight: 6 }} />
                  <input
                    type="text"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    placeholder="Dán link ảnh đính kèm (không bắt buộc)..."
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 11,
                      width: '100%',
                      color: '#475569'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Phân loại:</span>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value as any)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: 11,
                        backgroundColor: 'white',
                        fontWeight: 600,
                        color: '#326441'
                      }}
                    >
                      <option value="General">Thảo luận / Tuyển đối</option>
                      <option value="Tournament">Giải đấu</option>
                      <option value="Class">Lớp học</option>
                      <option value="Promo">Khuyến mãi</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!newPostText.trim()}
                    style={{
                      backgroundColor: newPostText.trim() ? '#326441' : '#94a3b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: newPostText.trim() ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    Đăng tin
                    <Send size={12} />
                  </button>
                </div>
              </form>

              {/* Filter tags for posts */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'General', label: 'Tuyển đối/Giao lưu' },
                  { id: 'Tournament', label: 'Tin giải đấu' },
                  { id: 'Class', label: 'Tin lớp học' },
                  { id: 'Promo', label: 'Tin khuyến mãi' }
                ].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setPostCategoryFilter(tag.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      border: 'none',
                      backgroundColor: postCategoryFilter === tag.id ? '#326441' : 'white',
                      color: postCategoryFilter === tag.id ? 'white' : '#64748b',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                    }}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Posts Feed list */}
              {filteredPosts.map(post => (
                <div key={post.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  {/* Post Header */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      backgroundColor: post.authorRole === 'OWNER' ? '#f59e0b' : post.authorRole === 'ADMIN' ? '#ef4444' : '#326441',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13, overflow: 'hidden'
                    }}>
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        post.authorName[0]
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{post.authorName}</span>
                        {post.authorRole !== 'USER' && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                            backgroundColor: post.authorRole === 'OWNER' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: post.authorRole === 'OWNER' ? '#d97706' : '#ef4444'
                          }}>
                            {post.authorRole === 'OWNER' ? 'Chủ sân' : 'Admin'}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{post.time}</span>
                    </div>

                    {/* Post Category Badge */}
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      fontWeight: 600,
                      color: post.category === 'General' ? '#64748b' :
                             post.category === 'Tournament' ? '#d97706' :
                             post.category === 'Class' ? '#2563eb' : '#16a34a',
                      backgroundColor: post.category === 'General' ? '#f1f5f9' :
                                       post.category === 'Tournament' ? '#fef3c7' :
                                       post.category === 'Class' ? '#dbeafe' : '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: 6
                    }}>
                      {post.category === 'General' ? 'Thảo luận' :
                       post.category === 'Tournament' ? 'Giải đấu' :
                       post.category === 'Class' ? 'Lớp học' : 'Khuyến mãi'}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: 13, color: '#334155', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>
                    {post.content}
                  </p>

                  {/* Post Image */}
                  {post.image && (
                    <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 200, width: '100%', border: '1px solid #f1f5f9' }}>
                      <img src={post.image} alt="post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Post Action Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                    <span>{post.likes} lượt thích</span>
                    <span>{post.comments.length} bình luận</span>
                  </div>

                  {/* Post Action Buttons */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button
                      onClick={() => handleLikePost(post.id)}
                      style={{
                        flex: 1, border: 'none', background: 'none', padding: '6px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        color: post.liked ? '#ef4444' : '#64748b', fontWeight: 600, fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      <ThumbsUp size={16} fill={post.liked ? '#ef4444' : 'none'} />
                      Thích
                    </button>

                    <button
                      style={{
                        flex: 1, border: 'none', background: 'none', padding: '6px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        color: '#64748b', fontWeight: 600, fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageSquare size={16} />
                      Bình luận
                    </button>
                  </div>

                  {/* Comments section */}
                  {post.comments.length > 0 && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      {post.comments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            backgroundColor: '#64748b', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 10, flexShrink: 0
                          }}>
                            {comment.author[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>{comment.author}</span>
                              <span style={{ fontSize: 9, color: '#94a3b8' }}>{comment.time}</span>
                            </div>
                            <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        outline: 'none',
                        borderRadius: 18,
                        padding: '6px 12px',
                        fontSize: 12,
                        color: '#1e293b'
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      style={{
                        backgroundColor: '#326441',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={12} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tournaments.map(t => (
                <div key={t.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: t.registered ? '1.5px solid #16a34a' : '1px solid transparent'
                }}>
                  {/* Banner Image */}
                  <div style={{ height: 120, position: 'relative' }}>
                    <img src={t.image} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: t.status === 'OPEN' ? '#16a34a' : t.status === 'ONGOING' ? '#d97706' : '#64748b',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700
                    }}>
                      {t.status === 'OPEN' ? 'ĐANG MỞ ĐĂNG KÝ' : t.status === 'ONGOING' ? 'ĐANG DIỄN RA' : 'ĐÃ KẾT THÚC'}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#0f172a' }}>{t.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        📍 <strong>Cơ sở:</strong> {t.venueName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        📅 <strong>Thời gian:</strong> {t.startDate} - {t.endDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        🏆 <strong>Giải thưởng:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>{t.prizePool}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        💵 <strong>Lệ phí:</strong> {t.fee}
                      </span>
                    </div>

                    {/* Progress team registered */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        <span>Đội đăng ký: <strong>{t.registeredTeams}/{t.maxTeams} đội</strong></span>
                        <span>{Math.round((t.registeredTeams / t.maxTeams) * 100)}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(t.registeredTeams / t.maxTeams) * 100}%`,
                          height: '100%',
                          backgroundColor: t.registeredTeams === t.maxTeams ? '#ef4444' : '#16a34a',
                          borderRadius: 3
                        }} />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRegisterTournament(t.id)}
                      disabled={t.status !== 'OPEN'}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: t.registered ? 'rgba(22,163,74,0.1)' : t.status === 'OPEN' ? '#326441' : '#cbd5e1',
                        color: t.registered ? '#16a34a' : t.status === 'OPEN' ? 'white' : '#64748b',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: t.status === 'OPEN' ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                        borderStyle: t.registered ? 'solid' : 'none',
                        borderWidth: t.registered ? '1.5px' : '0px',
                        borderColor: t.registered ? '#16a34a' : 'transparent'
                      }}
                    >
                      {t.registered ? (
                        <>
                          <Check size={16} />
                          Đã đăng ký tham gia
                        </>
                      ) : (
                        'Đăng ký tham gia giải'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CLASSES */}
          {activeTab === 'classes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {classes.map(c => (
                <div key={c.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  border: c.registered ? '1.5px solid #2563eb' : '1px solid transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                        backgroundColor: c.sportType === 'Cầu lông' ? '#dcfce7' : c.sportType === 'Pickleball' ? '#dbeafe' : '#fef3c7',
                        color: c.sportType === 'Cầu lông' ? '#16a34a' : c.sportType === 'Pickleball' ? '#2563eb' : '#d97706',
                        display: 'inline-block', marginBottom: 6
                      }}>
                        {c.sportType}
                      </span>
                      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#0f172a' }}>{c.title}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#eab308' }}>
                      ⭐ {c.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Coach / Info block */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    backgroundColor: '#f8fafc', padding: 10, borderRadius: 8
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: '#2563eb', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12
                    }}>
                      {c.coachName[4]}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, display: 'block', color: '#334155' }}>{c.coachName}</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Huấn luyện viên Chuyên nghiệp</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      📅 <strong>Lịch học:</strong> {c.schedule}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      ⏱️ <strong>Thời lượng:</strong> {c.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      💵 <strong>Học phí:</strong> <strong style={{ color: '#2563eb' }}>{c.price}</strong>
                    </span>
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={() => handleRegisterClass(c.id)}
                    style={{
                      width: '100%',
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: c.registered ? 'rgba(37,99,235,0.1)' : '#2563eb',
                      color: c.registered ? '#2563eb' : 'white',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                      borderStyle: c.registered ? 'solid' : 'none',
                      borderWidth: c.registered ? '1.5px' : '0px',
                      borderColor: c.registered ? '#2563eb' : 'transparent'
                    }}
                  >
                    {c.registered ? (
                      <>
                        <Check size={14} />
                        Đã đăng ký học lớp này
                      </>
                    ) : (
                      'Đăng ký khóa học ngay'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PROMOS */}
          {activeTab === 'promos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {promos.map(p => (
                <div key={p.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  overflow: 'hidden',
                  border: '1px solid #f1f5f9'
                }}>
                  {/* Left coupon label */}
                  <div style={{
                    background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                    color: 'white',
                    width: 90,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    textAlign: 'center',
                    flexShrink: 0,
                    borderRight: '2px dashed #f1f5f9'
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{p.discount}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>GIẢM GIÁ</span>
                  </div>

                  {/* Right coupon content */}
                  <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#326441', fontWeight: 700 }}>🏡 {p.venueName}</span>
                      <h4 style={{ fontSize: 12, fontWeight: 700, margin: '4px 0 2px 0', color: '#1e293b' }}>
                        Áp dụng: {p.minSpend}
                      </h4>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: '1.4' }}>{p.description}</p>
                    </div>

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderTop: '1px solid #f8fafc', paddingTop: 8, marginTop: 4
                    }}>
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>Hạn dùng: {p.expiry}</span>
                      
                      <button
                        onClick={() => handleCopyPromo(p.id, p.code)}
                        style={{
                          backgroundColor: p.copied ? '#e8f5e9' : 'rgba(50, 100, 65, 0.1)',
                          border: p.copied ? '1px solid #16a34a' : '1px solid rgba(50, 100, 65, 0.3)',
                          color: p.copied ? '#16a34a' : '#326441',
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {p.copied ? (
                          <>
                            <Check size={10} />
                            Đã lưu!
                          </>
                        ) : (
                          p.code
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}

