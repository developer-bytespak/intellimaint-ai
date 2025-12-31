// UserContext.tsx
import baseURL, { API_BASE } from "@/lib/api/axios";
import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
// import { Session } from "next-auth";
// import { useSession } from "next-auth/react";
import React, { useContext, createContext, ReactNode } from "react";
import { RegisterFormData } from "@/lib/validations/register";

export interface IUser {
  id?: string;
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  accountType?: string;
  role?: string;
  profileImage?: string;
  profileImageUrl?: string;
  company?: string;
  emailVerified?: boolean;
  isVerified?: boolean;
  hasPassword?: boolean; // true for regular accounts, false for OAuth accounts
  userSettings?: {
    emailNotifications: boolean;
    theme: string;
  };
}

interface UserContextType {
  googleAuth: UseMutationResult<void, Error, {role:string,company:string}, unknown>;
  user: IUser | null | undefined;
  isLoading: boolean;
  updateUser: UseMutationResult<IUser, Error, Partial<IUser>, unknown>;
  changePassword: UseMutationResult<unknown, Error, {currentPassword:string,newPassword:string}, unknown>;
  deleteAccount: UseMutationResult<unknown, Error, {password?:string, otp?:string}, unknown>;
  sendDeleteAccountOtp: UseMutationResult<unknown, Error, void, unknown>;
  getSettings: UseQueryResult<{emailNotifications: boolean; theme: string}, Error>;
  updateSettings: UseMutationResult<unknown, Error, {emailNotifications?:boolean,theme?:string}, unknown>;
  signUpUser: UseMutationResult<unknown, Error, RegisterFormData, unknown>;
  verifyOtp: UseMutationResult<unknown, Error, {email:string,otp:string}, unknown>;
  resendOtp: UseMutationResult<unknown, Error, {email:string}, unknown>;
  loginUser: UseMutationResult<unknown, Error, {email:string,password:string}, unknown>;
  forgotPassword: UseMutationResult<unknown, Error, {email:string}, unknown>;
  resetPassword: UseMutationResult<unknown, Error, {email:string,otp:string,newPassword:string}, unknown>;
  uploadProfileImage: UseMutationResult<{url: string, pathname: string}, Error, File, unknown>;
  deleteProfileImage: UseMutationResult<{success: boolean, message: string}, Error, string, unknown>;
  logout: UseMutationResult<unknown, Error, void, unknown>;
}



const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Track if login just happened (to trigger user profile fetch)
  const [loginJustHappened, setLoginJustHappened] = React.useState(false);

  // Public routes where we shouldn't try to fetch user profile
  const publicRoutes = ['/login', '/signup', '/reset-password', '/verify', '/callback', '/form', '/representative'];
  const isPublicRoute = pathname ? (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) : true;

  //* GOOGLE AUTH :

  const googleAuth = useMutation({
    mutationFn: async ({role,company}:{role:string,company:string}) => {
      const data = {role,company};
      console.log(data)
      const res = router.push(`${API_BASE}/auth/google?role=${role}&company=${company}`);
      console.log(res)
    },
  });

  //* GET USER PROFILE :

  const { data: userData, isLoading, error: userError } = useQuery<IUser>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        console.log('[useUser] Fetching user profile...');
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        console.log('[useUser] Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
        
        const res = await baseURL.get('/user/profile');
        console.log('[useUser] User profile response:', res);
        
        // Backend returns { statusCode, message, data }
        const user = res?.data?.data || res?.data;
        console.log('[useUser] Extracted user:', user);
        return user;
      } catch (error: unknown) {
        // If 401, user is not authenticated - this is expected on login/signup pages
        // Don't log it as an error, just return null
        const axiosError = error as { response?: { status?: number; data?: any } }
        console.error('[useUser] Error fetching user profile:', {
          status: axiosError?.response?.status,
          data: axiosError?.response?.data,
          message: (error as any)?.message
        });
        
        if (axiosError?.response?.status === 401) {
          console.warn('[useUser] User not authenticated (401), returning null');
          return null;
        }
        // Only log non-401 errors
        throw error;
      }
    },
    // ✅ IMPORTANT: Only fetch user profile if:
    // 1. We have a pathname (component is mounted)
    // 2. We're not on a public route (skip fetch on login/signup/etc.)
    enabled: !!pathname && !isPublicRoute,
    retry: 1,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  console.log('[useUser] userData:', userData, 'isLoading:', isLoading, 'userError:', userError);

  // Map backend response to frontend format
  const user: IUser | null | undefined = userData ? {
    ...userData,
    id: userData.id,
    name: userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData.firstName || userData.lastName || undefined,
    accountType: userData.role,
    profileImage: userData.profileImageUrl,
    isVerified: userData.emailVerified,
  } : null;

  //* UPDATE USER PROFILE :

  const updateUser = useMutation({
    mutationFn: async (data: Partial<IUser>) => {
      // Map frontend format to backend format
      const updateData: Record<string, string> = {};
      if (data.name) {
        const nameParts = data.name.trim().split(/\s+/);
        updateData.firstName = nameParts[0] || '';
        updateData.lastName = nameParts.slice(1).join(' ') || '';
      }
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.profileImage !== undefined) updateData.profileImageUrl = data.profileImage;
      if (data.profileImageUrl !== undefined) updateData.profileImageUrl = data.profileImageUrl;
      if (data.company !== undefined) updateData.company = data.company;
      
      // Check if there's any data to update
      if (Object.keys(updateData).length === 0) {
        console.warn('No data to update');
        throw new Error('No data provided to update');
      }
      
      console.log('Sending update request to /user/profile with data:', updateData);
      console.log('Base URL:', baseURL.defaults.baseURL);
      console.log('Full URL will be:', `${baseURL.defaults.baseURL}/user/profile`);
      
      try {
        const res = await baseURL.put('/user/profile', updateData);
        console.log('Update response status:', res.status);
        console.log('Update response data:', res.data);
        // Backend returns { statusCode, message, data }
        return res?.data?.data || res?.data;
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; data?: string[] } }; message?: string; config?: { url?: string } }
        console.error('Update user error:', error);
        console.error('Error status:', axiosError?.response?.status);
        console.error('Error data:', axiosError?.response?.data);
        console.error('Error message:', axiosError?.message);
        console.error('Request URL:', axiosError?.config?.url);
        const errorMessage = axiosError?.response?.data?.message || axiosError?.response?.data?.data?.[0] || axiosError?.message || 'Failed to update profile';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      console.log('Profile update successful, invalidating queries');
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  //* CHANGE PASSWORD :

  const changePassword = useMutation({
    mutationFn: async (data: {currentPassword: string, newPassword: string}) => {
      const res = await baseURL.put('/user/password', data);
      return res?.data;
    },
  });

  //* DELETE ACCOUNT :

  const deleteAccount = useMutation({
    mutationFn: async (data: {password?: string, otp?: string}) => {
      const res = await baseURL.delete('/user/account', { data });
      return res?.data;
    },
    onSuccess: () => {
      // Clear user data and redirect to login
      queryClient.clear();
      router.push('/login');
    },
  });

  //* SEND DELETE ACCOUNT OTP (for OAuth users):

  const sendDeleteAccountOtp = useMutation({
    mutationFn: async () => {
      const res = await baseURL.post('/user/account/delete-otp');
      return res?.data;
    },
  });

  //* GET SETTINGS :

  const getSettings = useQuery<{emailNotifications: boolean; theme: string}>({
    queryKey: ["settings"],
    queryFn: async () => {
      try {
        const res = await baseURL.get('/user/settings');
        // Backend returns { statusCode, message, data }
        return res?.data?.data || res?.data;
      } catch (error: unknown) {
        // If 401, user is not authenticated - this is expected on login/signup pages
        // Don't log it as an error, just return default settings
        const axiosError = error as { response?: { status?: number } }
        if (axiosError?.response?.status === 401) {
          return { emailNotifications: true, theme: 'light' };
        }
        // Only log non-401 errors
        console.error('Error fetching settings:', error);
        throw error;
      }
    },
    retry: 1,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!userData, // Only fetch settings if user is loaded
  });

  //* UPDATE SETTINGS :

  const updateSettings = useMutation({
    mutationFn: async (data: {emailNotifications?: boolean, theme?: string}) => {
      const res = await baseURL.put('/user/settings', data);
      return res?.data;
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
 
    //* SIGNUP USER :

    const signUpUser = useMutation({
        mutationFn: async (data: RegisterFormData) => {
            console.log(data)
            // signup logic
            const res = await baseURL.post('/auth/register', data);
            return res?.data;
        },
    });

    //* VERIFY OTP :

    const verifyOtp = useMutation({
        mutationFn: async (data: {email: string, otp: string}) => {
            const res = await baseURL.post('/auth/verify-otp', data);
            return res.data;
        },
    });

    //* RESEND OTP :

    const resendOtp = useMutation({
        mutationFn: async (data: {email: string}) => {
            const res = await baseURL.post('/auth/resend-otp', data);
            return res.data;
        },
    });

    //* LOGIN USER :

    const loginUser = useMutation({
        mutationFn: async (data: {email: string, password: string}) => {
          console.log('[useUser] Login attempt with email:', data.email)
            try {
              const res = await baseURL.post('/auth/login', data);
              console.log('[useUser] Login response received:', res.data);
              
              // Try to extract tokens from response body
              const accessToken = res.data?.data?.accessToken || res.data?.accessToken;
              const refreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;
              
              // Store tokens if provided in response
              if (accessToken) {
                console.log('[useUser] Storing accessToken in localStorage');
                localStorage.setItem('accessToken', accessToken);
              } else {
                console.warn('[useUser] No accessToken in response body. Backend is using cookies instead.');
                console.log('[useUser] Response structure:', JSON.stringify(res.data, null, 2));
                // ✅ Signal that login happened so we can fetch user profile using cookies
                setLoginJustHappened(true);
              }
              
              if (refreshToken) {
                console.log('[useUser] Storing refreshToken in localStorage');
                localStorage.setItem('refreshToken', refreshToken);
              }
              
              console.log('[useUser] Backend also set cookies - check Set-Cookie headers in network tab');
              return res.data;
            } catch (error) {
              console.error('[useUser] Login error:', error);
              if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as any;
                console.error('[useUser] Error response status:', axiosError.response?.status);
                console.error('[useUser] Error response data:', axiosError.response?.data);
              }
              throw error;
            }
        },
    });

    //* FORGOT PASSWORD :

    const forgotPassword = useMutation({
        mutationFn: async (data: {email: string}) => {
            const res = await baseURL.post('/auth/forgot-password', data);
            return res.data;
        },
    });

    //* RESET PASSWORD :

    const resetPassword = useMutation({
        mutationFn: async (data: {email: string, otp: string, newPassword: string}) => {
            const res = await baseURL.post('/auth/reset-password', data);
            return res.data;
        },
    });

    //* UPLOAD PROFILE IMAGE :

    const uploadProfileImage = useMutation({
        mutationFn: async (file: File) => {
            if (!userData?.id) {
                throw new Error('User ID not available');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userData.id);

            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to upload image');
            }

            const data = await res.json();
            return data;
        },
        onSuccess: async (data) => {
            // Update user profile with new image URL
            await updateUser.mutateAsync({ profileImageUrl: data.url });
        },
    });

    //* DELETE PROFILE IMAGE :

    const deleteProfileImage = useMutation({
        mutationFn: async (imageUrl: string) => {
            const res = await fetch(`/api/delete-image?url=${encodeURIComponent(imageUrl)}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete image');
            }

            const data = await res.json();
            return data;
        },
        onSuccess: async () => {
            // Remove image URL from user profile
            await updateUser.mutateAsync({ profileImageUrl: '' });
            // Invalidate user query to refresh the UI immediately
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });

    //* LOGOUT USER :
    // Call logout endpoint - backend will clear cookies and redirect to /login
    const logout =useMutation({
      mutationFn: async () => {
        const res = await baseURL.get('/auth/logout');
        return res?.data;
      },
      onSuccess: () => {
        // Clear stored tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Clear user data and redirect to login
        queryClient.clear();
        router.push('/login');
      }
    })

    //* Memoize the context value to prevent unnecessary re-renders

      // const contextValue = useMemo<IUserContext>(() => ({
      //   user: session?.user ?? null,
      //   loading: status === 'loading',
      // }), [session?.user, status]);


        return ( 
        <UserContext.Provider value={{ 
          googleAuth, 
          user, 
          isLoading, 
          updateUser, 
          changePassword,
          deleteAccount,
          sendDeleteAccountOtp,
          getSettings,
          updateSettings,
          signUpUser, 
          verifyOtp,
          resendOtp,
          loginUser, 
          forgotPassword, 
          resetPassword,
          uploadProfileImage,
          deleteProfileImage,
          logout,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};