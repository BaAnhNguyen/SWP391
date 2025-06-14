import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./DonateRequestForm.css";

const DonateRequestForm = ({ onRequestCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    bloodGroup: "",
    component: "",
    readyDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const components = [
    { value: "WholeBlood", label: t("donateRequest.component.wholeblood") },
    { value: "Plasma", label: t("donateRequest.component.plasma") },
    { value: "Platelets", label: t("donateRequest.component.platelets") },
    { value: "RedCells", label: t("donateRequest.component.redcells") },
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      const response = await fetch(`${API_BASE_URL}/donateregistration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("donateRequest.submitError"));
      }
      setSuccess(true);
      setFormData({
        bloodGroup: "",
        component: "",
        readyDate: "",
      });

      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (err) {
      setError(err.message);
      console.error("Error submitting request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-request-form-container">
      <h2>{t("donateRequest.title")}</h2>
      <p className="form-description">{t("donateRequest.description")}</p>

      {success && (
        <div className="success-message">
          {t("donateRequest.successMessage")}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="donate-request-form">
        <div className="form-group">
          <label htmlFor="bloodGroup">
            {t("donateRequest.bloodGroup")}
            <span className="required">*</span>
          </label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">{t("donateRequest.selectBloodGroup")}</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="component">
            {t("donateRequest.component")}
            <span className="required">*</span>
          </label>
          <select
            id="component"
            name="component"
            value={formData.component}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">{t("donateRequest.selectComponent")}</option>
            {components.map((comp) => (
              <option key={comp.value} value={comp.value}>
                {comp.label}
              </option>
            ))}
          </select>{" "}
        </div>
        <div className="form-group">
          <label htmlFor="readyDate">
            {t("donateRequest.donationDate")}
            <span className="required">*</span>
          </label>
          <input
            type="date"
            id="readyDate"
            name="readyDate"
            value={formData.readyDate}
            onChange={handleChange}
            required
            className="form-control"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? t("common.submitting") : t("donateRequest.submit")}
        </button>
      </form>
    </div>
  );
};

export default DonateRequestForm;
