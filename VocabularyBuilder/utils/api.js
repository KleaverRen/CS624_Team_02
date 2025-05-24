// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:3000/api"; // IMPORTANT: Replace with your backend URL in development and production!

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
export const authLogout = () => api.post("/auth/logout"); // New logout API call
// --- User Profile Endpoints ---
export const getUserProfile = () => api.get("/user/profile"); // <-- New API call

// --- Vocabulary Endpoints ---
export const getVocabulary = () => api.get("/words");
export const addVocabularyWord = (word, definition) =>
  api.post("/words", { word, definition });
export const deleteVocabularyWord = (wordId) => api.delete(`/words/${wordId}`);
export const updateVocabularyWord = (wordId, word, definition) =>
  api.put(`/words/${wordId}`, { word, definition }); // New API function

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
export const getOverallProgress = () => api.get("/progress");
export const getIncorrectAnswers = () => api.get("/incorrect-answers");
export const getIncorrectAnswersByQuiz = (quizId) =>
  api.get(`/quiz/${quizId}/incorrect-answers`);
