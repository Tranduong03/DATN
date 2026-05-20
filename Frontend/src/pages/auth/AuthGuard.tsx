import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Bảo vệ các route cần đăng nhập (ví dụ: /me, /profile, /settings, /owner/*)
 * Nếu chưa có token hoặc token đã hết hạn → redirect về /login
 */
export default function AuthGuard() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
