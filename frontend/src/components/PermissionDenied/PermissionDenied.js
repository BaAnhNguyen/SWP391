import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PermissionDenied.css";

const PermissionDenied = () => {
  const { t } = useTranslation();

  return (
    <div className="permission-denied-container">
      <div className="permission-denied-content">
        <div className="icon-container">
          <span className="icon">🔒</span>
        </div>
        <h1>{t("permissionDenied.title", "Permission Denied")}</h1>
        <p>
          {t(
            "permissionDenied.message",
            "You do not have permission to access this page based on your role."
          )}
        </p>
        <Link to="/" className="home-button">
          {t("permissionDenied.backToHome", "Back to Home")}
        </Link>
      </div>
    </div>
  );
};

export default PermissionDenied;
