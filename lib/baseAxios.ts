import axios from "axios";

const baseAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API, // ví dụ: http://127.0.0.1:8000/api/v1/front
  withCredentials: true, // ✅ GỬI COOKIE ĐÍNH KÈM REQUEST
});

export default baseAxios;