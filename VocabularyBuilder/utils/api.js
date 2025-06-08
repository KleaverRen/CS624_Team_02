// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Retrieve API_BASE_URL from the .env file
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api"; // Fallback to localhost if not defined
// const API_BASE_URL = Config.API_BASE_URL || "http://10.0.0.31:3000/api"; // Fallback to localhost if not defined
if (!API_BASE_URL) {
  console.error(
    "API_BASE_URL is not defined in your .env file or hasn't been loaded correctly."
  );
  // You might want to throw an error or set a fallback here
} else {
  console.log("Using API Base URL:", API_BASE_URL);
}
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Add JWT token to headers before each request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration or unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid. You might want to:
      // 1. Clear the token from storage
      // 2. Navigate the user back to the login screen
      console.warn("Unauthorized or token expired. Please log in again.");
      await AsyncStorage.removeItem("userToken");
      // You would typically use a navigation utility here to redirect to login
      // e.g., NavigationService.navigate('Login');
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints (no token needed for these) ---
export const authLogin = (identifier, password) =>
  axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });

export const authSignup = (username, email, password, firstName, lastName) =>
  axios.post(`${API_BASE_URL}/auth/signup`, {
    username,
    email,
    password,
    firstName,
    lastName,
  });
export const authLogout = () => api.post("/auth/logout");
// --- User Profile Endpoints ---
export const getUserProfile = () => api.get("/user/profile");
export const updateUserProfile = (profileData) => {
  // profileData should be an object like { email: 'new@example.com', firstName: 'New', lastName: 'Name' }
  // You send the entire object as the body of the PATCH request.
  return api.patch("/user/profile", profileData);
};
/**
 * API call to change the user's password.
 * @param {object} data - Object containing currentPassword and newPassword.
 * @param {string} data.currentPassword - The user's current password.
 * @param {string} data.newPassword - The user's new password.
 * @returns {Promise<AxiosResponse>} A promise that resolves to the API response.
 */
export const changePasswordApi = ({ currentPassword, newPassword }) => {
  // Assuming your backend expects a POST request to '/user/change-password'
  // with currentPassword and newPassword in the request body.
  return api.post("/user/change-password", {
    currentPassword,
    newPassword,
  });
};

// --- Vocabulary Endpoints ---
export const getVocabulary = () => api.get("/words");
export const addVocabularyWord = (word, definition) =>
  api.post("/words", { word, definition });
export const deleteVocabularyWord = (wordId) => api.delete(`/words/${wordId}`);
export const updateVocabularyWord = (wordId, word, definition) =>
  api.put(`/words/${wordId}`, { word, definition });

// --- Quiz Endpoints ---
export const getQuiz = (count) =>
  api.get(`/quiz${count ? `?count=${count}` : ""}`);
export const submitQuiz = (quizId, answers) =>
  api.post("/quiz/submit", { quizId, answers });
export const getQuizById = (quizId) => api.get(`/quiz/${quizId}`);

// --- Progress Endpoints ---
export const recordQuizResult = (score, totalQuestions) =>
  api.post("/progress/quiz-results", { score, totalQuestions });
export const getQuizResults = () => api.get("/progress/quiz-results");
export const getQuizResultById = (id) =>
  api.get(`/progress/quiz-results/${id}`);
export const getOverallProgress = () => api.get("/progress");
export const getIncorrectAnswers = () => api.get("/incorrect-answers");
export const getIncorrectAnswersByQuiz = (quizId) =>
  api.get(`/quiz/${quizId}/incorrect-answers`);
