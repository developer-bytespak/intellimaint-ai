import axios from "axios";

const baseURL = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_API_URL! || "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default baseURL;