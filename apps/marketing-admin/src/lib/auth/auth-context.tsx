'use client'

import { createContext, ReactNode, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.default.get('authToken')
      if (token) {
        // In production, you'd validate the token with the backend
        try {
          // Decode token to get user info (basic implementation)
          const userData = JSON.parse(atob(token.split('.')[1]))
          if (userData) {
            setUser({
              id: userData.sub || userData.id,
              email: userData.email,
              role: userData.role || 'ADMIN',
            })
          }
        } catch (error) {
          // Token is invalid, clear it
          Cookies.default.remove('authToken')
          // Auto-login with demo user for development
          setUser({
            id: 'demo-user-123',
            email: 'demo@dryjets.com',
            role: 'ADMIN',
          })
        }
      } else {
        // Auto-login with demo user for development (no auth required)
        setUser({
          id: 'demo-user-123',
          email: 'demo@dryjets.com',
          role: 'ADMIN',
        })
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      const { access_token, user: userData } = data

      // Store token
      Cookies.default.set('authToken', access_token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      setUser(userData)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(() => {
    Cookies.default.remove('authToken')
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
