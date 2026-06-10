import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function AuthGuard() {
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
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
