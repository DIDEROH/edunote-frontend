import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axiosClient from "../utils/AxiosClient";
import { clearResponses } from "../utils/offline/responseCache";
import { clearOutbox, dropOtherUsersEntries } from "../utils/offline/outbox";
import { isNetworkError } from "../utils/offline/status";

const AuthContext = createContext();

const KEYS = {
  token: "user_token_edunote",
  roles: "user_role_edunote",
  name: "user_name_edunote",
  email: "user_email_edunote",
  user: "user_data_edunote",
  // Compte propriétaire des données hors ligne stockées sur cet appareil
  offlineOwner: "edunote_offline_owner",
};

// 🟢 Extraction basée UNIQUEMENT sur .name mis en minuscules (évite le [""])
const extractRoles = (userData) =>
  Array.isArray(userData?.roles)
    ? userData.roles.map((r) => (typeof r === "string" ? r.toLowerCase() : (r.name ? r.name.toLowerCase() : "")))
    : [];

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.user) || "null");
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Initialisation réactive depuis le localStorage
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem(KEYS.roles);
    return saved ? JSON.parse(saved) : [];
  });
  const [userName, setUserName] = useState(() => localStorage.getItem(KEYS.name) || null);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem(KEYS.email) || null);
  const [loading, setLoading] = useState(true);

  // Applique et mémorise les informations de l'utilisateur connecté
  const applyUser = useCallback((userData) => {
    const userRoles = extractRoles(userData);

    localStorage.setItem(KEYS.roles, JSON.stringify(userRoles));
    localStorage.setItem(KEYS.name, userData.name || "");
    localStorage.setItem(KEYS.email, userData.email || "");
    localStorage.setItem(KEYS.user, JSON.stringify(userData));

    setUser(userData);
    setRoles(userRoles);
    setUserName(userData.name || "");
    setUserEmail(userData.email || "");
  }, []);

  // Efface la session locale (sans appel serveur)
  const clearSession = useCallback(() => {
    Object.values(KEYS).forEach((key) => {
      if (key !== KEYS.offlineOwner) localStorage.removeItem(key);
    });
    setUser(null);
    setRoles([]);
    setUserName(null);
    setUserEmail(null);
  }, []);

  // 🔓 Connexion
  const login = (token, userData) => {
    localStorage.setItem(KEYS.token, token);

    // 🔒 Un autre compte se connecte sur cet appareil : on écarte les données
    // hors ligne (consultations, saisies en attente) du compte précédent.
    if (localStorage.getItem(KEYS.offlineOwner) !== String(userData.id)) {
      clearResponses();
      dropOtherUsersEntries(userData.id);
      localStorage.setItem(KEYS.offlineOwner, String(userData.id));
    }

    applyUser(userData);
  };

  // 🔒 Déconnexion : on efface aussi les données hors ligne de l'appareil
  const logout = async () => {
    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      clearSession();
      localStorage.removeItem(KEYS.offlineOwner);
      clearResponses();
      clearOutbox();
    }
  };

  // Recharge l'utilisateur depuis le serveur (après modification du profil)
  const refreshUser = useCallback(async () => {
    const { data } = await axiosClient.get("/me");
    applyUser(data.user);
    return data.user;
  }, [applyUser]);

  // 🔁 Vérification du token AU DÉMARRAGE
  useEffect(() => {
    const token = localStorage.getItem(KEYS.token);

    if (!token) {
      setLoading(false);
      return;
    }

    // 🔴 On cible la route /me gérée par votre AuthController
    axiosClient.get("/me")
      .then(({ data }) => applyUser(data.user))
      .catch((error) => {
        // 🐛 Hors ligne (ou serveur injoignable), on garde la session connue
        // au lieu de déconnecter l'utilisateur : seule une vraie réponse
        // "non authentifié" du serveur met fin à la session.
        const storedUser = readStoredUser();
        if (isNetworkError(error) && storedUser) {
          setUser(storedUser);
          return;
        }

        clearSession();
      })
      .finally(() => {
        setLoading(false);
      });

  }, [applyUser, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        userName,
        userEmail,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        // On vérifie en minuscules pour correspondre au stockage
        hasRole: (roleName) => roles.includes(roleName.toLowerCase()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
