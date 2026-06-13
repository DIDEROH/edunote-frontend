import axios from "axios";
import { API_URL } from "./constants";

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
  baseURL: `${API_URL}/api`,
  timeout: 30000, // ✅ Timeout de 30s pour éviter les requêtes pendantes
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // ✅ Protection CSRF
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
    // ✅ Valider Content-Type
    const contentType = response.headers["content-type"];
    if (!contentType?.includes("application/json")) {
      console.warn("[AxiosClient] Unexpected content-type:", contentType);
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

    // ✅ Gestion centralisée des erreurs
    if (response?.status === 401) {
      clearAuthToken();
      if (logoutCallback) {
        logoutCallback();
      } else {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expirée. Veuillez vous reconnecter."));
    }

    if (response?.status === 403) {
      console.warn("[AxiosClient] Access forbidden:", error);
      return Promise.reject(new Error("Vous n'avez pas la permission d'accéder à cette ressource."));
    }

    if (response?.status === 500) {
      console.error("[AxiosClient] Server error:", error);
      return Promise.reject(new Error("Erreur du serveur. Veuillez réessayer plus tard."));
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Délai d'attente dépassé. Veuillez vérifier votre connexion."));
    }

    if (error.message === "Network Error") {
      return Promise.reject(new Error("Erreur de réseau. Veuillez vérifier votre connexion internet."));
    }

    return Promise.reject(error);
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
