import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function OAuth2Redirect() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(search).get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Decode payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ userId: payload.userId, role: payload.role });
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [search]);

  return <p>Processing Google login...</p>;
}
