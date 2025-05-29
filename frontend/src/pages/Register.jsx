import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Register successful! Please login.");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Have account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}
