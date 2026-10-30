import axiosClient from "./AxiosClient";

/**
 * Nombre de requêtes HTTP en cours (barre de chargement du haut).
 * Compté sur le client axios : toute requête passe par ses intercepteurs,
 * y compris celles servies depuis le cache hors ligne.
 */
let pending = 0;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const done = (config) => {
  if (config?._activityCounted) {
    config._activityCounted = false;
    pending = Math.max(0, pending - 1);
    notify();
  }
};

axiosClient.interceptors.request.use((config) => {
  config._activityCounted = true;
  pending += 1;
  notify();
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    done(response?.config);
    return response;
  },
  (error) => {
    done(error?.config);
    return Promise.reject(error);
  },
);

export function subscribeRequests(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const pendingRequests = () => pending;
