import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./DonateRequestList.css";

const DonateRequestList = ({ userRole, refresh }) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [quantities, setQuantities] = useState({});

  const isStaff = userRole === "Staff" || userRole === "Admin";

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      } // Use different endpoints based on user role
      const endpoint = isStaff
        ? `${API_BASE_URL}/donateregistration`
        : `${API_BASE_URL}/donateregistration/me`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("donateRequest.fetchError"));
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refresh]);
  //approve/reject/cancel
  const handleStatusUpdate = async (id, newStatus, rejectionReason = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      const body = { status: newStatus };
      if (rejectionReason) {
        body.rejectionReason = rejectionReason;
      }

      const response = await fetch(
        `${API_BASE_URL}/donateregistration/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("donateRequest.updateError"));
      }

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      console.error("Error updating request status:", err);
    }
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      //change quantity if needed ,default 1
      const qty = quantities[id] ?? 1;
      if (!qty || qty < 1) {
        return alert(t("donateRequest.invalidQuantity"));
      }
      const res = await fetch(
        `${API_BASE_URL}/donateRegistration/${id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: qty }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t("donateRequest.updateError"));
      }
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("donateRequest.confirmDelete"))) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      const response = await fetch(`${API_BASE_URL}/donateregistration/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("donateRequest.deleteError"));
      }

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting request:", err);
    }
  };

  const toggleExpandRequest = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const handleQuantityChange = (id, value) => {
    const v = parseInt(value, 10);
    setQuantities((prev) => ({ ...prev, [id]: isNaN(v) ? "" : v }));
  };

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);
  const statusColors = {
    Pending: "var(--status-open)",
    Approved: "var(--status-approved)",
    Completed: "var(--status-completed)",
    Rejected: "var(--status-cancelled)",
    Cancelled: "var(--status-cancelled)",
  };

  if (loading) return <div className="loading">{t("common.loading")}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="donate-request-list-container">
      <div className="list-header">
        <div>
          <h2>
            {isStaff
              ? t("donateRequest.listTitleAll")
              : t("donateRequest.listTitleMy")}
            <span className={`role-indicator ${isStaff ? "staff" : "member"}`}>
              {isStaff
                ? t("admin.users.role.staff")
                : t("admin.users.role.member")}
            </span>
          </h2>
          {!isStaff && (
            <p className="member-notice">{t("donateRequest.memberNotice")}</p>
          )}
        </div>
        <div className="filter-container">
          <label>{t("donateRequest.filterByStatus")}:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            {" "}
            <option value="all">{t("donateRequest.allStatuses")}</option>
            <option value="Pending">{t("donateRequest.status.pending")}</option>
            <option value="Approved">
              {t("donateRequest.status.approved")}
            </option>
            <option value="Completed">
              {t("donateRequest.status.completed")}
            </option>
            <option value="Rejected">
              {t("donateRequest.status.rejected")}
            </option>
            <option value="Cancelled">
              {t("donateRequest.status.cancelled")}
            </option>
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
        <p className="no-requests">{t("donateRequest.noRequests")}</p>
      ) : (
        <div className="request-cards">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`request-card ${
                expandedRequestId === request._id ? "expanded" : ""
              }`}
              onClick={() => toggleExpandRequest(request._id)}
            >
              <div className="request-header">
                <div className="request-main-info">
                  <div
                    className="blood-group"
                    title={t("donateRequest.bloodGroup")}
                  >
                    {request.bloodGroup}
                  </div>
                  <div className="request-details">
                    <span className="request-by">
                      {request.userId?.name || request.createdBy?.name || "Unknown"}
                    </span>
                    <span className="donation-date">
                      {new Date(request.readyDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: statusColors[request.status] }}
                >
                  {t(`donateRequest.status.${request.status.toLowerCase()}`)}
                </div>
              </div>{" "}
              <div className="request-content">
                {(request.status === "Rejected" ||
                  request.status === "Cancelled") &&
                  request.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>{t("donateRequest.rejectionReason")}:</strong>{" "}
                      {request.rejectionReason}
                    </div>
                  )}
                <div className="component">
                  <strong>{t("donateRequest.donationType")}:</strong>{" "}
                  {t(
                    `donateRequest.component.${request.component.toLowerCase()}`
                  )}
                </div>
                {isStaff && request.status === "Pending" && (
                  <div className="admin-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request._id, "Approved");
                      }}
                      className="approve-button"
                    >
                      {t("donateRequest.markApproved")}
                    </button>{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt(
                          t("donateRequest.rejectionReason") + ":"
                        );
                        if (reason && reason.trim()) {
                          handleStatusUpdate(
                            request._id,
                            "Rejected",
                            reason.trim()
                          );
                        }
                      }}
                      className="reject-button"
                    >
                      {t("donateRequest.markRejected")}
                    </button>
                  </div>
                )}
                {isStaff && request.status === "Approved" && (
                  <div className="admin-actions">
                    <input
                      type="number"
                      min="1"
                      value={quantities[request._id] ?? 1}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(request._id, e.target.value);
                      }}
                      className="quantity-input"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(request._id, "Completed");
                      }}
                      className="complete-button"
                    >
                      {t("donateRequest.markCompleted")}
                    </button>
                  </div>
                )}{" "}
                {(isStaff || request.status === "Pending") && (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default DonateRequestList;
