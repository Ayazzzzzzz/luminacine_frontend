// src/auth/useAuth.js
// import { useContext } from "react";
import { useAuthContext } from "./authProvider";

const useAuth = () => {
  const { accessToken, user, login, logout, refreshAccessToken } = useAuthContext();

  return {
    accessToken,
    user,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!accessToken,
  };
};

export default useAuth;