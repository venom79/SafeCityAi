import { createContext, useContext, useEffect, useState } from "react"
import api from "@/lib/axios"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem("refreshToken")
      const role = localStorage.getItem("role")
      const userId = localStorage.getItem("userId")
      const telegram_chat_id = localStorage.getItem("telegram_chat_id")

      if (!refreshToken) {
        setLoading(false)
        return
      }

      try {
        const res = await api.post("/auth/refresh", {
          refreshToken,
        })

        const newAccessToken = res.data.accessToken

        localStorage.setItem("token", newAccessToken)

        if (role && userId) {
          setUser({
            id: userId,
            role,
            telegram_chat_id,
          })
        }

      } catch (err) {
        localStorage.clear()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem("token", accessToken)
    localStorage.setItem("refreshToken", refreshToken)

    localStorage.setItem("role", userData.role)
    localStorage.setItem("userId", userData.id)
    localStorage.setItem("telegram_chat_id", userData.telegram_chat_id)

    setUser(userData)
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken })
      }
    } catch (err) {
      console.error(err)
    }

    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
    