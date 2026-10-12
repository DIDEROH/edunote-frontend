import axios from "axios";
import { isCacheable, readResponse, saveResponse } from "./offline/responseCache";
import { enqueue } from "./offline/outbox";
import { isNetworkError, setServerReachable } from "./offline/status";

// ============================================
// Configuration globale sécurisée
// ============================================

export const TOKEN_KEY = "user_token_edunote";
const DEFAULT_LANGUAGE = "fr";
let loaderCallbacks = { setLoading: null, setProgress: null };
let logoutCallback = null;

function normalizeLanguage(language) {
  if (!language || typeof language !== "string") {
    return null;
  }

  return language.split(/[-_]/)[0].toLowerCase();
}

function getSelectedLanguage(config = {}) {
  if (config.language) {
    return normalizeLanguage(config.language);
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return normalizeLanguage(navigator.language);
  }

  return DEFAULT_LANGUAGE;
}

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000, // ✅ Timeout de 30s pour éviter les requêtes pendantes
  headers: {
    Accept: "application/json",
      "Content-Type": "application/json",
  },
});

// ============================================
// Initialisation des callbacks (React side)
// ============================================
export function initAxiosLoaders({ setLoading, setProgress, onLogout }) {
  loaderCallbacks = { setLoading, setProgress };
  logoutCallback = onLogout;
  return () => {
    loaderCallbacks = { setLoading: null, setProgress: null };
    logoutCallback = null;
  };
}

// ============================================
// Gestion sécurisée du token
// ============================================
function getAuthToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("[AxiosClient] Token retrieval error:", e);
    return null;
  }
}

function clearAuthToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("[AxiosClient] Token cleanup error:", e);
  }
}

/**
 * Erreur rejetée vers les pages : `message` contient toujours un texte
 * lisible (celui du serveur quand il existe) et l'erreur d'origine reste
 * accessible (`response`, `status`). 🐛 Auparavant, les erreurs 401/403/500
 * étaient recréées sans `response` : les pages qui lisaient
 * `error.response.data.message` perdaient le message du serveur.
 */
function apiError(message, error, extra = {}) {
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  wrapped.status = error?.response?.status;
  wrapped.code = error?.code;
  wrapped.config = error?.config;
  return Object.assign(wrapped, extra);
}

// Réponse factice au format axios, servie depuis le cache hors ligne ou la file d'attente
function localResponse(config, data, extra = {}) {
  return { data, status: 200, statusText: "OK", headers: {}, config, request: null, ...extra };
}

// ============================================
// Interceptor Request - Ajout du token & loader
// ============================================
axiosClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {};

    const token = getAuthToken();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.skipLanguage) {
      const language = getSelectedLanguage(config);
      if (language) {
        config.headers["Accept-Language"] = config.headers["Accept-Language"] || language;
        config.headers["X-App-Language"] = config.headers["X-App-Language"] || language;
      }
    }

    // ✅ Loader avec callback sécurisé
    if (config._withLoader && loaderCallbacks.setLoading) {
      loaderCallbacks.setLoading(true);
      if (loaderCallbacks.setProgress) {
        loaderCallbacks.setProgress(0);
      }
    }

    return config;
  },
  (error) => {
    if (error.config?._withLoader && loaderCallbacks.setLoading) {
      loaderCallbacks.setLoading(false);
    }
    return Promise.reject(error);
  }
);

// ============================================
// Interceptor Response - Gestion erreurs + loader
// ============================================
axiosClient.interceptors.response.use(
  (response) => {
    setServerReachable(true);

    // ✅ Valider Content-Type
    const contentType = response.headers["content-type"];
    if (!contentType?.includes("application/json")) {
      console.warn("[AxiosClient] Unexpected content-type:", contentType);
    }

    // Mémorise la réponse pour la consultation hors ligne
    if (isCacheable(response.config)) {
      saveResponse(response.config, response.data);
    }

    // Fermer loader
    if (response.config?._withLoader && loaderCallbacks.setProgress) {
      loaderCallbacks.setProgress(100);
    }
    if (response.config?._withLoader && loaderCallbacks.setLoading) {
      setTimeout(() => {
        loaderCallbacks.setLoading?.(false);
      }, 300);
    }

    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Fermer loader en cas d'erreur
    if (config?._withLoader && loaderCallbacks.setLoading) {
      loaderCallbacks.setLoading(false);
    }

    // Requête annulée volontairement (page quittée...) : ni erreur réseau, ni cache
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // ✅ Pas de réponse du serveur : hors ligne ou serveur injoignable
    if (isNetworkError(error)) {
      setServerReachable(false);

      // Lecture : on sert la dernière version enregistrée sur l'appareil
      if (config && isCacheable(config)) {
        const cached = await readResponse(config);
        if (cached) {
          return localResponse(config, cached.data, { fromCache: true, cachedAt: cached.savedAt });
        }
      }

      // Écriture autorisée hors ligne : mise en file d'attente, envoi au retour du réseau
      if (config?.offlineQueue) {
        const { label, dedupeKey, meta } = config.offlineQueue;
        await enqueue({ method: config.method, url: config.url, data: config.data, label, dedupeKey, meta });
        return localResponse(config, { queued: true }, { status: 202, statusText: "Queued", queued: true });
      }

      const offlineMessage = error.code === "ECONNABORTED"
        ? "Délai d'attente dépassé. Veuillez vérifier votre connexion."
        : "Vous êtes hors ligne : cette action nécessite une connexion internet.";
      return Promise.reject(apiError(offlineMessage, error, { isNetworkError: true }));
    }

    setServerReachable(true);
    const serverMessage = response?.data?.message;

    // ✅ Gestion centralisée des erreurs
    if (response?.status === 401) {
      clearAuthToken();
      if (logoutCallback) {
        logoutCallback();
      } else {
        window.location.href = "/login";
      }
      return Promise.reject(apiError(serverMessage || "Session expirée. Veuillez vous reconnecter.", error));
    }

    if (response?.status === 403) {
      console.warn("[AxiosClient] Access forbidden:", error);
      return Promise.reject(apiError(serverMessage || "Vous n'avez pas la permission d'accéder à cette ressource.", error));
    }

    if (response?.status === 405) {
      console.warn("[AxiosClient] Method not Allowed:", error);
      return Promise.reject(apiError(serverMessage || "Cette methode n'est pas autorisée.", error));
    }

    if (response?.status === 422) {
      return Promise.reject(apiError(serverMessage || "Certaines informations sont invalides.", error));
    }

    if (response?.status === 429) {
      return Promise.reject(apiError("Trop de tentatives. Veuillez patienter une minute avant de réessayer.", error));
    }

    if (response?.status >= 500) {
      console.error("[AxiosClient] Server error:", error);
      return Promise.reject(apiError(serverMessage || "Erreur du serveur. Veuillez réessayer plus tard.", error));
    }

    return Promise.reject(apiError(serverMessage || error.message || "Une erreur est survenue.", error));
  }
);

// ============================================
// Upload/Download Progress
// ============================================
axiosClient.defaults.onUploadProgress = (e) => {
  if (e.total && loaderCallbacks.setProgress) {
    const percent = Math.round((e.loaded * 100) / e.total);
    loaderCallbacks.setProgress(Math.min(percent, 95)); // Cap à 95% avant complète
  }
};

axiosClient.defaults.onDownloadProgress = (e) => {
  if (e.total && loaderCallbacks.setProgress) {
    const percent = Math.round((e.loaded * 100) / e.total);
    loaderCallbacks.setProgress(Math.min(percent, 95));
  }
};

// ============================================
// Export méthodes simplifiées et typées
// ============================================
export const api = {
  get: (url, config = {}) => axiosClient.get(url, config),
  post: (url, data = {}, config = {}) => axiosClient.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => axiosClient.patch(url, data, config),
  delete: (url, config = {}) => axiosClient.delete(url, config),

  // ✅ Méthodes avec loader intégré
  getWithLoader: (url, config = {}) =>
    axiosClient.get(url, { ...config, _withLoader: true }),
  postWithLoader: (url, data = {}, config = {}) =>
    axiosClient.post(url, data, { ...config, _withLoader: true }),
  putWithLoader: (url, data = {}, config = {}) =>
    axiosClient.put(url, data, { ...config, _withLoader: true }),

  // ✅ Bypass auth si nécessaire (login, signup)
  getNoAuth: (url, config = {}) =>
    axiosClient.get(url, { ...config, skipAuth: true }),
  postNoAuth: (url, data = {}, config = {}) =>
    axiosClient.post(url, data, { ...config, skipAuth: true }),
};

export default axiosClient;
