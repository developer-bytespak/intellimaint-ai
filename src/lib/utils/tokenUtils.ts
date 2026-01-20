/**
 * Token Utility Functions
 * Handles JWT token operations: decode, validate, check expiry, storage
 */

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Decode JWT token without verification (for client-side usage)
 * WARNING: Don't trust the token content for security decisions
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[tokenUtils] Invalid token format');
      return null;
    }

    // Decode the payload (second part)
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return decoded;
  } catch (error) {
    console.error('[tokenUtils] Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * Returns true if expired, false if still valid
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    console.log('[tokenUtils] No token provided');
    return true;
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    console.warn('[tokenUtils] Cannot decode token or missing exp claim');
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < now;

  if (isExpired) {
    console.log('[tokenUtils] Token is expired', {
      exp: new Date(decoded.exp * 1000),
      now: new Date(now * 1000),
    });
  }

  return isExpired;
}

/**
 * Get time until token expiry in seconds
 * Returns negative number if already expired
 */
export function getTokenExpiryTime(token: string | null): number {
  if (!token) return -1;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return -1;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
}

/**
 * Check if token should be refreshed (expires in less than 5 minutes)
 */
export function shouldRefreshToken(token: string | null): boolean {
  const timeLeft = getTokenExpiryTime(token);
  const shouldRefresh = timeLeft > 0 && timeLeft < 300; // Less than 5 minutes left

  if (shouldRefresh) {
    console.log('[tokenUtils] Token expiring soon, should refresh', {
      timeLeftMinutes: (timeLeft / 60).toFixed(1),
    });
  }

  return shouldRefresh;
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(
  accessToken: string,
  refreshToken: string
): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('[tokenUtils] Tokens stored in localStorage');
  } catch (error) {
    console.error('[tokenUtils] Failed to store tokens:', error);
  }
}

/**
 * Retrieve tokens from localStorage
 */
export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  try {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  } catch (error) {
    console.error('[tokenUtils] Failed to retrieve tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('[tokenUtils] Tokens cleared from localStorage');
  } catch (error) {
    console.error('[tokenUtils] Failed to clear tokens:', error);
  }
}

/**
 * Get user ID from access token
 */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.userId || null;
}
