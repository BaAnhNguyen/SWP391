import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user.role}</h1>
      <button onClick={logout}>Logout</button>
      <p>This is your dashboard.</p>
    </div>
  );
}
