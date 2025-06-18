import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Profile.css";
import { API_BASE_URL } from "../../config";
import AddressForm from "../AddressForm/AddressForm";

function Profile() {
  const { t } = useTranslation();
  const [, setProfile] = useState(null); // Using empty destructuring to indicate we only need setProfile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    city: "",
    identityCard: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      district: "",
      city: "",
    },
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
        city: data.address?.city || "",
        identityCard: data.identityCard || "",
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: data.gender || "",
        address: {
          street: data.address?.street || "",
          district: data.address?.district || "",
          city: data.address?.city || "",
        },
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
      } // Prepare data for submission
      const formData = {
        name: form.name,
        email: form.email,
        bloodGroup: form.bloodGroup,
        identityCard: form.identityCard,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: {
          street: form.address.street,
          district: form.address.district,
          city: form.address.city,
          country: "Vietnam",
        },
      };

      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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

    // Handle nested address fields
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
      <h1>{t("profile.title")}</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">{t("profile.name")}</label>
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
          <label htmlFor="email">{t("profile.email")}</label>
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
          <label htmlFor="bloodGroup">{t("profile.bloodGroup")}</label>{" "}
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
          >
            <option value="">{t("profile.selectBloodGroup")}</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="unknown">unknown</option>
          </select>
          <div className="input-hint">
            <p>{t("profile.blood.hint")}</p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="identityCard">{t("profile.identityCard")}</label>
          <input
            type="text"
            id="identityCard"
            name="identityCard"
            value={form.identityCard}
            onChange={handleChange}
          />
          <div className="input-hint">
            <p>{t("profile.identityCard.hint")}</p>
          </div>
        </div>{" "}
        <div className="form-group">
          <label htmlFor="phoneNumber">{t("profile.phoneNumber")}</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <div className="input-hint">
            <p>{t("profile.phoneNumber.hint")}</p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">{t("profile.dateOfBirth")}</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
          <div className="input-hint">
            <p>{t("profile.dateOfBirth.hint")}</p>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="gender">{t("profile.gender")}</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">{t("profile.selectGender")}</option>
            <option value="Male">{t("profile.gender.male")}</option>
            <option value="Female">{t("profile.gender.female")}</option>
            <option value="Other">{t("profile.gender.other")}</option>
          </select>
          <div className="input-hint">
            <p>{t("profile.gender.hint")}</p>
          </div>
        </div>
        <div className="form-section-header">
          <h3>{t("profile.addressDetails")}</h3>
        </div>
        <AddressForm
          initialAddress={form.address}
          onChange={(updatedAddress) => {
            setForm((prev) => ({
              ...prev,
              address: {
                ...updatedAddress,
                country: "Vietnam",
              },
            }));
          }}
        />
        <button type="submit" className="update-button" disabled={loading}>
          {loading ? t("profile.updating") : t("profile.update")}
        </button>
      </form>
    </div>
  );
}

export default Profile;
