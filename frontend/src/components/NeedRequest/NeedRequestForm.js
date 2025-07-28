// Import necessary libraries and components
import React, { useState, useEffect } from "react"; // React core libraries and hooks
import { useTranslation } from "react-i18next"; // For internationalization/multiple language support
import { API_BASE_URL } from "../../config"; // API endpoint configuration
import "./NeedRequestForm.css"; // Component-specific styles

// NeedRequestForm component - form for creating blood need requests
// onRequestCreated: callback function to execute after successfully creating a request
const NeedRequestForm = ({ onRequestCreated }) => {
  // Initialize translation function
  const { t } = useTranslation();

  // Form data state for blood request
  const [formData, setFormData] = useState({
    bloodGroup: "", // Blood type (A+, B-, etc.)
    component: "", // Component type (WholeBlood, Plasma, etc.)
    units: 1,      // Number of units needed (default: 1)
    reason: "",    // Reason for the blood request
  });

  // File handling states
  const [file, setFile] = useState(null);           // Selected file to upload (attachment)
  const [filePreview, setFilePreview] = useState(null); // Preview of selected image

  // UI state management
  const [loading, setLoading] = useState(false);    // Loading state for form submission
  const [error, setError] = useState(null);         // Error messages
  const [success, setSuccess] = useState(false);    // Success status after submission

  // Available blood groups options
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Blood component options with translations
  const components = [
    { value: "WholeBlood", label: t("common.component.wholeblood") },
    { value: "Plasma", label: t("common.component.plasma") },
    { value: "Platelets", label: t("common.component.platelets") },
    { value: "RedCells", label: t("common.component.redcells") },
  ];

  // State to track how many requests the user has made today
  const [todayCount, setTodayCount] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target; // Extract field name and value from event
    setFormData((prev) => ({
      ...prev, // Keep all previous form data
      // Convert units to number, keep other fields as string
      [name]: name === "units" ? parseInt(value) : value,
    }));
  };

  // Handle file uploads for attachments (medical documents, etc.)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the first selected file
    setFile(selectedFile); // Update file state

    // Generate preview only for image files
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")
    ) {
      const reader = new FileReader();
      // When file is loaded, set the preview data
      reader.onload = (e) => {
        setFilePreview(e.target.result); // Base64 data URL of the image
      };
      reader.readAsDataURL(selectedFile); // Convert file to data URL
    } else {
      setFilePreview(null); // No preview for non-image files
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to show user the form is processing
    setError(null); // Clear any previous errors
    setSuccess(false); // Reset success status

    try {
      // Get authentication token from local storage
      const token = localStorage.getItem("token");
      if (!token) {
        // If no token is found, user is not authenticated
        throw new Error(t("common.notAuthenticated"));
      }

      // Prepare data for submission using FormData (for multipart/form-data including file upload)
      const formDataToSend = new FormData();
      formDataToSend.append("bloodGroup", formData.bloodGroup); // Add blood group
      formDataToSend.append("component", formData.component); // Add blood component
      formDataToSend.append("units", formData.units); // Add requested units
      formDataToSend.append("reason", formData.reason); // Add reason for request

      // Only add attachment if file was selected
      if (file) {
        formDataToSend.append("attachment", file);
      }

      // Send POST request to API to create new blood request
      const response = await fetch(`${API_BASE_URL}/needrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add auth token to headers
        },
        body: formDataToSend, // Send form data including file
      });

      // Handle error responses
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.submitError"));
      }

      // Handle successful submission
      setSuccess(true); // Show success message

      // Reset form to initial state
      setFormData({
        bloodGroup: "",
        component: "",
        units: 1,
        reason: "",
      });
      setFile(null); // Clear selected file
      setFilePreview(null); // Clear file preview

      // Execute callback if provided (to notify parent component)
      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (err) {
      // Handle any errors that occurred
      setError(err.message); // Display error to user
      console.error("Error submitting request:", err);
    } finally {
      // Always set loading to false when done, regardless of success/failure
      setLoading(false);
    }
  };

  // Fetch user's daily request count on component mount
  useEffect(() => {
    // Function to fetch how many blood requests the user has made today
    const fetchTodayCount = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem("token");

        // Call API endpoint to get today's request count for the current user
        const res = await fetch(`${API_BASE_URL}/needRequest/countToday`, {
          headers: { Authorization: `Bearer ${token}` }, // Authenticate request
        });

        // Parse response data
        const data = await res.json();

        // Update state with count (used to limit daily requests)
        setTodayCount(data.count);
      } catch (err) {
        console.error("Error fetching today's request count:", err);
      }
    };

    // Execute the fetch function when component mounts
    fetchTodayCount();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="need-request-form-container">
      {/* Form title and description */}
      <h2>{t("needRequest.title")}</h2>
      <p className="form-description">{t("needRequest.description")}</p>

      {/* Success message - shown only after successful submission */}
      {success && (
        <div className="success-message">{t("needRequest.successMessage")}</div>
      )}

      {/* Error message - shown if submission failed */}
      {error && <div className="error-message">{error}</div>}

      {/* Daily request limit notification */}
      {todayCount !== null && (
        <p
          style={{
            marginTop: "1rem",
            // Text turns red when user reaches daily limit (3 requests)
            color: todayCount >= 3 ? "red" : "inherit",
          }}
        >
          {/* Shows how many requests user has made today out of 3 allowed */}
          {t("needRequest.todayCount", { count: todayCount })}
        </p>
      )}

      {/* Main form - uses multipart/form-data encoding for file uploads */}
      <form
        onSubmit={handleSubmit}
        className="need-request-form"
        encType="multipart/form-data"
      >
        {/* Blood Group selection field */}
        <div className="form-group">
          <label htmlFor="bloodGroup">
            {t("needRequest.bloodGroup")}
            <span className="required">*</span> {/* Asterisk indicates required field */}
          </label>
          <select
            id="bloodGroup"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
            className="form-control"
          >
            {/* Default empty option with prompt */}
            <option value="">{t("needRequest.selectBloodGroup")}</option>
            {/* Generate options for all blood groups */}
            {bloodGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Component selection field */}
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
            {/* Default empty option with prompt */}
            <option value="">{t("needRequest.selectComponent")}</option>
            {/* Generate options for all blood components with translated labels */}
            {components.map((comp) => (
              <option key={comp.value} value={comp.value}>
                {comp.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number of units required field */}
        <div className="form-group">
          <label htmlFor="units">
            {t("needRequest.units")}
            <span className="required">*</span>
          </label>
          <input
            type="number"
            id="units"
            name="units"
            min="1" /* Minimum 1 unit required */
            value={formData.units}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Reason for blood request field */}
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
            rows="4" /* Height of 4 rows */
            placeholder={t("needRequest.reasonPlaceholder")} /* Translated placeholder */
          />
        </div>

        {/* Optional attachment field (medical documents) */}
        <div className="form-group">
          <label htmlFor="attachment">{t("needRequest.attachment")}</label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            accept="image/jpeg,image/png,image/jpg,application/pdf" /* Limit file types */
            className="form-control"
            onChange={handleFileChange}
          />

          {/* Preview section for image files - only shown when image is selected */}
          {filePreview && (
            <div className="file-preview">
              <h4>{t("needRequest.attachment")}</h4>
              {/* Image preview that can be clicked to view full size */}
              <img
                src={filePreview}
                alt="Preview"
                className="attachment-preview"
                onClick={() => window.open(filePreview, "_blank")}
              />
              {/* Button to view full-size image in new tab */}
              <button
                className="view-full-image"
                type="button"
                onClick={() => window.open(filePreview, "_blank")}
              >
                {t("needRequest.fullImage")}
              </button>
            </div>
          )}
        </div>

        {/* Submit button - disabled during form submission */}
        <button type="submit" className="submit-button" disabled={loading}>
          {/* Button text changes based on loading state */}
          {loading ? t("common.submitting") : t("needRequest.submit")}
        </button>
      </form>
    </div>
  );
};

// Export the component for use in other parts of the application
export default NeedRequestForm;
