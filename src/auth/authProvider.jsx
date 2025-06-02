import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import axios from "../api/axiosInstance";
import PropTypes from 'prop-types';
import { BASE_URL } from "../utils.js";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Ambil accessToken dari localStorage saat inisialisasi
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        return jwtDecode(token);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { email, password });
      const token = res.data.accessToken;
      setAccessToken(token);
      localStorage.setItem("accessToken", token); 

      // Simpan refresh token di cookie
      Cookies.set("refreshToken", res.data.refreshToken, {
        secure: true,
        sameSite: "Strict",
        expires: 5,
      });

      const decoded = jwtDecode(token);
      setUser(decoded);
      const role = decoded.role;
      const id_user = decoded.id_user;

      return { role, id_user };
    } catch (err) {
      console.error("Login failed:", err);
      return null;
    }
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    Cookies.remove("refreshToken");
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/token`);
      setAccessToken(res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return "kosong";
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, user, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};


AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => useContext(AuthContext);
