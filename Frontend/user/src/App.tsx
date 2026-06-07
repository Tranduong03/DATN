import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRef, lazy, Suspense } from 'react';
import PageTransition from './components/layout/PageTransition';
import BottomNavigation from './components/layout/BottomNavigation';
import GlobalNotification from './components/common/GlobalNotification';
import LoadingOverlay from './components/common/LoadingOverlay';

// Route Guards (imported statically to avoid authentication validation delays)
import AuthGuard from './pages/auth/AuthGuard';
import OwnerGuard from './pages/owner/OwnerGuard';

// Lazy loaded page components
// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// User/Profile pages
const AccountPage = lazy(() => import('./pages/profile/AccountPage'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const MePage = lazy(() => import('./pages/profile/MePage'));
const UserProfile = lazy(() => import('./pages/profile/UserProfile'));
const SettingsPage = lazy(() => import('./pages/profile/SettingsPage'));
const ChangePasswordPage = lazy(() => import('./pages/profile/ChangePasswordPage'));
const MyBookingsPage = lazy(() => import('./pages/profile/MyBookingsPage'));

// Owner pages
const OwnerOnboardingFlow = lazy(() => import('./pages/owner/OwnerOnboardingFlow'));
const OwnerDashboardPage = lazy(() => import('./pages/owner/OwnerDashboardPage'));
const OwnerVenuesPage = lazy(() => import('./pages/owner/OwnerVenuesPage'));
const VenueConfigPage = lazy(() => import('./pages/owner/VenueConfigPage'));
const OwnerBookingsPage = lazy(() => import('./pages/owner/OwnerBookingsPage'));

// General/Home pages
const VenueDetailPage = lazy(() => import('./pages/home/VenueDetailPage'));
const PaymentResultPage = lazy(() => import('./pages/home/PaymentResultPage'));
const MatchListPage = lazy(() => import('./pages/home/MatchListPage'));
const MatchDetailPage = lazy(() => import('./pages/home/MatchDetailPage'));
const MapPage = lazy(() => import('./pages/home/MapPage'));
const ExplorePage = lazy(() => import('./pages/home/ExplorePage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));

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
      <Suspense fallback={<LoadingOverlay isLoading={true} text="Đang tải trang..." />}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={withTransition(HomePage)} />
            <Route path="/map" element={withTransition(MapPage)} />
            <Route path="/explore" element={withTransition(ExplorePage)} />
            <Route path="/venue/:id" element={<VenueDetailPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
            <Route path="/matches" element={withTransition(MatchListPage)} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/account" element={withTransition(AccountPage)} />

            <Route path="/reservedBooking" element={<MyBookingsPage />} />

            {/* User Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/me" element={withTransition(MePage)} />
              <Route path="/UserProfile" element={<UserProfile />} />
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

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {!hideBottomNav && <BottomNavigation />}
      <GlobalNotification />
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
