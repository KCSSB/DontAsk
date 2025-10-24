import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Ошибка сети. Перенаправление на лендинг...");
      window.location.href = "/";
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/register");

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        const response = await axios.post(
          "http://localhost:8080/api/Auth/RefreshAccessToken",
          {},
          { withCredentials: true }
        );
        const newAccessToken = response.data.accessToken;

        localStorage.setItem("token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Failed to refresh token, redirecting to login:",
          refreshError
        );
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
