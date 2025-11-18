// UserContext.tsx
import baseURL from "@/lib/api/axios";
import { useMutation, UseMutationResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { Session } from "next-auth";
// import { useSession } from "next-auth/react";
import React, { useContext, createContext, ReactNode, useMemo } from "react";

interface UserContextType {
  googleAuth: UseMutationResult<void, Error, {role:string,company:string}, unknown>;
};

interface IUser {
  _id?: string;
  username?: string;
  email?: string;
}

interface IUserContext {
  user: IUser | null;
  loading: boolean;
}

  //* PROFILE :

export const getUser = ()=>{
  const user = useQuery(
    {
      queryKey:["user"],
      queryFn:async()=>{
        const res = await axios.get('/api/profile');
        return res?.data;
      }
    }
  )
  return {user};
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  //* GOOGLE AUTH :

  const googleAuth = useMutation({
    mutationFn: async ({role,company}:{role:string,company:string}) => {
      const data = {role,company};
      console.log(data)
      const res = router.push(`${baseURL.defaults.baseURL}/auth/google?role=${role}&company=${company}`);
      console.log(res)
    },
  });
 

    //* SIGNUP USER :

    const signUpUser = useMutation({
        mutationFn: async (data:void) => {
            console.log(data)
            // your signup logic here
            const res = await axios.post('/api/auth/register',data)
            return res.data;
        },
    });

    //* VRIFY OTP :

    const verifyOtp = useMutation(
        {
            mutationFn:async(data:{username:string,code:string})=>{
             const res = await axios.post('/api/auth/verify-code',data)
             return res.data;
            }
        }
    )

    //* Memoize the context value to prevent unnecessary re-renders

      // const contextValue = useMemo<IUserContext>(() => ({
      //   user: session?.user ?? null,
      //   loading: status === 'loading',
      // }), [session?.user, status]);


    return (
        <UserContext.Provider value={{ googleAuth}}>
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