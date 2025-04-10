import axios from "axios";

const api = axios.create({
  baseURL: "https://agrosence-1.onrender.com", // your Render backend URL
  withCredentials: true, // only if you're using cookies/sessions
});

export default api;
