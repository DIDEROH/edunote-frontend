import { useState, useEffect } from "react";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token_sspp");
    setIsAuthenticated(!!token); // true si token existe, sinon false
  }, []);

  return isAuthenticated;
}
