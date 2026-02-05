/**
 * Hook for managing authentication headers
 * Provides utilities to get and validate auth tokens
 */

export function useAuthHeaders() {
  const getAuthHeaders = (): { Authorization?: string } | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('[useAuthHeaders] No accessToken in localStorage');
      return null;
    }

    console.log('[useAuthHeaders] Token found, length:', token.length);

    // Validate that it's a Bearer token format (JWT)
    if (!token.includes('.')) {
      console.error('[useAuthHeaders] Invalid token format - not a JWT');
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  return {
    getAuthHeaders,
  };
}
