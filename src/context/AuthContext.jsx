import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../utils/AxiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // Initialisation réactive depuis le localStorage
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("user_role_edunote");
    return saved ? JSON.parse(saved) : [];
  });
  const [userName, setUserName] = useState(() => localStorage.getItem("user_name_edunote") || null);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("user_email_edunote") || null);
  const [loading, setLoading] = useState(true);

  // 🔓 Connexion
  const login = (token, userData) => {
    // 🟢 Extraction basée UNIQUEMENT sur .name mis en minuscules
    const userRoles = Array.isArray(userData.roles)
      ? userData.roles.map((r) => (typeof r === 'string' ? r.toLowerCase() : (r.name ? r.name.toLowerCase() : '')))
      : [];

    localStorage.setItem("user_token_edunote", token);
    localStorage.setItem("user_role_edunote", JSON.stringify(userRoles));
    localStorage.setItem("user_name_edunote", userData.name || "");
    localStorage.setItem("user_email_edunote", userData.email || "");

    setUser(userData);
    setRoles(userRoles);
    setUserName(userData.name || "");
    setUserEmail(userData.email || "");
  };

  // 🔒 Déconnexion
  const logout = async () => {
    try {
      await axiosClient.post("/logout"); 
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      localStorage.removeItem("user_token_edunote");
      localStorage.removeItem("user_role_edunote");
      localStorage.removeItem("user_name_edunote"); 
      localStorage.removeItem("user_email_edunote"); 
      setUser(null);
      setRoles([]);
      setUserName(null);
      setUserEmail(null);
    }
  };

  // 🔁 Vérification du token AU DÉMARRAGE
  useEffect(() => {
    const token = localStorage.getItem("user_token_edunote");

    if (!token) {
      setLoading(false);
      return;
    }

    // 🔴 On cible la route /me gérée par votre AuthController
    axiosClient.get("/me") 
      .then(({ data }) => {
        setUser(data.user);
        setUserName(data.user.name || "");
        setUserEmail(data.user.email || "");

        // 🟢 Extraction basée UNIQUEMENT sur .name mis en minuscules (évite le [""])
        const userRoles = Array.isArray(data.user.roles)
          ? data.user.roles.map((r) => (typeof r === 'string' ? r.toLowerCase() : (r.name ? r.name.toLowerCase() : '')))
          : [];

        setRoles(userRoles);

        localStorage.setItem("user_name_edunote", data.user.name || "");
        localStorage.setItem("user_email_edunote", data.user.email || "");
        localStorage.setItem("user_role_edunote", JSON.stringify(userRoles));
      })
      .catch(() => {
        logout(); 
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

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
