import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Login.css";

function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = "http://localhost:5001/api/auth/google";
  };
  return (
    <div className="login-container">
      <div className="login-form">
        {" "}
        <div className="login-header">
          <div className="logo-icon">❤</div>
          <h2>{t("login.title")}</h2>
          <p>{t("login.subtitle")}</p>
        </div>
        <div className="form-body">
          <div className="welcome-message">
            <div className="stats-grid"></div>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
            disabled={loading}
          >
            {!loading && (
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon"
              />
            )}
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              t("login.googleButton")
            )}
          </button>{" "}
          <div className="login-footer">
            <p className="privacy-note">{t("login.privacy")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
