import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL}/auth/google`);
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLocalLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <p>
        No account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
