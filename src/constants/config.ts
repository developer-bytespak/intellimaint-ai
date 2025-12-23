export const CONFIG = {
  APP_NAME: 'Military AI App',
  API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  // Socket.IO Gateway URL - uses NEST_URL base or falls back to API_URL for production
  GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || 
               (process.env.NEXT_PUBLIC_NEST_URL?.replace('/api/v1', '') || process.env.NEXT_PUBLIC_API_URL || ''),
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};


