import axios from "axios";

const API_BASE_URL = "https://agrosence-1.onrender.com"; // ✅ Hardcoded backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true, 
});

export default api;
