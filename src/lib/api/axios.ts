import axios from "axios";

// Prefer environment variable `NEXT_PUBLIC_NEST_URL` when available,
// otherwise fall back to the local development backend.
const API_BASE_URL = process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:3000/api/v1";

const baseURL = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Flag to prevent multiple simultaneous refresh requests
// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (value?: any) => void;
//   reject: (error?: any) => void;
// }> = [];

// const processQueue = (error: AxiosError | null, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // Request interceptor - Add access token to requests if available
// baseURL.interceptors.request.use(
//   (config) => {
//     // Access token is sent via cookies (httpOnly), so no need to manually add it
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle token refresh on 401 errors
// baseURL.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     // If error is not 401, or request was already retried, reject immediately
//     if (error.response?.status !== 401 || originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     // If we're already refreshing, queue this request
//     if (isRefreshing) {
//       return new Promise((resolve, reject) => {
//         failedQueue.push({ resolve, reject });
//       })
//         .then(() => {
//           // Retry the original request (cookies are automatically sent)
//           return baseURL(originalRequest);
//         })
//         .catch((err) => {
//           return Promise.reject(err);
//         });
//     }

//     // Mark that we're refreshing and this request should be retried
//     originalRequest._retry = true;
//     isRefreshing = true;

//     try {
//       // Call refresh token endpoint
//       // The refresh token should be in cookies (httpOnly) set by backend
//       // Backend will set new access token cookie automatically
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_NEST_URL! || "http://localhost:3000/api/v1"}/auth/refresh`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       // If refresh is successful, process queued requests
//       // Backend may return token in response or set it in cookie
//       const newAccessToken = response.data?.accessToken || response.data?.token;
      
//       if (newAccessToken) {
//         processQueue(null, newAccessToken);
//       } else {
//         // If no token in response, backend set it in cookie - process queue anyway
//         processQueue(null, null);
//       }

//       // Retry the original request
//       // If token is available, add to header; otherwise rely on cookies
//       if (newAccessToken && originalRequest.headers) {
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//       }

//       isRefreshing = false;
//       return baseURL(originalRequest);
//     } catch (refreshError) {
//       // Refresh failed - logout user and redirect to login
//       isRefreshing = false;
//       processQueue(refreshError as AxiosError, null);

//       // Clear any stored tokens/cookies on client side
//       if (typeof window !== "undefined") {
//         // Clear cookies
//         document.cookie.split(";").forEach((c) => {
//           document.cookie = c
//             .replace(/^ +/, "")
//             .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
//         });

//         // Redirect to login
//         window.location.href = "/login";
//       }

//       return Promise.reject(refreshError);
//     }
//   }
// );

export default baseURL;