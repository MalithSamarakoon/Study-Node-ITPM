import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser } from "./authApi.js";

const STORAGE_KEY = "studynode-auth-user";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  async function login(credentials) {
    const loggedInUser = await loginUser(credentials);
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    return loggedInUser;
  }

  async function register(payload) {
    const registeredUser = await registerUser(payload);
    setUser(registeredUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registeredUser));
    return registeredUser;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
