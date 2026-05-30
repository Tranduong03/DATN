import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/venue/:id" element={<VenueDetailPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        <Route path="/matches" element={<MatchListPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* User Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/me" element={<MePage />} />
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
    </BrowserRouter>
  );
}

export default App;
