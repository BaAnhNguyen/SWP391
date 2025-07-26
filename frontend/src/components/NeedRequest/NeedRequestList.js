import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./NeedRequestList.css";
import EnglishDeleteConfirmModal from "../common/EnglishDeleteConfirmModal";
import { useLocation } from "react-router-dom";

const NeedRequestList = ({ userRole, refresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const isStaff = userRole === "Staff" || userRole === "Admin";

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRequestId, setRejectRequestId] = useState(null);
  const [rejectError, setRejectError] = useState("");

  // Appointment modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentRequestId, setAppointmentRequestId] = useState(null);
  const [appointmentError, setAppointmentError] = useState("");

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);

  // Fulfill confirmation modal state
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [fulfillRequestId, setFulfillRequestId] = useState(null);

  // Fulfill success modal state
  const [showFulfillSuccessModal, setShowFulfillSuccessModal] = useState(false);
  const [fulfillSuccessMessage, setFulfillSuccessMessage] = useState("");

  // Complete confirmation modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeRequestId, setCompleteRequestId] = useState(null);

  // Complete success modal state
  const [showCompleteSuccessModal, setShowCompleteSuccessModal] =
    useState(false);

  //mail
  const location = useLocation();
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");
    if (highlight) {
      setHighlightId(highlight);
      setExpandedRequestId(highlight); // auto expand request
      setTimeout(() => {
        const element = document.getElementById(`request-${highlight}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlighted");
          setTimeout(() => element.classList.remove("highlighted"), 3000); // remove after 3s
        }
      }, 200); // delay after render
    }
  }, [location.search]);

  // Search by name state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
      const endpoint = isStaff
        ? `${API_BASE_URL}/needrequest/all`
        : `${API_BASE_URL}/needrequest/my`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
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

  // ----------- Handler functions -----------
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
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
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    setDeleteRequestId(id);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteRequestId(null);
  };

  const handleDelete = async () => {
    if (!deleteRequestId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
      const response = await fetch(
        `${API_BASE_URL}/needrequest/${deleteRequestId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.deleteError"));
      }
      fetchRequests();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // ----- Reject modal handlers -----
  const openRejectModal = (requestId) => {
    setRejectRequestId(requestId);
    setRejectReason("");
    setRejectError("");
    setShowRejectModal(true);
  };
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectRequestId(null);
    setRejectReason("");
    setRejectError("");
  };
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
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
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || t("needRequest.rejectError"));
      alert(result.message || "Đã từ chối đơn!");
      fetchRequests();
      closeRejectModal();
    } catch (err) {
      setRejectError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----- Appointment modal handlers -----
  const openAppointmentModal = (requestId, currentDate) => {
    setAppointmentRequestId(requestId);
    setAppointmentDate(currentDate ? currentDate.substring(0, 16) : "");
    setAppointmentError("");
    setShowAppointmentModal(true);
  };
  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setAppointmentRequestId(null);
    setAppointmentDate("");
    setAppointmentError("");
  };
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentDate) {
      setAppointmentError("Vui lòng chọn ngày giờ hẹn!");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
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
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Đổi ngày thất bại!");
      alert(result.message || "Đã đổi ngày hẹn thành công!");
      fetchRequests();
      closeAppointmentModal();
    } catch (err) {
      setAppointmentError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----- Other handlers -----
  const handleAssign = (id) => {
    navigate(`/staff/assign-blood-units/${id}`);
  };

  // ----- Fulfill modal handlers -----
  const openFulfillModal = (requestId) => {
    setFulfillRequestId(requestId);
    setShowFulfillModal(true);
  };

  const closeFulfillModal = () => {
    setShowFulfillModal(false);
    setFulfillRequestId(null);
  };

  const closeFulfillSuccessModal = () => {
    setShowFulfillSuccessModal(false);
    setFulfillSuccessMessage("");
  };

  // Complete modal handlers
  const openCompleteModal = (requestId) => {
    setCompleteRequestId(requestId);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setCompleteRequestId(null);
  };

  const closeCompleteSuccessModal = () => {
    setShowCompleteSuccessModal(false);
  };

  const handleFulfillRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
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

      // Close the confirmation modal and show success modal
      closeFulfillModal();
      setFulfillSuccessMessage(result.message);
      setShowFulfillSuccessModal(true);

      fetchRequests();
    } catch (err) {
      setError(err.message);
      closeFulfillModal();
    } finally {
      setLoading(false);
    }
  };
  const handleCompleteRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));
      const completeUrl = `${API_BASE_URL}/needrequest/complete/${id}`;
      const response = await fetch(completeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("needRequest.completeError"));
      }
      const result = await response.json();

      // Close the confirmation modal and show success modal
      closeCompleteModal();
      setShowCompleteSuccessModal(true);

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      closeCompleteModal();
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

  // First filter by status
  const statusFiltered =
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus);

  // Then filter by search term (createdBy's name)
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
              className={`request-card ${
                expandedRequestId === request._id ? "expanded" : ""
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
