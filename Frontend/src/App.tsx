import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import MePage from './pages/MePage';
import SettingsPage from './pages/SettingsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccountPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
