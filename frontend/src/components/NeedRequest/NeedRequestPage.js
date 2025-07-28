/**
 * NeedRequestPage Component
 * 
 * This is the main container component for the blood donation need request feature.
 * It manages navigation between different views:
 * - Request form for creating new blood donation requests
 * - Search blood functionality for finding available blood
 * - Request list for viewing user's own requests or all requests (for staff)
 * 
 * The component adapts its interface based on user role:
 * - Regular members see tabs for creating requests, searching blood, and viewing their requests
 * - Staff members only see the list of all requests
 * 
 * The component also handles URL parameters for:
 * - Refreshing the list after actions from other pages
 * - Highlighting specific requests from notifications
 * - Forcing the list view to be active
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import NeedRequestForm from "./NeedRequestForm";
import NeedRequestList from "./NeedRequestList";
import SearchBlood from "./SearchBlood";
import "./NeedRequest.css";

/**
 * NeedRequestPage component for managing blood donation requests
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object containing role and other user information
 * @returns {JSX.Element} The rendered NeedRequestPage component
 */
const NeedRequestPage = ({ user }) => {
  // Core hooks and state
  const { t } = useTranslation();  // Translation hook
  const location = useLocation();  // Location hook for URL parameters
  const [activeTab, setActiveTab] = useState("form");  // Currently active tab
  const [refreshList, setRefreshList] = useState(false);  // Flag to trigger list refresh

  /**
   * Determines if the current user is a staff member or admin
   * This affects what tabs are displayed and which one is active by default
   */
  const isStaff = user?.role === "Staff" || user?.role === "Admin";

  /**
   * Effect hook to detect the refresh parameter in URL
   * Sets refreshList to true when ?refresh is present in the URL
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("refresh")) {
      setRefreshList(true);
    }
  }, [location.search]);

  /**
   * Effect hook to set the default active tab based on user role and URL parameters
   * 
   * Sets the active tab to:
   * - "list" if there's a highlight parameter (from email notifications)
   * - "list" if tab=list is explicitly specified in the URL
   * - "list" if the user is staff/admin
   * - "form" for regular members by default
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");
    const tabParam = params.get("tab");

    // Determine which tab should be active
    if (highlightId || tabParam === "list") {
      setActiveTab("list");
    } else if (isStaff) {
      setActiveTab("list");  // Staff always see list by default
    } else {
      setActiveTab("form");  // Members see form by default
    }
  }, [location.search, isStaff]);

  /**
   * Handles successful request creation
   * Switches to the list tab and triggers a refresh
   */
  const handleRequestCreated = () => {
    setActiveTab("list");  // Switch to list view to see the newly created request
    setRefreshList(true);  // Trigger list refresh to include the new request
  };

  /**
   * Effect hook to reset the refresh flag after the list has been refreshed
   * This prevents unnecessary repeated refreshes
   */
  useEffect(() => {
    if (refreshList) {
      setRefreshList(false);  // Reset the flag after the refresh has been triggered
    }
  }, [refreshList]);

  return (
    <div className="need-request-container">
      {/* Page Header with Title, Icon and Description */}
      <div className="need-request-page-header">
        <div className="blood-icon">
          <div className="blood-drop"></div>
        </div>
        <h1>{t("needRequest.title")}</h1>
        <p>{t("needRequest.description")}</p>
      </div>

      {/* Navigation Tabs - Different tabs for different user roles */}
      <div className="need-request-tabs">
        {/* Only show Create Request and Search Blood tabs for regular members */}
        {!isStaff && (
          <>
            {/* Create Request Tab Button */}
            <button
              className={`need-request-tab ${activeTab === "form" ? "active" : ""
                }`}
              onClick={() => setActiveTab("form")}
            >
              {t("needRequest.nav.createRequest")}
            </button>

            {/* Search Blood Tab Button */}
            <button
              className={`need-request-tab ${activeTab === "search" ? "active" : ""
                }`}
              onClick={() => setActiveTab("search")}
            >
              {t("needRequest.nav.searchBlood")}
            </button>
          </>
        )}

        {/* List Tab Button - Different label based on user role */}
        <button
          className={`need-request-tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          {isStaff
            ? t("needRequest.nav.viewAllRequests")  // Staff see all requests
            : t("needRequest.nav.viewMyRequests")}  // Members see only their requests
        </button>
      </div>

      {/* Render Content Based on Active Tab */}

      {/* Request Form Tab - Only for members */}
      {activeTab === "form" && !isStaff && (
        <NeedRequestForm onRequestCreated={handleRequestCreated} />
      )}

      {/* Search Blood Tab - Only for members */}
      {activeTab === "search" && !isStaff && <SearchBlood />}

      {/* Request List Tab - For both staff and members */}
      {activeTab === "list" && (
        <NeedRequestList
          userRole={user?.role || "Member"}  // Pass the user role to control permissions
          refresh={refreshList}  // Pass refresh flag to trigger list updates
        />
      )}
    </div>
  );
};

/**
 * Export the NeedRequestPage component as the default export
 * This component serves as the main container for all blood need request functionality
 */
export default NeedRequestPage;
