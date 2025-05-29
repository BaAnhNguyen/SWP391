import { createContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api/auth";

export const AuthContext = createContext();

// Hàm tự parse payload JWT (Base64 → JSON)
function parseToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Khi khởi app, khôi phục session nếu có token còn hiệu lực
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseToken(token);
      if (decoded && Date.now() < decoded.exp * 1000) {
        setUser({ userId: decoded.userId, role: decoded.role });
      } else {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Hàm login local
  const login = async (creds) => {
    const { data } = await apiLogin(creds);
    const decoded = parseToken(data.token);
    if (!decoded) throw new Error("Invalid token");
    localStorage.setItem("token", data.token);
    setUser({ userId: decoded.userId, role: decoded.role });
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
