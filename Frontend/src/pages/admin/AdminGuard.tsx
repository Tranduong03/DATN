import { Navigate, Outlet } from 'react-router-dom';

/**
 * Bảo vệ tất cả route /admin/* 
 * Nếu chưa có adminToken → redirect về /admin/login
 */
export default function AdminGuard() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
