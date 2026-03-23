import axios from "axios";
import { makeUseAxios } from "axios-hooks";
import store from "@/redux/store";
import { deconnected } from "@/redux/user";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL,
  responseType: import.meta.env.VITE_RESPONSE_TYPE || "json",
  maxContentLength: Number(import.meta.env.VITE_MAX_CONTENT_LENGTH) || 4000,
});

instance.interceptors.request.use((config) => {
  const token = store.getState().user.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(deconnected());
    }
    return Promise.reject(error);
  }
);

const useAxios = makeUseAxios({ axios: instance });

export { instance as axiosInstance };
export default useAxios;
