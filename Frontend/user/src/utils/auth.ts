import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

/**
 * Ensures the stored JWT token is valid and not expired.
 * If the token is expired or about to expire within 30 seconds, 
 * it automatically attempts to refresh it using the refresh token.
 * 
 * @returns {Promise<string | null>} The valid token, or null if unauthorized/refresh failed.
 */
export async function ensureValidToken(): Promise<string | null> {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    const expTime = decoded.exp * 1000;
    
    // If token is still valid for more than 30 seconds, return it
    if (expTime - Date.now() > 30000) {
      return token;
    }
    
    // If token is expired/close to expiry but we have a refreshToken, refresh it
    if (refreshToken) {
      const res = await axios.post('/api/auth/refresh', {
        accessToken: token,
        refreshToken: refreshToken,
      });
      const newAccessToken = res.data.token || res.data.Token;
      const newRefreshToken = res.data.refreshToken || res.data.RefreshToken;
      
      if (newAccessToken && newRefreshToken) {
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return newAccessToken;
      }
    }
  } catch (err) {
    console.error('Failed to automatically refresh expired token:', err);
  }
  
  // If refresh failed or was not possible, clear storage to ensure consistent state
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return null;
}
