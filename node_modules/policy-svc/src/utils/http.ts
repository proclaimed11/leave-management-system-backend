
import axios from "axios";

export const http = axios.create({
  timeout: 8000,
});

http.interceptors.response.use(
  res => res,
  err => {
    if (err.response) {
      throw new Error(err.response.data?.error || err.response.statusText);
    }
    throw new Error("Network error");
  }
);
