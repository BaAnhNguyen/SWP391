import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./DonateRequestList.css";

const DonateRequestHistory = ({ user }) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [showMedicalQuestions, setShowMedicalQuestions] = useState(null);

  const isStaff = user?.role === "Staff" || user?.role === "Admin";

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
      console.log("Received donation registrations:", data);
      // Debug log để kiểm tra screening của mỗi đơn đăng ký
      data.forEach((reg, index) => {
        console.log(
          `Registration ${index + 1} - ID: ${reg._id}, Has screening: ${
            reg.screening ? reg.screening.length : "undefined"
          }`
        );
      });
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
  }, []);
  const handleStatusUpdate = async (id, newStatus, rejectionReason = null) => {
    if (!isStaff) return;

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

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  const statusColors = {
    Pending: "var(--status-open)",
    Approved: "var(--status-approved)",
    Completed: "var(--status-completed)",
    Rejected: "var(--status-rejected)",
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
              ? t("donateRequest.historyTitleAll")
              : t("donateRequest.historyTitleMy")}
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
          {" "}
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className={`request-card ${
                expandedRequestId === request._id ? "expanded" : ""
              }`}
            >
              {/* Debug info để kiểm tra dữ liệu screening - chỉ hiển thị trong development */}
              {process.env.NODE_ENV === "development" && (
                <div
                  className="debug-info"
                  style={{
                    fontSize: "10px",
                    color: "#888",
                    padding: "2px 4px",
                  }}
                >
                  <span>ID: {request._id}</span> |
                  <span>
                    Has screening:{" "}
                    {request.screening
                      ? `Yes (${request.screening.length} items)`
                      : "No"}
                  </span>
                </div>
              )}

              <div className="request-card-container">
                <div
                  className="request-main-content"
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
                          {request.userId?.name ||
                            request.createdBy?.name ||
                            "Unknown"}
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
                      {t(
                        `donateRequest.status.${request.status.toLowerCase()}`
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className="medical-questions-button-visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (request.screening && request.screening.length > 0) {
                        setShowMedicalQuestions(request);
                      } else {
                        alert(t("donateRequest.noMedicalData"));
                      }
                    }}
                    title={t("donateRequest.viewMedicalQuestions")}
                  >
                    {t("donateRequest.viewMedicalQuestions")}
                  </button>

                  {(isStaff || request.status === "Pending") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(request._id);
                      }}
                      className="delete-button-visible"
                      title={t("common.delete")}
                    >
                      {t("common.delete")}
                    </button>
                  )}
                </div>
              </div>

              <div className="request-content">
                <span className="component">
                  <strong>{t("donateRequest.donationType")}:</strong>{" "}
                  {t(
                    `donateRequest.component.${request.component.toLowerCase()}`
                  )}
                </span>
                <div className="request-created">
                  <strong>{t("donateRequest.createdAt")}:</strong>{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
                {request.completedAt && (
                  <div className="request-completed">
                    <strong>{t("donateRequest.completedAt")}:</strong>{" "}
                    {new Date(request.completedAt).toLocaleDateString()}
                  </div>
                )}
                {request.rejectionReason && (
                  <div className="request-rejection">
                    <strong>{t("donateRequest.rejectionReason")}:</strong>{" "}
                    {request.rejectionReason}
                  </div>
                )}
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
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt(
                          t("donateRequest.rejectionReason") + ":"
                        );
                        if (reason) {
                          handleStatusUpdate(request._id, "Rejected", reason);
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(request._id, "Completed");
                      }}
                      className="complete-button"
                    >
                      {t("donateRequest.markCompleted")}
                    </button>
                  </div>
                )}{" "}
                {/* Removed duplicate buttons - the visible ones outside already handle these actions */}
                {/* Removed duplicate medical questions button */}
              </div>
            </div>
          ))}
        </div>
      )}{" "}
      {/* Modal hiển thị câu hỏi y tế */}
      {showMedicalQuestions && (
        <div className="medical-questions-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t("donateRequest.medicalQuestionsTitle")}</h3>
              <button
                className="close-button"
                onClick={() => setShowMedicalQuestions(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {showMedicalQuestions.screening &&
              showMedicalQuestions.screening.length > 0 ? (
                showMedicalQuestions.screening.map((item, index) => (
                  <div key={index} className="question-item">
                    <div className="question-text">
                      {index + 1}. {item.question}
                    </div>
                    <div className={`answer ${item.answer ? "yes" : "no"}`}>
                      {item.answer ? t("common.yes") : t("common.no")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-screening-data">
                  <p>{t("donateRequest.noMedicalData")}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="close-modal-button"
                onClick={() => setShowMedicalQuestions(null)}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateRequestHistory;
