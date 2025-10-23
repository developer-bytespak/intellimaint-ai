import { useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  password: string
  accountType: string
  profileImage: string
  isVerified: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: "1",
        name: "Leslie Moses",
        email: "lesliemoses874@gmail.com",
        password: "dre443****",
        accountType: "Student",
        profileImage: "/images/img1.png",
        isVerified: true,
      }
      
      setUser(mockUser)
    } catch (err) {
      setError("Failed to fetch user data")
      console.error("Error fetching user:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      setError(null)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (user) {
        setUser({ ...user, ...userData })
      }
    } catch (err) {
      setError("Failed to update user data")
      console.error("Error updating user:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    isLoading,
    error,
    updateUser,
    refetch: fetchUser,
  }
}


