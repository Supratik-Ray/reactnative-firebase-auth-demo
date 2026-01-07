import { createContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { renewToken } from "../utils/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState();
  const refreshTokenRef = useRef(null);
  const logoutTimerRef = useRef(null);

  function clearLogoutTimer() {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }

  const regenerateToken = async (refreshToken) => {
    try {
      const authInfo = await renewToken(refreshToken);
      authenticate(authInfo);
    } catch (e) {
      logout();
    }
  };

  const authenticate = ({ token, refreshToken, expiresIn }) => {
    //calculate the expiryTime
    const expiryTime = Date.now() + expiresIn * 1000;

    //store it in context
    setAuthToken(token);
    refreshTokenRef.current = refreshToken;

    //store it locally for when user comes back
    AsyncStorage.setItem(
      "authData",
      JSON.stringify({ token, refreshToken, expiryTime })
    );

    //timer for token regeneration
    clearLogoutTimer();
    logoutTimerRef.current = setTimeout(
      () => regenerateToken(refreshToken),
      expiryTime - 60000 - Date.now()
    );
  };

  function logout() {
    clearLogoutTimer();
    setAuthToken(null);
    refreshTokenRef.current = null;
    AsyncStorage.removeItem("authData");
  }

  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
    regenerateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
