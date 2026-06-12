export function useHasRole(role) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storedRoles = localStorage.getItem('edunote_roles');
    const roles = storedRoles ? JSON.parse(storedRoles) : [];
    return Array.isArray(roles) && roles.includes(role);
  } catch (error) {
    console.error('[useHasRole] impossible de lire les rôles :', error);
    return false;
  }
}
