import _AXIOS from "axios";
import { makeUseAxios } from "axios-hooks";

export const axios = _AXIOS.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL as string,
  responseType: (import.meta.env.VITE_RESPONSE_TYPE as import("axios").ResponseType) ?? "json",
  maxContentLength: Number(import.meta.env.VITE_MAX_CONTENT_LENGTH) || 10_485_760,
});

// Intercepteur global : détection de session expirée (401)
let sessionExpiredTriggered = false;

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (!sessionExpiredTriggered) {
        sessionExpiredTriggered = true;
        document.getElementById("root")?.dispatchEvent(
          new CustomEvent("_session_expired")
        );
      }
    }
    return Promise.reject(err);
  }
);

/** Réinitialise le flag (appelé après reconnexion) */
export function resetSessionExpiredFlag() {
  sessionExpiredTriggered = false;
}

const useAxios = makeUseAxios({ axios });

export default useAxios;
