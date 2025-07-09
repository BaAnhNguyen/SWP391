import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./NeedRequestForm.css";

const NeedRequestForm = ({ onRequestCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    bloodGroup: "",
    component: "",
    units: 1,
    reason: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const components = [
    { value: "WholeBlood", label: t("common.component.wholeblood") },
    { value: "Plasma", label: t("common.component.plasma") },
    { value: "Platelets", label: t("common.component.platelets") },
    { value: "RedCells", label: t("common.component.redcells") },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "units" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create preview for image files
    if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
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

      // Chuẩn bị dữ liệu gửi lên
      const formDataToSend = new FormData();
      formDataToSend.append("bloodGroup", formData.bloodGroup);
      formDataToSend.append("component", formData.component);
      formDataToSend.append("units", formData.units);
      formDataToSend.append("reason", formData.reason);
      if (file) {
        formDataToSend.append("attachment", file);
      }

      const response = await fetch(`${API_BASE_URL}/needrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.submitError"));
      }
      setSuccess(true);
      setFormData({
        bloodGroup: "",
        component: "",
        units: 1,
        reason: "",
      });
      setFile(null);
      setFilePreview(null);

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
    <div className="need-request-form-container">
      <h2>{t("needRequest.title")}</h2>
      <p className="form-description">{t("needRequest.description")}</p>

      {success && (
        <div className="success-message">{t("needRequest.successMessage")}</div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="need-request-form"
        encType="multipart/form-data"
      >
        <div className="form-group">
          <label htmlFor="bloodGroup">
            {t("needRequest.bloodGroup")}
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
            <option value="">{t("needRequest.selectBloodGroup")}</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="component">
            {t("needRequest.component")}
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
            <option value="">{t("needRequest.selectComponent")}</option>
            {components.map((comp) => (
              <option key={comp.value} value={comp.value}>
                {comp.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="units">
            {t("needRequest.units")}
            <span className="required">*</span>
          </label>
          <input
            type="number"
            id="units"
            name="units"
            min="1"
            value={formData.units}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">
            {t("needRequest.reason")}
            <span className="required">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            className="form-control"
            rows="4"
            placeholder={t("needRequest.reasonPlaceholder")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment">
            {t("needRequest.attachment")}
          </label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            className="form-control"
            onChange={handleFileChange}
          />
          {/* Preview for image files */}
          {filePreview && (
            <div className="file-preview">
              <h4>{t("needRequest.attachment")}</h4>
              <img
                src={filePreview}
                alt="Preview"
                className="attachment-preview"
                onClick={() => window.open(filePreview, '_blank')}
              />
              <button
                className="view-full-image"
                type="button"
                onClick={() => window.open(filePreview, '_blank')}
              >
                {t("needRequest.fullImage")}
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? t("common.submitting") : t("needRequest.submit")}
        </button>
      </form>
    </div>
  );
};

export default NeedRequestForm;
