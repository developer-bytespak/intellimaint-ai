export const CONFIG = {
  APP_NAME: 'Military AI App',
  // NEXT_PUBLIC_NEST_URL points to NestJS Gateway (Render)
  // Used for both Socket.IO and REST API (add /api/v1 in code for REST)
  API_URL: process.env.NEXT_PUBLIC_NEST_URL || 'http://localhost:3000',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};


