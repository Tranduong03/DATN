import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import PageTransition from './components/layout/PageTransition';
import BottomNavigation from './components/layout/BottomNavigation';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AccountPage from './pages/profile/AccountPage';
import HomePage from './pages/home/HomePage';
import MePage from './pages/profile/MePage';
import SettingsPage from './pages/profile/SettingsPage';
import ChangePasswordPage from './pages/profile/ChangePasswordPage';
import OwnerOnboardingFlow from './pages/owner/OwnerOnboardingFlow';
import MyBookingsPage from './pages/profile/MyBookingsPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerVenuesPage from './pages/owner/OwnerVenuesPage';
import VenueConfigPage from './pages/owner/VenueConfigPage';
import VenueDetailPage from './pages/home/VenueDetailPage';
import PaymentResultPage from './pages/home/PaymentResultPage';
import MatchListPage from './pages/home/MatchListPage';
import MatchDetailPage from './pages/home/MatchDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOwnerRequestsPage from './pages/admin/AdminOwnerRequestsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminGuard from './pages/admin/AdminGuard';
import AdminSportCategoriesPage from './pages/admin/AdminSportCategoriesPage';
import ProfilePage from './pages/profile/ProfilePage';

import AuthGuard from './pages/auth/AuthGuard';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import OwnerGuard from './pages/owner/OwnerGuard';

const tabRoutes = ['/', '/map', '/explore', '/matches', '/account', '/me'];

function AppRoutes() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(1);

  if (location.pathname !== prevPathRef.current) {
    const prevIndex = tabRoutes.indexOf(prevPathRef.current);
    const nextIndex = tabRoutes.indexOf(location.pathname);
    
    // Chỉ tính hướng slide khi cả hai đều nằm trong danh sách các tab
    if (prevIndex !== -1 && nextIndex !== -1) {
      directionRef.current = nextIndex > prevIndex ? 1 : -1;
    } else {
      // Mặc định
      directionRef.current = 1;
    }
    prevPathRef.current = location.pathname;
  }

  const direction = directionRef.current;

  // Hàm bọc các component với PageTransition để tái sử dụng
  const withTransition = (Component: any) => (
    <PageTransition direction={direction}>
      <Component />
    </PageTransition>
  );

  // Hide bottom nav on certain pages
  const hideBottomNav = ['/login', '/register', '/forgot-password', '/payment-result', '/admin', '/owner'].some(path => location.pathname.startsWith(path));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={withTransition(HomePage)} />
          <Route path="/venue/:id" element={<VenueDetailPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/matches" element={withTransition(MatchListPage)} />
          <Route path="/matches/:id" element={<MatchDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/account" element={withTransition(AccountPage)} />

          {/* User Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route path="/me" element={withTransition(MePage)} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/me/bookings" element={<MyBookingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/change-password" element={<ChangePasswordPage />} />
            <Route path="/owner/onboarding" element={<OwnerOnboardingFlow />} />
          </Route>

          {/* Owner Only Routes */}
          <Route element={<OwnerGuard />}>
            <Route path="/owner" element={<OwnerDashboardPage />} />
            <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
            <Route path="/owner/venues" element={<OwnerVenuesPage />} />
            <Route path="/owner/venues/:id" element={<VenueConfigPage />} />
          </Route>

          {/* Admin login — public, không cần guard */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin routes — được bảo vệ bởi AdminGuard */}
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/owner-requests" element={<AdminOwnerRequestsPage />} />
            <Route path="/admin/sport-categories" element={<AdminSportCategoriesPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
