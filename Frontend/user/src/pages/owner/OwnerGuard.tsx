import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Bảo vệ route /owner/*
 * Yêu cầu: Đã đăng nhập, token còn hạn, và có role Owner (hoặc Admin).
 */
export default function OwnerGuard() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    const hasRefreshToken = !!localStorage.getItem('refreshToken');
    if (decoded.exp * 1000 < Date.now() && !hasRefreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return <Navigate to="/login" replace />;
    }

    const rawRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const roles = Array.isArray(rawRole) ? rawRole : rawRole ? [rawRole] : [];
    
    const isOwnerOrAdmin = roles.some((r: string) => r === 'Owner' || r === 'Admin' || r === 'owner');
    
    if (!isOwnerOrAdmin) {
      // Nếu không phải owner, redirect về trang đăng ký owner
      return <Navigate to="/owner/onboarding" replace />;
    }
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
