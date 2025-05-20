import axios from "axios";
import authStore from "../store/authStore";
import { notification } from "antd";

// Create axios instance
const apiClient = axios.create({
  baseURL: "/api",
});

// Add a response interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 error, clear auth data and redirect to login
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized error - redirecting to login");

      // Clear authentication data
      authStore.logout();

      // Show notification
      notification.error({
        message: "Сессия завершена",
        description: "Необходимо выполнить вход заново",
        duration: 4,
      });

      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000); // Small delay to allow the notification to show
    }

    // Propagate the error
    return Promise.reject(error);
  }
);

export default apiClient;
