import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./NeedRequestList.css";

const NeedRequestList = ({ userRole, refresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const isStaff = userRole === "Staff" || userRole === "Admin";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      // Use different endpoints based on user role
      const endpoint = isStaff
        ? `${API_BASE_URL}/needrequest/all`
        : `${API_BASE_URL}/needrequest/my`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.fetchError"));
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  }, [t, isStaff]);

  useEffect(() => {
    fetchRequests();
  }, [refresh, fetchRequests]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      const response = await fetch(`${API_BASE_URL}/needrequest/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.updateError"));
      }

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      console.error("Error updating request status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("needRequest.confirmDelete"))) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      const response = await fetch(`${API_BASE_URL}/needrequest/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.deleteError"));
      }

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting request:", err);
    }
  };

  const handleAssign = (id) => {
    // Navigate to the dedicated assign blood units page
    navigate(`/staff/assign-blood-units/${id}`);
  };

  const handleFulfillRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.fulfillError"));
      }

      const result = await response.json();
      alert(result.message); // Show success message
      fetchRequests(); // Refresh the list
    } catch (err) {
      setError(err.message);
      console.error("Error fulfilling request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      // Debug logging
      console.log(`API_BASE_URL value: ${API_BASE_URL}`);
      console.log(`Attempting to complete request with ID: ${id}`);

      // Make sure we have the correct path format
      const completeUrl = `${API_BASE_URL}/needrequest/complete/${id}`;
      console.log(`Complete URL: ${completeUrl}`);

      // Make the request with proper error handling
      const response = await fetch(completeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch(error => {
        console.error("Network error during complete request:", error);
        throw new Error("Network error: " + error.message);
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.completeError"));
      }

      const result = await response.json();
      alert(result.message); // Show success message
      fetchRequests(); // Refresh the list
    } catch (err) {
      setError(err.message);
      console.error("Error completing request:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandRequest = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const getComponentTranslation = (component) => {
    const componentMap = {
      WholeBlood: t("bloodStorage.wholeBlood"),
      Plasma: t("bloodStorage.plasma"),
      Platelets: t("bloodStorage.platelets"),
      RedCells: t("bloodStorage.redCells"),
    };
    return componentMap[component] || component;
  };

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  const statusColors = {
    Open: "var(--status-open)",
    Pending: "var(--status-open)",
    Assigned: "var(--status-assigned)",
    Matched: "var(--status-matched)",
    Fulfilled: "var(--status-fulfilled)",
    Completed: "var(--status-completed)",
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
        <div className="filter-container">
          <label>{t("needRequest.filterByStatus")}:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">{t("needRequest.allStatuses")}</option>
            <option value="Open">{t("needRequest.status.open")}</option>
            <option value="Assigned">{t("needRequest.status.assigned")}</option>
            <option value="Matched">{t("needRequest.status.matched")}</option>
            <option value="Fulfilled">
              {t("needRequest.status.fulfilled")}
            </option>
            <option value="Completed">
              {t("needRequest.status.completed")}
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
      </div>

      {filteredRequests.length === 0 ? (
        <p className="no-requests">{t("needRequest.noRequests")}</p>
      ) : (
        <div className="request-cards">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
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
                  className={`status-badge ${request.status === "Matched" ? "status-badge-matched" : ""}`}
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
                            {t("needRequest.fullImage")}
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

                {isStaff && request.status === "Open" && (
                  <div className="admin-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request._id, "Fulfilled");
                      }}
                      className="fulfill-button"
                    >
                      {t("needRequest.markFulfilled")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request._id, "Expired");
                      }}
                      className="expire-button"
                    >
                      {t("needRequest.markExpired")}
                    </button>
                  </div>
                )}

                <div className="request-action-buttons">
                  {/* Staff actions for Open/Pending requests */}
                  {isStaff &&
                    (request.status === "Open" ||
                      request.status === "Pending") && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssign(request._id);
                          }}
                          className="assign-button"
                        >
                          {t("needRequest.assign")}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(request._id);
                          }}
                          className="delete-button"
                        >
                          {t("common.delete")}
                        </button>
                      </>
                    )}

                  {/* Staff action for Assigned requests */}
                  {isStaff && request.status === "Assigned" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t("needRequest.confirmFulfill"))) {
                          handleFulfillRequest(request._id);
                        }
                      }}
                      className="fulfill-button"
                    >
                      {t("needRequest.markFulfilled")}
                    </button>
                  )}

                  {/* Member action for Fulfilled requests */}
                  {!isStaff && request.status === "Fulfilled" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t("needRequest.confirmComplete"))) {
                          handleCompleteRequest(request._id);
                        }
                      }}
                      className="complete-button"
                    >
                      {t("needRequest.markCompleted")}
                    </button>
                  )}

                  {/* Delete button for completed requests - available to both staff and members */}
                  {request.status === "Completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(request._id);
                      }}
                      className="delete-button"
                    >
                      {t("common.delete")}
                    </button>
                  )}

                  {/* Staff delete button for Fulfilled, Assigned, Expired requests */}
                  {isStaff &&
                    (request.status === "Fulfilled" ||
                      request.status === "Expired" ||
                      request.status === "Rejected") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(t("needRequest.confirmDelete"))) {
                            handleDelete(request._id);
                          }
                        }}
                        className="delete-button"
                      >
                        {t("common.delete")}
                      </button>
                    )}

                  {/* Member action for Open requests */}
                  {!isStaff && request.status === "Open" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(request._id);
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
    </div>
  );
};

export default NeedRequestList;
