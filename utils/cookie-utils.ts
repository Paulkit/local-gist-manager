import { parseCookies, setCookie, destroyCookie } from 'nookies';

// Constants
export const TOKEN_COOKIE_NAME = 'github_token';
export const MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Check if we're on the client side
 */
const isClientSide = () => {
  return typeof window !== 'undefined';
};

/**
 * Save token to cookies
 */
export const saveTokenToCookie = (token: string) => {
  if (!isClientSide()) return;
  
  setCookie(null, TOKEN_COOKIE_NAME, token, {
    maxAge: MAX_AGE,
    path: '/',
    sameSite: 'strict'
  });
};

/**
 * Get token from cookies
 */
export const getTokenFromCookie = () => {
  if (!isClientSide()) return '';
  
  const cookies = parseCookies();
  return cookies[TOKEN_COOKIE_NAME] || '';
};

/**
 * Remove token from cookies
 */
export const removeTokenFromCookie = () => {
  if (!isClientSide()) return;
  
  destroyCookie(null, TOKEN_COOKIE_NAME);
};

/**
 * Check if token exists in cookies
 */
export const hasTokenInCookie = () => {
  if (!isClientSide()) return false;
  
  const cookies = parseCookies();
  return !!cookies[TOKEN_COOKIE_NAME];
};
