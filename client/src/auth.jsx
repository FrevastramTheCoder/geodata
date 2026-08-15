import { createContext, useContext } from "react";

const AuthContext = createContext({ user: null, loading: false, error: null });

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={{ user: null, loading: false, error: null }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
