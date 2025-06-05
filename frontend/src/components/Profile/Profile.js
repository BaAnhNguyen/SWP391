import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Profile.css";
import { API_BASE_URL } from "../../config";

function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    city: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token);
    if (token) {
      fetchProfile();
    } else {
      setError("No authentication token found. Please login again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      console.log("Fetching profile from:", `${API_BASE_URL}/user/me`);
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch profile: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Profile data:", data);
      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        bloodGroup: data.bloodGroup || "",
        city: data.city || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No auth token found");
      }
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile(data.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading)
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );

  if (error)
    return (
      <div className="profile-container">
        <div className="profile-error">{error}</div>
      </div>
    );

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group</label>{" "}
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <div className="input-hint">
            Choose your blood type. This information is important for matching
            with donation needs.
          </div>
        </div>

        <div className="form-group">
          {" "}
          <label htmlFor="city">Location</label>{" "}
          <input
            type="text"
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Enter your city (e.g., Ho Chi Minh City)"
          />
          <div className="input-hint">
            Enter a city name in Vietnam. The location will be automatically
            geocoded.
          </div>
        </div>

        <button type="submit" className="update-button" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
