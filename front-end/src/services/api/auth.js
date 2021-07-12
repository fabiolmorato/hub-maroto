import api from './api';

export function login (username, password) {
  return api.post('/auth/sign-in', { username, password });
}
