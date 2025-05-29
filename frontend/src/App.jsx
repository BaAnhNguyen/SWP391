import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuth2Redirect from "./pages/OAuth2Redirect";
import Dashboard from "./pages/Dashboard";

function Protected({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
