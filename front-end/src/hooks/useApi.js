import { useContext } from 'react';

import UserContext from "../contexts/UserContext";

import createApiInstance from "../services/api/api";
import createAuthApi from "../services/api/auth";

export default function useLocalStorage() {
  const { user } = useContext(UserContext);

  const apiInstance = createApiInstance(user?.token);

  const authApi = createAuthApi(apiInstance);

  return {
    auth: authApi
  };
}
