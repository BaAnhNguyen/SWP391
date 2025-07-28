/**
 * NeedRequestList Component
 * 
 * This component displays a list of blood donation need requests with filtering and search capabilities.
 * It provides different functionality based on user roles:
 * - For staff/admin: View all requests, approve, reject, assign blood units, set appointments, fulfill requests
 * - For members: View their own requests, delete requests, mark requests as completed
 * 
 * The component includes multiple modals for different actions:
 * - Reject modal: For staff to provide rejection reasons
 * - Appointment modal: For staff to set/change appointment dates
 * - Delete confirmation modal: For deleting requests
 * - Fulfill confirmation modal: For staff to mark requests as fulfilled
 * - Complete confirmation modal: For members to mark requests as completed
 */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./NeedRequestList.css";
import EnglishDeleteConfirmModal from "../common/EnglishDeleteConfirmModal";
import { useLocation } from "react-router-dom";

/**
 * NeedRequestList component displays blood donation requests with filtering, search, and action capabilities
 * 
 * @param {string} userRole - The role of the current user ('Staff', 'Admin', or 'Member')
 * @param {boolean} refresh - Flag to trigger a refresh of the request list
 * @returns {JSX.Element} The rendered NeedRequestList component
 */
const NeedRequestList = ({ userRole, refresh }) => {
  // Core hooks and state
  const { t } = useTranslation();  // Translation hook
  const navigate = useNavigate();  // Navigation hook
  const [requests, setRequests] = useState([]);  // List of all requests
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state
  const [filterStatus, setFilterStatus] = useState("all");  // Current filter status
  const [expandedRequestId, setExpandedRequestId] = useState(null);  // ID of expanded request
  const isStaff = userRole === "Staff" || userRole === "Admin";  // Flag to identify staff users

  // Reject modal state variables
  const [showRejectModal, setShowRejectModal] = useState(false);  // Controls visibility of reject modal
  const [rejectReason, setRejectReason] = useState("");  // Reason for rejection
  const [rejectRequestId, setRejectRequestId] = useState(null);  // ID of request to reject
  const [rejectError, setRejectError] = useState("");  // Error message for reject action

  // Appointment modal state variables
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);  // Controls visibility of appointment modal
  const [appointmentDate, setAppointmentDate] = useState("");  // Selected appointment date
  const [appointmentRequestId, setAppointmentRequestId] = useState(null);  // ID of request for appointment
  const [appointmentError, setAppointmentError] = useState("");  // Error message for appointment action

  // Delete confirmation modal state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // Controls visibility of delete modal
  const [deleteRequestId, setDeleteRequestId] = useState(null);  // ID of request to delete

  // Fulfill confirmation modal state variables (for staff to mark request as fulfilled)
  const [showFulfillModal, setShowFulfillModal] = useState(false);  // Controls visibility of fulfill modal
  const [fulfillRequestId, setFulfillRequestId] = useState(null);  // ID of request to mark as fulfilled

  // Fulfill success modal state variables
  const [showFulfillSuccessModal, setShowFulfillSuccessModal] = useState(false);  // Controls visibility of fulfill success modal
  const [fulfillSuccessMessage, setFulfillSuccessMessage] = useState("");  // Success message after fulfillment

  // Complete confirmation modal state variables (for members to mark request as completed)
  const [showCompleteModal, setShowCompleteModal] = useState(false);  // Controls visibility of complete modal
  const [completeRequestId, setCompleteRequestId] = useState(null);  // ID of request to mark as completed

  // Complete success modal state variables
  const [showCompleteSuccessModal, setShowCompleteSuccessModal] = useState(false);  // Controls visibility of complete success modal

  // Email notification highlighting functionality
  const location = useLocation();  // Get current location for URL parameters
  const [highlightId, setHighlightId] = useState(null);  // ID of request to highlight (from email links)

  /**
   * Effect hook to handle request highlighting from email links
   * This highlights a specific request when accessed via email notification links with a highlight parameter
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");
    if (highlight) {
      // Store the ID to highlight
      setHighlightId(highlight);
      // Auto expand the highlighted request
      setExpandedRequestId(highlight);

      // Use setTimeout to ensure the DOM is ready before scrolling
      setTimeout(() => {
        const element = document.getElementById(`request-${highlight}`);
        if (element) {
          // Scroll the highlighted element into view with smooth animation
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Add highlighting class for visual feedback
          element.classList.add("highlighted");
          // Remove highlighting after 3 seconds
          setTimeout(() => element.classList.remove("highlighted"), 3000);
        }
      }, 200); // Small delay after render to ensure the element exists
    }
  }, [location.search]);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");  // Search term for filtering by creator name

  /**
   * Fetches blood need requests from the API
   * Uses different endpoints based on user role:
   * - Staff/Admin: Fetches all requests
   * - Members: Fetches only the user's own requests
   */
  const fetchRequests = useCallback(async () => {
    setLoading(true);  // Start loading
    setError(null);    // Clear any previous errors

    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Select appropriate endpoint based on user role
      const endpoint = isStaff
        ? `${API_BASE_URL}/needrequest/all`  // Staff see all requests
        : `${API_BASE_URL}/needrequest/my`;  // Members see only their own requests

      // Make API request with authentication
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle unsuccessful response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.fetchError"));
      }

      // Set the requests state with the fetched data
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      // Handle any errors
      setError(err.message);
      console.error("Error fetching requests:", err);
    } finally {
      // Turn off loading state regardless of outcome
      setLoading(false);
    }
  }, [t, isStaff]);

  /**
   * Effect hook to fetch requests when component mounts or refresh flag changes
   */
  useEffect(() => {
    fetchRequests();
  }, [refresh, fetchRequests]);

  // ----------- Handler functions -----------

  /**
   * Updates the status of a blood need request
   * 
   * @param {string} id - The ID of the request to update
   * @param {string} newStatus - The new status to set
   */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to update status
      const response = await fetch(`${API_BASE_URL}/needrequest/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Handle unsuccessful response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.updateError"));
      }

      // Refresh the request list to show updated status
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Opens the delete confirmation modal
   * 
   * @param {string} id - The ID of the request to delete
   */
  const openDeleteModal = (id) => {
    setDeleteRequestId(id);
    setShowDeleteModal(true);
  };

  /**
   * Closes the delete confirmation modal and resets state
   */
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteRequestId(null);
  };

  /**
   * Handles the delete action after confirmation
   * Deletes the request from the database and refreshes the list
   */
  const handleDelete = async () => {
    if (!deleteRequestId) return;

    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to delete the request
      const response = await fetch(
        `${API_BASE_URL}/needrequest/${deleteRequestId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle unsuccessful response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.deleteError"));
      }

      // Refresh the request list and close the modal
      fetchRequests();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // ----- Reject modal handlers -----

  /**
   * Opens the reject modal and initializes its state
   * 
   * @param {string} requestId - ID of the request to reject
   */
  const openRejectModal = (requestId) => {
    setRejectRequestId(requestId);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };

  /**
   * Closes the reject modal and resets its state
   */
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectRequestId(null);
    setRejectReason("");
    setRejectError("");
  };

  /**
   * Handles the submission of the reject form
   * Sends the rejection reason to the API and updates the request status
   * 
   * @param {Event} e - Form submission event
   */
  const handleRejectSubmit = async (e) => {
    e.preventDefault();

    // Validate that a rejection reason was provided
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      setLoading(true);

      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to reject the request
      const response = await fetch(
        `${API_BASE_URL}/needrequest/reject/${rejectRequestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      );

      // Parse response data
      const result = await response.json();

      // Handle unsuccessful response
      if (!response.ok)
        throw new Error(result.message || t("needRequest.rejectError"));

      // Show success message and update UI
      alert(result.message || "Đã từ chối đơn!");
      fetchRequests();
      closeRejectModal();
    } catch (err) {
      // Handle errors
      setRejectError(err.message);
    } finally {
      // Turn off loading state regardless of outcome
      setLoading(false);
    }
  };

  // ----- Appointment modal handlers -----

  /**
   * Opens the appointment modal and initializes its state
   * 
   * @param {string} requestId - ID of the request to set/change appointment for
   * @param {string} currentDate - Current appointment date (if exists)
   */
  const openAppointmentModal = (requestId, currentDate) => {
    setAppointmentRequestId(requestId);
    // Format the current date for the datetime-local input if available
    setAppointmentDate(currentDate ? currentDate.substring(0, 16) : "");
    setAppointmentError("");
    setShowAppointmentModal(true);
  };

  /**
   * Closes the appointment modal and resets its state
   */
  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setAppointmentRequestId(null);
    setAppointmentDate("");
    setAppointmentError("");
  };

  /**
   * Handles the submission of the appointment form
   * Updates the appointment date for the request in the database
   * 
   * @param {Event} e - Form submission event
   */
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    // Validate that a date was selected
    if (!appointmentDate) {
      setAppointmentError("Vui lòng chọn ngày giờ hẹn!");
      return;
    }

    try {
      setLoading(true);

      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to update the appointment date
      const response = await fetch(
        `${API_BASE_URL}/needrequest/${appointmentRequestId}/appointment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ appointmentDate }),
        }
      );

      // Parse response data
      const result = await response.json();

      // Handle unsuccessful response
      if (!response.ok) throw new Error(result.message || "Đổi ngày thất bại!");

      // Show success message and update UI
      alert(result.message || "Đã đổi ngày hẹn thành công!");
      fetchRequests();
      closeAppointmentModal();
    } catch (err) {
      // Handle errors
      setAppointmentError(err.message);
    } finally {
      // Turn off loading state regardless of outcome
      setLoading(false);
    }
  };

  // ----- Other handlers -----

  /**
   * Navigates to the blood unit assignment page for a specific request
   * Used by staff to assign blood units to a pending request
   * 
   * @param {string} id - ID of the request to assign blood units to
   */
  const handleAssign = (id) => {
    navigate(`/staff/assign-blood-units/${id}`);
  };

  // ----- Fulfill modal handlers -----

  /**
   * Opens the fulfill confirmation modal
   * 
   * @param {string} requestId - ID of the request to be fulfilled
   */
  const openFulfillModal = (requestId) => {
    setFulfillRequestId(requestId);
    setShowFulfillModal(true);
  };

  /**
   * Closes the fulfill confirmation modal
   */
  const closeFulfillModal = () => {
    setShowFulfillModal(false);
    setFulfillRequestId(null);
  };

  /**
   * Closes the fulfill success modal
   * This modal is shown after a successful fulfillment operation
   */
  const closeFulfillSuccessModal = () => {
    setShowFulfillSuccessModal(false);
    setFulfillSuccessMessage("");
  };

  // ----- Complete modal handlers -----

  /**
   * Opens the complete confirmation modal
   * Used by members to mark a fulfilled request as completed
   * 
   * @param {string} requestId - ID of the request to be marked as completed
   */
  const openCompleteModal = (requestId) => {
    setCompleteRequestId(requestId);
    setShowCompleteModal(true);
  };

  /**
   * Closes the complete confirmation modal
   */
  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setCompleteRequestId(null);
  };

  /**
   * Closes the complete success modal
   * This modal is shown after a successful completion operation
   */
  const closeCompleteSuccessModal = () => {
    setShowCompleteSuccessModal(false);
  };

  /**
   * Handles the fulfillment of a blood need request
   * Called when staff confirms fulfillment in the modal
   * Updates the request status to "Fulfilled" in the database
   * 
   * @param {string} id - ID of the request to fulfill
   */
  const handleFulfillRequest = async (id) => {
    try {
      setLoading(true);

      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to fulfill the request
      const response = await fetch(
        `${API_BASE_URL}/needrequest/fulfill/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle unsuccessful response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.fulfillError"));
      }

      // Parse successful response data
      const result = await response.json();

      // Close the confirmation modal and show success modal with result message
      closeFulfillModal();
      setFulfillSuccessMessage(result.message);
      setShowFulfillSuccessModal(true);

      // Refresh the requests list to update UI
      fetchRequests();
    } catch (err) {
      // Handle errors
      setError(err.message);
      closeFulfillModal();
    } finally {
      // Turn off loading state regardless of outcome
      setLoading(false);
    }
  };

  /**
   * Handles marking a request as completed
   * Called when a member confirms completion in the modal
   * Updates the request status to "Completed" in the database
   * 
   * @param {string} id - ID of the request to mark as completed
   */
  const handleCompleteRequest = async (id) => {
    try {
      setLoading(true);

      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      // Make API request to complete the request
      const completeUrl = `${API_BASE_URL}/needrequest/complete/${id}`;
      const response = await fetch(completeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Handle unsuccessful response
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.completeError"));
      }

      // Parse successful response data
      const result = await response.json();

      // Close the confirmation modal and show success modal
      closeCompleteModal();
      setShowCompleteSuccessModal(true);

      // Refresh the requests list to update UI
      fetchRequests();
    } catch (err) {
      // Handle errors
      setError(err.message);
      closeCompleteModal();
    } finally {
      // Turn off loading state regardless of outcome
      setLoading(false);
    }
  };

  /**
   * Toggles the expansion state of a request card
   * 
   * @param {string} id - ID of the request to toggle expansion
   */
  const toggleExpandRequest = (id) => {
    // If already expanded, collapse it; otherwise expand it
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  /**
   * Gets the translated name of a blood component
   * 
   * @param {string} component - The blood component type key
   * @returns {string} - Translated name of the component
   */
  const getComponentTranslation = (component) => {
    // Map component keys to their translation keys
    const componentMap = {
      WholeBlood: t("bloodStorage.wholeBlood"),
      Plasma: t("bloodStorage.plasma"),
      Platelets: t("bloodStorage.platelets"),
      RedCells: t("bloodStorage.redCells"),
    };
    // Return the translated name or the original component name if not found
    return componentMap[component] || component;
  };

  // ----- Filter and search logic -----

  /**
   * First filter requests by status
   * "all" shows all requests, otherwise filters by specific status
   */
  const statusFiltered =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  /**
   * Then filter by search term (creator's name)
   * If search term is provided, filter by name; otherwise use status-filtered results
   */
  const filteredRequests = searchTerm
    ? statusFiltered.filter(
      (request) =>
        request.createdBy &&
        request.createdBy.name &&
        request.createdBy.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    : statusFiltered;

  /**
   * Status color mapping for visual indicators
   * Maps each status to its corresponding CSS color variable
   */
  const statusColors = {
    Open: "var(--status-open)",
    Pending: "var(--status-open)",
    Assigned: "var(--status-assigned)",
    Fulfilled: "var(--status-fulfilled)",
    Completed: "var(--status-completed)",
    Rejected: "var(--status-cancelled)",
    Expired: "var(--status-expired)",
  };

  if (loading) return <div className="loading">{t("common.loading")}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="need-request-list-container">
      <div className="list-header">
        <div>
          <h2>
            {isStaff
              ? t("needRequest.listTitleAll")
              : t("needRequest.listTitleMy")}
            <span className={`role-indicator ${isStaff ? "staff" : "member"}`}>
              {isStaff ? t("common.role.staff") : t("common.role.member")}
            </span>
          </h2>
          {!isStaff && (
            <p className="member-notice">{t("needRequest.memberNotice")}</p>
          )}
        </div>
        <div className="filters-row">
          <div className="filter-container">
            <label>{t("needRequest.filterByStatus")}:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">{t("needRequest.allStatuses")}</option>
              <option value="Pending">{t("needRequest.status.pending")}</option>
              <option value="Assigned">
                {t("needRequest.status.assigned")}
              </option>
              <option value="Fulfilled">
                {t("needRequest.status.fulfilled")}
              </option>
              <option value="Completed">
                {t("needRequest.status.completed")}
              </option>
              <option value="Rejected">
                {t("needRequest.status.rejected")}
              </option>
              <option value="Expired">{t("needRequest.status.expired")}</option>
            </select>
            <button
              onClick={fetchRequests}
              className="refresh-button"
              title={t("common.refresh")}
            >
              ↻
            </button>
          </div>
          <div className="search-container">
            <label htmlFor="name-search">
              {t("needRequest.searchByName")}:
            </label>
            <input
              id="name-search"
              type="text"
              className="name-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("needRequest.searchNamePlaceholder")}
            />
            {searchTerm && (
              <button
                className="clear-search-button"
                onClick={() => setSearchTerm("")}
                title={t("common.clear")}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="no-requests">{t("needRequest.noRequests")}</p>
      ) : (
        <div className="request-cards">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              id={`request-${request._id}`}
              className={`request-card ${expandedRequestId === request._id ? "expanded" : ""
                }`}
              onClick={() => toggleExpandRequest(request._id)}
            >
              <div className="request-header">
                <div className="request-main-info">
                  <div
                    className="blood-group"
                    title={t("needRequest.bloodGroup")}
                  >
                    {request.bloodGroup}
                  </div>
                  <div className="request-details">
                    <span className="request-by">
                      {request.createdBy?.name || "Unknown"}
                    </span>
                    <span className="units">
                      {request.units}{" "}
                      {request.units === 1
                        ? t("needRequest.unit")
                        : t("needRequest.units")}
                    </span>
                  </div>
                </div>
                <div
                  className={`status-badge`}
                  style={{ backgroundColor: statusColors[request.status] }}
                >
                  {t(`needRequest.status.${request.status.toLowerCase()}`)}
                </div>
              </div>

              <div className="request-content">
                <span className="component">
                  <strong>{t("needRequest.bloodRequestType")}:</strong>{" "}
                  {getComponentTranslation(request.component)}
                </span>
                <div className="request-reason">
                  <strong>{t("needRequest.reason")}:</strong> {request.reason}
                </div>

                {/* Hiển thị lý do từ chối nếu request bị rejected */}
                {request.status === "Rejected" && (
                  <div className="rejection-reason">
                    <strong>
                      {t("needRequest.rejectionReason") || "Lý do từ chối"}:
                    </strong>{" "}
                    {request.rejectionReason ||
                      request.rejectReason ||
                      request.reason ||
                      "Không có lý do cụ thể"}
                  </div>
                )}

                {/* Ngày tạo đơn */}
                <div className="request-created">
                  <strong>
                    {t("needRequest.createdDate") || "Ngày tạo đơn"}:
                  </strong>{" "}
                  {new Date(request.createdAt).toLocaleString()}
                </div>

                {/* Ngày hẹn nếu đã có */}
                {request.appointmentDate &&
                  ["Assigned", "Fulfilled", "Completed"].includes(
                    request.status
                  ) && (
                    <div className="request-appointment">
                      <strong>
                        {t("needRequest.appointmentDate") || "Ngày hẹn"}:
                      </strong>{" "}
                      {new Date(request.appointmentDate).toLocaleString()}
                    </div>
                  )}

                {request.attachment && (
                  <div className="attachment-container">
                    <strong>{t("needRequest.attachment")}:</strong>
                    <div className="image-preview">
                      {request.attachment.toLowerCase().endsWith(".jpg") ||
                        request.attachment.toLowerCase().endsWith(".jpeg") ||
                        request.attachment.toLowerCase().endsWith(".png") ? (
                        <>
                          <img
                            src={request.attachment}
                            alt="Request attachment"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(request.attachment, "_blank");
                            }}
                          />
                          <button
                            className="view-full-image"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(request.attachment, "_blank");
                            }}
                          >
                            {t("needRequest.fullImage") || "View Image"}
                          </button>
                        </>
                      ) : (
                        <a
                          href={request.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t("needRequest.viewAttachment")}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="request-action-buttons">
                  {/* Staff actions cho Pending hoặc Assigned */}
                  {isStaff &&
                    (request.status === "Pending" ||
                      request.status === "Assigned") && (
                      <>
                        {/* Pending thì có nút giao túi máu */}
                        {request.status === "Pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssign(request._id);
                            }}
                            className="assign-button"
                          >
                            {t("needRequest.assign")}
                          </button>
                        )}

                        {/* Nút từ chối, luôn có cho Pending/Assigned */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRejectModal(request._id);
                          }}
                          className="reject-button"
                          style={{ marginLeft: 8 }}
                        >
                          {t("needRequest.reject")}
                        </button>

                        {/* Assigned mới có nút đổi ngày hẹn và nút fulfill */}
                        {request.status === "Assigned" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAppointmentModal(
                                  request._id,
                                  request.appointmentDate
                                    ? new Date(request.appointmentDate)
                                      .toISOString()
                                      .slice(0, 16)
                                    : ""
                                );
                              }}
                              className="edit-appointment-button"
                              style={{ marginLeft: 8 }}
                            >
                              Đổi ngày hẹn
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openFulfillModal(request._id);
                              }}
                              className="fulfill-button"
                              style={{ marginLeft: 8 }}
                            >
                              {t("needRequest.fulfill")}
                            </button>
                          </>
                        )}

                        {/* Nút xóa - disabled for Assigned and Fulfilled */}
                        {request.status !== "Assigned" &&
                          request.status !== "Fulfilled" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteRequestId(request._id);
                                setShowDeleteModal(true);
                              }}
                              className="delete-button"
                              style={{ marginLeft: 8 }}
                            >
                              {t("common.delete")}
                            </button>
                          )}
                      </>
                    )}

                  {/* Staff action cho Expired, Rejected (Fulfilled removed) */}
                  {isStaff &&
                    (request.status === "Expired" ||
                      request.status === "Rejected") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(request._id);
                        }}
                        className="delete-button"
                      >
                        {t("common.delete")}
                      </button>
                    )}

                  {/* Member action cho Open */}
                  {!isStaff && request.status === "Open" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(request._id);
                      }}
                      className="delete-button"
                    >
                      {t("common.delete")}
                    </button>
                  )}

                  {/* Member action cho Fulfilled */}
                  {!isStaff && request.status === "Fulfilled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCompleteModal(request._id);
                      }}
                      className="complete-button"
                    >
                      {t("needRequest.markCompleted")}
                    </button>
                  )}

                  {/* Delete button for completed requests */}
                  {request.status === "Completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(request._id);
                      }}
                      className="delete-button"
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal từ chối */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Lý do từ chối</h3>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do từ chối"
                autoFocus
              />
              {rejectError && <div className="field-error">{rejectError}</div>}
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={closeRejectModal}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </button>
                <button type="submit" className="reject-button">
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal đổi ngày hẹn */}
      {showAppointmentModal && (
        <div className="modal-overlay" onClick={closeAppointmentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Đổi ngày hẹn</h3>
            <form onSubmit={handleAppointmentSubmit}>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
              {appointmentError && (
                <div className="field-error">{appointmentError}</div>
              )}
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  onClick={closeAppointmentModal}
                  style={{ marginRight: 8 }}
                >
                  Hủy
                </button>
                <button type="submit" className="assign-button">
                  Xác nhận đổi ngày
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <EnglishDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
      />

      {/* Fulfill Confirmation Modal */}
      {showFulfillModal && (
        <div className="modal-overlay" onClick={closeFulfillModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("needRequest.confirmFulfillTitle")}</h3>
            <div className="modal-body">
              <div className="simple-confirm-message">
                <p>{t("needRequest.confirmUpdateToFulfilled")}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={closeFulfillModal}
                className="cancel-button"
                style={{ marginRight: 8 }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => handleFulfillRequest(fulfillRequestId)}
                className="fulfill-button"
                disabled={loading}
              >
                {loading
                  ? t("common.processing")
                  : t("needRequest.confirmFulfillButton")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill Success Modal */}
      {showFulfillSuccessModal && (
        <div className="modal-overlay" onClick={closeFulfillSuccessModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("needRequest.fulfillSuccessTitle")}</h3>
            <div className="modal-body">
              <div className="success-info">
                <div className="success-icon">✅</div>
                <div className="success-message">{fulfillSuccessMessage}</div>
                <div className="success-details">
                  <p>{t("needRequest.fulfillSuccessDetails")}</p>
                  <ul>
                    <li>✓ {t("needRequest.statusUpdated")}</li>
                    <li>✓ {t("needRequest.inventoryUpdated")}</li>
                    <li>✓ {t("needRequest.memberNotified")}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={closeFulfillSuccessModal}
                className="success-button"
              >
                {t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={closeCompleteModal}>
          <div
            className="modal-content simple-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{t("needRequest.confirmCompleteTitle")}</h3>
            <div className="modal-body">
              <p className="simple-confirm-message">
                {t("needRequest.confirmComplete")}
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => handleCompleteRequest(completeRequestId)}
                className="confirm-complete-button"
                disabled={loading}
              >
                {loading ? t("common.processing") : t("common.confirm")}
              </button>
              <button
                type="button"
                onClick={closeCompleteModal}
                className="cancel-button"
                disabled={loading}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Success Modal */}
      {showCompleteSuccessModal && (
        <div className="modal-overlay" onClick={closeCompleteSuccessModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("needRequest.completeSuccessTitle")}</h3>
            <div className="modal-body">
              <div className="success-info">
                <div className="success-icon">✅</div>
                <div className="success-message">
                  {t("needRequest.completeSuccessMessage")}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={closeCompleteSuccessModal}
                className="success-button"
              >
                {t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeedRequestList;
