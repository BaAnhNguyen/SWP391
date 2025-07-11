import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Profile.css";
import { API_BASE_URL } from "../../config";
import AddressForm from "../AddressForm/AddressForm";

function Profile() {
  const { t } = useTranslation();
  const [, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  // Lưu mọi trường, trong đó address (string hoặc object tuỳ bạn) và location (toạ độ)
  const [form, setForm] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    identityCard: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    location: null,
  });

  // Khi muốn reset:
  function handleResetForm() {
    setForm({ address: "", location: null });
    setResetKey((prev) => prev + 1);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else {
      setError("No authentication token found. Please login again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch profile: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      setProfile(data);

      setForm({
        name: data.name || "",
        email: data.email || "",
        bloodGroup: data.bloodGroup || "",
        identityCard: data.identityCard || "",
        phoneNumber: data.phoneNumber || "",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: data.gender || "",
        address: data.address || "",
        location: data.location || { lat: null, lng: null },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    setFieldErrors({});
    let errors = {};
    if (!form.name.trim() || form.name.length < 2) {
      errors.name = "Vui lòng nhập họ tên hợp lệ (tối thiểu 2 ký tự).";
    }
    if (
      form.identityCard &&
      !/^(\d{9}|\d{12})$/.test(form.identityCard.trim())
    ) {
      errors.identityCard = "Số CMND/CCCD phải có 9 hoặc 12 chữ số.";
    }
    if (form.phoneNumber && !/^0\d{9,10}$/.test(form.phoneNumber.trim())) {
      errors.phoneNumber =
        "Số điện thoại phải bắt đầu bằng 0 và có 10 hoặc 11 số.";
    }
    // Nếu có lỗi
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const formData = {
        name: form.name,
        email: form.email,
        bloodGroup: form.bloodGroup,
        identityCard: form.identityCard,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address, // string (hoặc object)
        location: form.location, // {lat, lng}
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
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      setProfile(data.data);
      alert("Profile updated successfully!");
    } catch (err) {
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
          {fieldErrors.name && (
            <div className="field-error">{fieldErrors.name}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">{t("profile.email")}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="bloodGroup">{t("profile.bloodGroup")}</label>
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
          {fieldErrors.identityCard && (
            <div className="field-error">{fieldErrors.identityCard}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">{t("profile.phoneNumber")}</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          {fieldErrors.phoneNumber && (
            <div className="field-error">{fieldErrors.phoneNumber}</div>
          )}
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
            <option value="Male">{t("profile.genderMale")}</option>
            <option value="Female">{t("profile.genderFemale")}</option>
            <option value="Other">{t("profile.genderOther")}</option>
          </select>
        </div>
        <div className="form-section-header">
          <h3>{t("profile.addressDetails")}</h3>
        </div>
        <AddressForm
          initialValue={{
            address: form.address,
            location: form.location,
          }}
          onChange={({ address, location }) => {
            setForm((prev) => ({
              ...prev,
              address,
              location,
            }));
          }}
        />

        {error && <div className="profile-error">{error}</div>}
        <button type="submit" className="update-button" disabled={loading}>
          {loading ? t("profile.updating") : t("profile.update")}
        </button>
      </form>
    </div>
  );
}

export default Profile;
