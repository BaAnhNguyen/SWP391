import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

function OAuth2RedirectHandler() {
  const [status, setStatus] = useState("Processing login...");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (token) {
      // Store the token
      localStorage.setItem("token", token);
      try {
        setStatus("Login successful!");
        // Fetch full user details from backend
        fetchUserDetails(token);
      } catch (err) {
        console.error("Error decoding token:", err);
        setStatus("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } else if (error) {
      console.error("OAuth2 Error:", error);
      setStatus("Login failed. Please try again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } else {
      // No token or error, redirect to login
      setStatus("No authentication data found. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  const fetchUserDetails = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        setStatus(`Welcome back, ${userData.name}!`);
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        // If user endpoint doesn't exist, just redirect
        setStatus("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setStatus("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <div style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>{status}</div>

        {user && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#e8f5e8",
              borderRadius: "4px",
              border: "1px solid #c3e6c3",
            }}
          >
            <div style={{ fontWeight: "bold", color: "#2d5a2d" }}>
              Welcome, {user.name}! 🎉
            </div>
            <div
              style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.5rem" }}
            >
              Email: {user.email}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#555" }}>
              Role: {user.role}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          {user
            ? "You will be redirected to the homepage shortly..."
            : "Please wait while we complete your authentication."}
        </div>
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;
