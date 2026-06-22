import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Singleton promise to hold the ongoing refresh token request
let refreshPromise: Promise<string | null> | null = null;

/**
 * Performs the token refresh request. If multiple parts of the application
 * request a refresh concurrently, they will share the same promise and HTTP request.
 * 
 * @returns {Promise<string | null>} The new access token, or null if refresh failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!token || !refreshToken) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }

  refreshPromise = (async () => {
    try {
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
      throw new Error('Response body does not contain valid access or refresh tokens.');
    } catch (err) {
      console.error('Failed to automatically refresh expired token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Ensures the stored JWT token is valid and not expired.
 * If the token is expired or about to expire within 30 seconds, 
 * it automatically attempts to refresh it using the refresh token.
 * 
 * @returns {Promise<string | null>} The valid token, or null if unauthorized/refresh failed.
 */
export async function ensureValidToken(): Promise<string | null> {
  const token = localStorage.getItem('token');
  
  if (!token) return null;
  
  try {
    const decoded: any = jwtDecode(token);
    const expTime = decoded.exp * 1000;
    
    // If token is still valid for more than 30 seconds, return it
    if (expTime - Date.now() > 30000) {
      return token;
    }
    
    // If token is expired/close to expiry, refresh it
    return await refreshAccessToken();
  } catch (err) {
    console.error('Failed to decode token or check validity:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
}

