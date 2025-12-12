// src/helpers/UserHelper.ts

export const getToken = (): string | null => {
  return localStorage.getItem('expo_token');
};

export const setToken = (token: string) => {
  localStorage.setItem('expo_token', token);
};

export const clearToken = () => {
  localStorage.removeItem('expo_token');
};