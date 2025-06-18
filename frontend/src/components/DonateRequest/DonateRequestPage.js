import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DonateRequestForm from "./DonateRequestForm";
import DonateRequestList from "./DonateRequestList";
import MedicalHealth from "../MedicalHealth/MedicalHealth";
import "./DonateRequest.css";

const DonateRequestPage = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("form");
  const [refreshList, setRefreshList] = useState(false);

  // Determine if the user is a staff member or admin
  const isStaff = user?.role === "Staff" || user?.role === "Admin";

  // Handle successful request creation to refresh the list
  const handleRequestCreated = () => {
    if (isStaff) {
      setActiveTab("list");
      setRefreshList(true);
    }
  };

  // Reset the refresh flag after the list has been refreshed
  useEffect(() => {
    if (refreshList) {
      setRefreshList(false);
    }
  }, [refreshList]);

  return (
    <div className="donate-request-container">
      <div className="donate-request-page-header">
        <div className="blood-icon">
          <div className="blood-drop"></div>
        </div>
        <h1>{t("donateRequest.title")}</h1>
        <p>{t("donateRequest.description")}</p>
      </div>{" "}
      <div className="donate-request-tabs">
        <button
          className={`donate-request-tab ${
            activeTab === "form" ? "active" : ""
          }`}
          onClick={() => setActiveTab("form")}
        >
          {t("donateRequest.nav.createRequest")}
        </button>
        <button
          className={`donate-request-tab ${
            activeTab === "list" ? "active" : ""
          }`}
          onClick={() => setActiveTab("list")}
        >
          {isStaff
            ? t("donateRequest.nav.viewAllRequests")
            : t("donateRequest.nav.viewMyRequests")}
        </button>
        {isStaff && (
          <button
            className={`donate-request-tab ${
              activeTab === "medicalHealth" ? "active" : ""
            }`}
            onClick={() => setActiveTab("medicalHealth")}
          >
            {t("donateRequest.nav.medicalHealth", "Medical Health")}
          </button>
        )}
      </div>{" "}
      {activeTab === "form" && (
        <DonateRequestForm onRequestCreated={handleRequestCreated} />
      )}
      {activeTab === "list" && (
        <DonateRequestList
          userRole={user?.role || "Member"}
          refresh={refreshList}
        />
      )}
      {activeTab === "medicalHealth" && isStaff && <MedicalHealth />}
    </div>
  );
};

export default DonateRequestPage;
