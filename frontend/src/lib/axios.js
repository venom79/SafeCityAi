import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080",
})

/* =========================
   ATTACH ACCESS TOKEN
========================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* =========================
   AUTO REFRESH ON 401
========================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")

        if (!refreshToken) {
          throw new Error("No refresh token")
        }

        const res = await axios.post(
          "http://localhost:8080/auth/refresh",
          { refreshToken }
        )

        const newAccessToken = res.data.accessToken

        localStorage.setItem("token", newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)

      } catch (err) {
        localStorage.clear()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api
