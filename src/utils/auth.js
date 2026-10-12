import { TOKEN_KEY } from './AxiosClient';

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}
