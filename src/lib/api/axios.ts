
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:3000/api/v1";

const baseURL = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================
    REQUEST INTERCEPTOR
====================== */
baseURL.interceptors.request.use(
  (config) => {
    // ✅ ALWAYS try to add Authorization header from localStorage
    // The backend can accept requests with or without the token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('[axios] Adding Authorization header from localStorage');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('[axios] No token in localStorage, relying on cookies for auth');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================
    REFRESH QUEUE LOGIC
====================== */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(true);
  });
  failedQueue = [];
};

/* ======================
    RESPONSE INTERCEPTOR
====================== */
baseURL.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 🛑 STOP INFINITE LOOP:
    // Agar error '/auth/refresh' endpoint se hi aa raha hai,
    // toh mazeed refresh mat karo, seedha login par bhej do.
    if (originalRequest.url?.includes('/auth/refresh')) {
      isRefreshing = false;
      console.error("Refresh token itself failed or expired. Redirecting to login...");
      if (typeof window !== "undefined") {
        // Don't redirect if already on login page (prevents infinite loop)
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    /* 1️⃣ 401 Unauthorized caught */
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      /* 2️⃣ If already refreshing, wait in queue */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => baseURL(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      /* 3️⃣ Perform Refresh call using standard axios (not 'api' instance) */
      console.log("🔄 Attempting to refresh token...");

      try {
        const refreshResponse = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        
        // ✅ NEW: Extract tokens from refresh response and store in localStorage
        // Backend sets tokens in response body for cross-domain scenarios
        if (refreshResponse.data?.data) {
          const responseData = refreshResponse.data.data;
          if (responseData.accessToken) {
            console.log('[axios] Storing refreshed accessToken in localStorage');
            localStorage.setItem('accessToken', responseData.accessToken);
          }
          if (responseData.refreshToken) {
            console.log('[axios] Storing refreshed refreshToken in localStorage');
            localStorage.setItem('refreshToken', responseData.refreshToken);
          }
        }

        processQueue(null);

        /* 4️⃣ Retry the original failed request */
        return baseURL(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError as AxiosError);

        /* 5️⃣ If everything fails, cleanup and redirect */
        console.log("❌ Refresh failed, clearing session...");

        if (typeof window !== "undefined") {
          // Note: Cookies delete karna backend ki zimmedari hai,
          // magar frontend par redirect lazmi hai.
          // Don't redirect if already on login page (prevents infinite loop)
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default baseURL;