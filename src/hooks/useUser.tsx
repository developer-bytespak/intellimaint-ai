// UserContext.tsx
import baseURL from "@/lib/api/axios";
import { useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
// import { Session } from "next-auth";
// import { useSession } from "next-auth/react";
import React, { useContext, createContext, ReactNode } from "react";
import { RegisterFormData } from "@/lib/validations/register";

export interface IUser {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  accountType?: string;
  profileImage?: string;
  isVerified?: boolean;
}

interface UserContextType {
  googleAuth: UseMutationResult<void, Error, {role:string,company:string}, unknown>;
  user: IUser | null | undefined;
  isLoading: boolean;
  updateUser: UseMutationResult<IUser, Error, Partial<IUser>, unknown>;
  signUpUser: UseMutationResult<unknown, Error, RegisterFormData, unknown>;
  verifyOtp: UseMutationResult<unknown, Error, {email:string,otp:string}, unknown>;
  resendOtp: UseMutationResult<unknown, Error, {email:string}, unknown>;
  loginUser: UseMutationResult<unknown, Error, {email:string,password:string}, unknown>;
  forgotPassword: UseMutationResult<unknown, Error, {email:string}, unknown>;
  resetPassword: UseMutationResult<unknown, Error, {email:string,otp:string,newPassword:string}, unknown>;
}



const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  //* GOOGLE AUTH :

  const googleAuth = useMutation({
    mutationFn: async ({role,company}:{role:string,company:string}) => {
      const data = {role,company};
      console.log(data)
      const res = router.push(`${baseURL.defaults.baseURL}/auth/google?role=${role}&company=${company}`);
      console.log(res)
    },
  });

  //* GET USER PROFILE :

  const { data: user, isLoading } = useQuery<IUser>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await baseURL.get('/profile');
      return res?.data;
    },
  });

  //* UPDATE USER PROFILE :

  const updateUser = useMutation({
    mutationFn: async (data: Partial<IUser>) => {
      const res = await baseURL.put('/profile', data);
      return res?.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
 
    //* SIGNUP USER :

    const signUpUser = useMutation({
        mutationFn: async (data: RegisterFormData) => {
            console.log(data)
            // your signup logic here
            const res = await baseURL.post('/auth/register', data)
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
          console.log(data)
            const res = await baseURL.post('/auth/login', data);
            return res.data;
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



    //* Memoize the context value to prevent unnecessary re-renders

      // const contextValue = useMemo<IUserContext>(() => ({
      //   user: session?.user ?? null,
      //   loading: status === 'loading',
      // }), [session?.user, status]);


    return (
        <UserContext.Provider value={{ googleAuth, user, isLoading, updateUser, signUpUser, verifyOtp,resendOtp,loginUser, forgotPassword, resetPassword }}>
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