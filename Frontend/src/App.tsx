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
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOwnerRequestsPage from './pages/admin/AdminOwnerRequestsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/venue/:id" element={<VenueDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/me/bookings" element={<MyBookingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/change-password" element={<ChangePasswordPage />} />
        <Route path="/owner/onboarding" element={<OwnerOnboardingFlow />} />
        <Route path="/owner" element={<OwnerDashboardPage />} />
        <Route path="/owner/venues" element={<OwnerVenuesPage />} />
        <Route path="/owner/venues/:id" element={<VenueConfigPage />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/owner-requests" element={<AdminOwnerRequestsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
