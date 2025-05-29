import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:5001/api/auth/google';
  };
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome to LifeSource</h2>
        
        <p className="login-description">
          🌟 Join our mission to save lives through blood donation. 
          Sign in with your Google account to get started!
        </p>
        
        <button onClick={handleGoogleLogin} className="google-login-btn" disabled={loading}>
          {loading ? '⏳ Redirecting...' : '🚀 Login with Google'}
        </button>
        
        <p className="privacy-note">
          🔒 By signing in, you agree to our terms of service and privacy policy.
          Your data is secure and protected.
        </p>
      </div>
    </div>
  );
}

export default Login;
