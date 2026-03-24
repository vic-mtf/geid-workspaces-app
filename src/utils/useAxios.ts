import axios from "axios";
import { makeUseAxios } from "axios-hooks";

const useAxios = makeUseAxios({
  axios: axios.create({
    baseURL: import.meta.env.VITE_SERVER_BASE_URL,
    responseType: import.meta.env.VITE_RESPONSE_TYPE || "json",
    maxContentLength: Number(import.meta.env.VITE_MAX_CONTENT_LENGTH) || 4000,
  }),
});

export default useAxios;
