export const TOKEN_KEY = 'user_token_edunote';
export const ROLES_KEY = 'edunote_roles';

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function logout() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLES_KEY);
}
