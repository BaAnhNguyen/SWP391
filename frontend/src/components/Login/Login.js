import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = "http://localhost:5001/api/auth/google";
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <div className="logo-icon">❤</div>
          <h2>Welcome to LifeSource</h2>
          <p>Join our community of life-savers</p>
        </div>

        <div className="form-body">
          <div className="welcome-message">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">3+</span>
                <span className="stat-label">Lives Saved per Donation</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15k+</span>
                <span className="stat-label">Active Donors</span>
              </div>
            </div>
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
              "Continue with Google"
            )}
          </button>

          <div className="login-footer">
            <p className="privacy-note">
              By continuing, you agree to our{" "}
              <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
