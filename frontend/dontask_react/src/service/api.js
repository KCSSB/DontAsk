import apiService from "./apiService.js";

// Функция для принудительного обновления и установки токена
export const refreshAndSetToken = async () => {
  try {
    const response = await apiService.post("/Auth/RefreshAccessToken");
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("token", newAccessToken);
    console.log("RefreshAndSetToken success");
    return newAccessToken;
  } catch (error) {
    console.error("RefreshAndSetToken failed", error);
    throw new Error("Failed to refresh token. Please log in again.");
  }
};

// Функция для GET-запросов с токеном и обновления токена
export const fetchWithAuth = async (url) => {
  const response = await apiService.get(url);
  return response.data;
};

// Функция для POST-запросов с токеном и обновления токена
export const postWithAuth = async (url, data, config = {}) => {
  const response = await apiService.post(url, data, config);
  return response.data;
};

// Функция для PATCH-запросов (обновление конкретных данных)
export const patchWithAuth = async (url, data, config = {}) => {
  const response = await apiService.patch(url, data, config);
  return response.data;
};

// Функция для DELETE-запросов
export const deleteWithAuth = async (url, data, config = {}) => {
  const response = await apiService.delete(url, { ...config, data });
  return response.data;
};

// Функция для выхода из аккаунта
export const logout = async () => {
  try {
    await apiService.delete("/Auth/Logout");
    console.log("Успешный выход из аккаунта на сервере.");
  } catch (error) {
    console.error("Ошибка при выходе из системы:", error);
  } finally {
    localStorage.removeItem("token");
  }
};

// Функция для декодирования аватара из токена
export const getAvatarFromToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
};

// Функция для декодирования userID из токена
export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = getAvatarFromToken(token);
      const userIdClaim =
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
      return decoded ? decoded[userIdClaim] : null;
    } catch (e) {
      console.error("Failed to get user ID from token", e);
      return null;
    }
  }
  return null;
};

// Функция для декодирования имени из токена
export const getFirstNameFromToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = getAvatarFromToken(token);
      return decoded ? decoded.FirstName : null;
    } catch (e) {
      console.error("Failed to get first name from token", e);
      return null;
    }
  }
  return null;
};

// Функция для кропа изображения до квадрата
export const autoCropImageToSquare = (imageFile, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let side = Math.min(img.width, img.height);
      let dx = 0,
        dy = 0;

      if (img.width > img.height) {
        dx = (img.width - img.height) / 2;
      } else if (img.height > img.width) {
        dy = (img.height - img.width) / 2;
      }

      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, dx, dy, side, side, 0, 0, side, side);

      canvas.toBlob(
        (blob) => {
          callback(blob);
        },
        "image/jpeg",
        0.9
      );
    };
  };
};
