
import axios, { AxiosInstance } from "axios";

export const makeHttp = (): AxiosInstance => {
  const instance = axios.create({ timeout: 10_000 });
  return instance;
};

