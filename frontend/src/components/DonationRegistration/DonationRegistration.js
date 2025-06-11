import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./DonationRegistration.css";

const donationTypes = [
  "Whole blood",
  "Apheresis",
  "SuperRed",
  "Platelet",
  "Plasma"
];

const bloodTypes = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

function DonationRegistration() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    date: "",
    bloodType: "A+",
    units: 1,
    donationType: donationTypes[0],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/donateRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(t("donate.submitError"));
      setSuccess(t("donate.success"));
      setForm({ date: "", bloodType: "A+", units: 1, donationType: donationTypes[0] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="need-request-container">
      <div className="need-request-page-header">
        <div className="blood-icon">
          <div className="blood-drop"></div>
        </div>
        <h1>{t("donate.title")}</h1>
        <p>{t("donate.description")}</p>
      </div>
      <div className="donation-registration-form-wrapper">
        <form className="donation-registration-form" onSubmit={handleSubmit}>
          <label>
            {t("donate.date")}
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t("donate.bloodType")}
            <select name="bloodType" value={form.bloodType} onChange={handleChange} required>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            {t("donate.units")}
            <input
              type="number"
              name="units"
              min="1"
              max="10"
              value={form.units}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t("donate.donationType")}
            <select name="donationType" value={form.donationType} onChange={handleChange} required>
              {donationTypes.map((type) => (
                <option key={type} value={type}>{t(`donate.type.${type.replace(/\s/g, '').toLowerCase()}`, type)}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? t("common.loading", "Đang đăng ký...") : t("donate.submit")}
          </button>
          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default DonationRegistration;
