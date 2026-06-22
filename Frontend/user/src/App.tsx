import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useRef, lazy, Suspense, useState, useEffect } from 'react';
import PageTransition from './components/layout/PageTransition';
import BottomNavigation from './components/layout/BottomNavigation';
import GlobalNotification from './components/common/GlobalNotification';
import LoadingOverlay from './components/common/LoadingOverlay';
import Preloader from './components/common/Preloader';

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
const MemberPage = lazy(() => import('./pages/profile/MemberPage'));

// Owner pages
const OwnerOnboardingFlow = lazy(() => import('./pages/owner/OwnerOnboardingFlow'));
const OwnerDashboardPage = lazy(() => import('./pages/owner/DashboardPage'));
const OwnerVenuesPage = lazy(() => import('./pages/owner/OwnerVenuesPage'));
const VenuePricePage = lazy(() => import('./pages/owner/VenuePricePage'));
const VenueListCourt = lazy(() => import('./pages/owner/VenueListCourt'));
const OwnerVenueDetailPage = lazy(() => import('./pages/owner/VenueDetailPage'));
const OwnerBookingsPage = lazy(() => import('./pages/owner/BookingsPage'));
const OwnerBookingServicesPage = lazy(() => import('./pages/owner/BookingServicesPage'));
const OwnerSubFeaturePage = lazy(() => import('./pages/owner/OwnerSubFeaturePage'));
const CreateCourtPage = lazy(() => import('./pages/owner/CreateCourtPage'));

// General/Home pages
const VenueDetailPage = lazy(() => import('./pages/home/VenueDetailPage'));
const UserBooking = lazy(() => import('./pages/home/UserBooking'));
const BookingConfirmPage = lazy(() => import('./pages/home/BookingConfirmPage'));
const PaymentResultPage = lazy(() => import('./pages/home/PaymentResultPage'));
const MatchListPage = lazy(() => import('./pages/home/MatchListPage'));
const MatchDetailPage = lazy(() => import('./pages/home/MatchDetailPage'));
const MapPage = lazy(() => import('./pages/home/MapPage'));
const ExplorePage = lazy(() => import('./pages/home/ExplorePage'));
const NotificationsPage = lazy(() => import('./pages/home/NotificationsPage'));

// Team pages
const TeamListPage = lazy(() => import('./pages/teams/TeamListPage'));
const TeamDetailPage = lazy(() => import('./pages/teams/TeamDetailPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));

const tabRoutes = ['/', '/map', '/explore', '/matches', '/account', '/me'];

function AppRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(1);

  // Preload transition state for Owner <-> Default App switching
  const lastRolePathRef = useRef(location.pathname);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    const prevPath = lastRolePathRef.current;
    const currentPath = location.pathname;

    const wasOwner = prevPath.startsWith('/owner');
    const isOwner = currentPath.startsWith('/owner');

    if (wasOwner !== isOwner) {
      setIsPreloading(true);

      const timer = setTimeout(() => {
        setIsPreloading(false);
      }, 2450); // 2450ms to allow Preloader's internal 2s + 0.4s fadeout to complete

      lastRolePathRef.current = currentPath;
      return () => clearTimeout(timer);
    }

    lastRolePathRef.current = currentPath;
  }, [location.pathname]);

  if (location.pathname !== prevPathRef.current) {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    const prevIndex = tabRoutes.indexOf(prevPath);
    const nextIndex = tabRoutes.indexOf(currentPath);

    if (navigationType === 'POP') {
      // Browser back button or navigate(-1)
      directionRef.current = -1;
    } else if (prevIndex !== -1 && nextIndex !== -1) {
      // Transitioning between main tabs: order-based slide
      directionRef.current = nextIndex > prevIndex ? 1 : -1;
    } else if (prevIndex === -1 && nextIndex !== -1) {
      // Transitioning from a subpage back to a main tab
      directionRef.current = -1;
    } else if (prevIndex !== -1 && nextIndex === -1) {
      // Transitioning from a main tab to a subpage
      directionRef.current = 1;
    } else {
      // Transitioning between two subpages: compare path depth/length or default
      directionRef.current = currentPath.length < prevPath.length ? -1 : 1;
    }
    prevPathRef.current = currentPath;
  }

  const direction = directionRef.current;

  // Helper bọc Suspense cho các component nạp lazy
  const withSuspense = (Component: any) => (
    <Suspense fallback={<LoadingOverlay isLoading={true} text="Đang tải trang..." />}>
      <Component />
    </Suspense>
  );

  // Hàm bọc các component với PageTransition và Suspense để chuyển cảnh mượt mà
  const withTransition = (Component: any) => (
    <PageTransition direction={direction}>
      <Suspense fallback={<LoadingOverlay isLoading={true} text="Đang tải trang..." />}>
        <Component />
      </Suspense>
    </PageTransition>
  );

  // Only show bottom nav on 5 main routes (plus /account as unauthenticated profile root)
  const showBottomNav = ['/', '/map', '/explore', '/matches', '/me', '/account'].includes(location.pathname);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={withTransition(HomePage)} />
          <Route path="/map" element={withTransition(MapPage)} />
          <Route path="/explore" element={withTransition(ExplorePage)} />
          <Route path="/venue/:id" element={withTransition(VenueDetailPage)} />
          <Route path="/UserBooking" element={withTransition(UserBooking)} />
          <Route path="/UserBooking/confirm" element={withTransition(BookingConfirmPage)} />
          <Route path="/payment-result" element={withTransition(PaymentResultPage)} />
          <Route path="/matches" element={withTransition(MatchListPage)} />
          <Route path="/matches/:id" element={withTransition(MatchDetailPage)} />
          <Route path="/register" element={withTransition(RegisterPage)} />
          <Route path="/login" element={withTransition(LoginPage)} />
          <Route path="/forgot-password" element={withTransition(ForgotPasswordPage)} />
          <Route path="/account" element={withTransition(AccountPage)} />

          <Route path="/reservedBooking" element={withTransition(MyBookingsPage)} />
          <Route path="/teams" element={withTransition(TeamListPage)} />
          <Route path="/teams/:id" element={withTransition(TeamDetailPage)} />

          {/* User Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route path="/me" element={withTransition(MePage)} />
            <Route path="/UserProfile" element={withTransition(UserProfile)} />
            <Route path="/member" element={withTransition(MemberPage)} />
            <Route path="/notifications" element={withTransition(NotificationsPage)} />
            <Route path="/settings" element={withTransition(SettingsPage)} />
            <Route path="/settings/change-password" element={withTransition(ChangePasswordPage)} />
            <Route path="/owner/onboarding" element={withTransition(OwnerOnboardingFlow)} />
          </Route>

          {/* Owner Only Routes */}
          <Route element={<OwnerGuard />}>
            <Route path="/owner" element={withSuspense(OwnerDashboardPage)} />
            <Route path="/owner/bookings" element={withSuspense(OwnerBookingsPage)} />
            <Route path="/owner/BookingServices" element={withSuspense(OwnerBookingServicesPage)} />
            <Route path="/owner/venues" element={withSuspense(OwnerVenuesPage)} />
            <Route path="/owner/venues/:id" element={withSuspense(OwnerVenueDetailPage)} />
            <Route path="/owner/venues/:id/edit" element={withSuspense(VenuePricePage)} />
            <Route path="/owner/venues/:id/services" element={withSuspense(VenueListCourt)} />
            <Route path="/owner/venues/:id/courts" element={withSuspense(CreateCourtPage)} />
            <Route path="/owner/pos" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/inventory" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/services" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/analytics" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/customers" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/vouchers" element={withSuspense(OwnerSubFeaturePage)} />
            <Route path="/owner/monthly-bookings" element={withSuspense(OwnerSubFeaturePage)} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={withSuspense(NotFoundPage)} />
        </Routes>
      </AnimatePresence>
      {showBottomNav && <BottomNavigation />}
      <GlobalNotification />
      {isPreloading && <Preloader />}
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
