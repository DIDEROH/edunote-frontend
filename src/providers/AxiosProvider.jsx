import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAxiosLoaders } from '../utils/AxiosClient';

/**
 * Provider pour initialiser Axios avec:
 * - Gestion centralisée du loader
 * - Gestion centralisée du logout
 * - Cleanup propre au démontage
 */
export default function AxiosProvider({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // ✅ Initialiser axios avec callbacks sécurisés
    const cleanup = initAxiosLoaders({
      setLoading: setIsLoading,
      setProgress,
      onLogout: () => {
        setIsLoading(false);
        navigate('/login', { replace: true });
      },
    });

    // ✅ Cleanup au démontage
    return cleanup;
  }, [navigate]);

  return (
    <>
      {children}
      
      {/* Loader global optionnel - à adapter à votre UI */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <div
            className="loading loading-spinner loading-lg text-primary"
            style={{
              width: 48,
              height: 48,
              border: '4px solid rgba(255, 255, 255, 0.35)',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'axios-provider-spin 0.8s linear infinite',
            }}
          />
          {progress > 0 && progress < 100 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-base-content/70">
              {progress}%
            </div>
          )}
          <style>{`@keyframes axios-provider-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </>
  );
}
