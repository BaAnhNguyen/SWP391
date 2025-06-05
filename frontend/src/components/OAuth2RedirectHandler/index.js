import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return <div className="oauth2-redirect">Processing authentication...</div>;
};

export default OAuth2RedirectHandler;
