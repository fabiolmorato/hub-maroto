export default function createAuthApi (api) {
  return {
    login (username, password) {
      return api.post('/auth/sign-in', { username, password });
    }
  };
}
