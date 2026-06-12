import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../utils/AxiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true); // 👈 important

  // 🔓 Connexion
  const login = (token, userData) => {
    localStorage.setItem("user_token_edunote", token);


    localStorage.setItem(
      "user_role_edunote", JSON.stringify(userData.roles || [])
    );

    setUser(userData);
    setRoles(userData.roles || []);
  };

  // 🔒 Déconnexion
  // 🔒 Déconnexion complète (Front + Back)
  const logout = async () => {
    try {
      // On tente d'avertir le serveur pour supprimer le token en BDD
      await axiosClient.post("/logout"); 
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur", error);
    } finally {
      // Dans tous les cas, on nettoie le navigateur
      localStorage.removeItem("user_token_edunote");
      localStorage.removeItem("user_role_edunote");
      setUser(null);
      setRoles([]);
    }
  };

  // 🔁 Vérification du token AU DÉMARRAGE
  useEffect(() => {
    const token = localStorage.getItem("user_token_edunote");

    if (!token) {
      setLoading(false);
      return;
    }

    axiosClient.get("/user")
      .then(({ data }) => {
        setUser(data.user);

        const userRoles = Array.isArray(data.user.roles)
          ? data.user.roles.map((role) => (typeof role === 'string' ? role : role.name || ''))
          : [];

        setRoles(userRoles);

        // sync localStorage (sécurité)
        localStorage.setItem("user_role_edunote", JSON.stringify(userRoles));
      })
      .catch(() => {
        logout(); // token invalide
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
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
