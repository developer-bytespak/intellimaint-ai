// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";



// export const API_BASE = process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:3000/api/v1";

// const baseURL = axios.create({
//   baseURL:process.env.NEXT_PUBLIC_NEST_URL || "http://localhost:3000/api/v1",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor - Log outgoing requests with cookies
// baseURL.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       console.log("[Axios Request]", {
//         url: config.url,
//         method: config.method,
//         baseURL: config.baseURL,
//         withCredentials: config.withCredentials,
//         cookies: document.cookie || "No cookies found",
//       });
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor - Handle 401 errors with automatic token refresh
// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (value?: any) => void;
//   reject: (error?: any) => void;
// }> = [];

// const processQueue = (
//   error: AxiosError | null,
//   token: string | null = null
// ) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// baseURL.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     console.log("[Axios Interceptor] Error caught:", {
//       status: error.response?.status,
//       url: originalRequest.url,
//       hasRetried: originalRequest._retry,
//       cookies: typeof window !== "undefined" ? document.cookie : "N/A",
//     });

//     // If error is not 401, or request was already retried, reject immediately
//     if (error.response?.status !== 401 || originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     // If we're already refreshing, queue this request
//     if (isRefreshing) {
//       console.log("[Axios Interceptor] Request queued - refresh in progress");
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

//     console.log("[Axios Interceptor] Attempting token refresh...");

//     try {
//       // Call refresh token endpoint - cookies are sent automatically with withCredentials
//       const response = await axios.post(
//         `${API_BASE}/auth/refresh`,
//         {},
//         {
//           withCredentials: true,
//         }
//       );

//       console.log("[Axios Interceptor] Token refresh successful");

//       // If refresh is successful, process queued requests
//       // Backend sets new access token in cookie automatically
//       processQueue(null, null);

//       isRefreshing = false;
//       // Retry the original request (cookies are automatically sent)
//       return baseURL(originalRequest);
//     } catch (refreshError) {
//       // Refresh failed - logout user and redirect to login
//       console.error("[Axios Interceptor] Token refresh failed:", refreshError);
//       isRefreshing = false;
//       processQueue(refreshError as AxiosError, null);

//       // Clear any stored tokens/cookies on client side
//       if (typeof window !== "undefined") {
//         console.log(
//           "[Axios Interceptor] Clearing cookies and redirecting to login"
//         );

//         // Clear frontend auth cookies (not all cookies, to avoid breaking other functionality)
//         document.cookie = "local_accessToken=; Path=/; Max-Age=0";
//         document.cookie = "google_accessToken=; Path=/; Max-Age=0";

//         // Redirect to login after a brief delay to allow cookie clearing
//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 100);
//       }

//       return Promise.reject(refreshError);
//     }
//   }
// );

// export default baseURL;
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
    console.log("➡️ API Request:", config.url);
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
    console.log("✅ API Success:", response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    /* 1️⃣ 401 caught */
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("⚠️ 401 Unauthorized:", originalRequest.url);

      /* 2️⃣ Already refreshing → queue */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => baseURL(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      /* 3️⃣ Refresh call */
      console.log("🔄 Refresh token call");

      try {
        await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(null);

        /* 4️⃣ Retry original request */
        return baseURL(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError as AxiosError);

        /* 5️⃣ Refresh failed → logout */
        console.log("❌ Refresh failed → Logout");

        if (typeof window !== "undefined") {
          document.cookie = "local_accessToken=; Path=/; Max-Age=0";
          document.cookie = "google_accessToken=; Path=/; Max-Age=0";
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default baseURL;
