import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./DonateRequestList.css";
import DonateHistoryDetail from "./DonateRequestHistory";

const DonateRequestList = ({ userRole, refresh }) => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [showMedicalQuestions, setShowMedicalQuestions] = useState(null); // State để hiển thị câu hỏi y tế
  const [healthErrors, setHealthErrors] = useState({});

  // Health check state
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [healthCheckRequest, setHealthCheckRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("complete");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionData, setRejectionData] = useState({
    requestId: null,
    reason: "",
  });
  const [healthCheckData, setHealthCheckData] = useState({
    weight: "",
    height: "",
    bloodPressure: "",
    heartRate: "",
    alcoholLevel: "",
    temperature: "",
    hemoglobin: "",
    quantity: 1,
    volume: 350,
    confirmedBloodGroup: "",
    confirmedComponent: "",
  });
  const [cancellationData, setCancellationData] = useState({
    reason: "",
  });
  const [selectedId, setSelectedId] = useState(null);

  const isStaff = userRole === "Staff" || userRole === "Admin";

  const fetchRequests = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [refresh, fetchRequests]);
  //approve/reject
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
  const handleOpenHealthCheck = (request) => {
    setHealthCheckRequest(request);
    setHealthCheckData({
      weight: "",
      height: "",
      bloodPressure: "",
      heartRate: "",
      alcoholLevel: "",
      temperature: "",
      hemoglobin: "",
      quantity: 1,
      volume: 350,
      confirmedBloodGroup: request.bloodGroup || "",
      confirmedComponent: request.component || "",
    });
    setCancellationData({
      reason: "",
    });
    setActiveTab("complete");
    setShowHealthCheck(true);
  };

  const handleCloseHealthCheck = () => {
    setShowHealthCheck(false);
    setHealthCheckRequest(null);
  };

  const handleOpenRejectionModal = (requestId) => {
    setRejectionData({
      requestId: requestId,
      reason: "",
    });
    setShowRejectionModal(true);
  };

  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setRejectionData({
      requestId: null,
      reason: "",
    });
  };

  const handleRejectionReasonChange = (e) => {
    setRejectionData((prev) => ({
      ...prev,
      reason: e.target.value,
    }));
  };

  const handleRejectionSubmit = (e) => {
    e.preventDefault();
    console.log("Handling rejection submit with data:", rejectionData);

    if (!rejectionData.reason.trim()) {
      alert(t("donateRequest.reasonRequired"));
      return;
    }

    try {
      handleStatusUpdate(
        rejectionData.requestId,
        "Rejected",
        rejectionData.reason.trim()
      );
      handleCloseRejectionModal();
    } catch (err) {
      console.error("Error submitting rejection:", err);
      alert(t("donateRequest.updateError"));
    }
  };
  function validateHealthCheck(data) {
    const errors = {};
    // Cân nặng: 40-150 kg
    if (!data.weight || data.weight < 40 || data.weight > 150)
      errors.weight = "Cân nặng phải từ 40 - 150kg";
    // Chiều cao: 140-220 cm
    if (!data.height || data.height < 140 || data.height > 220)
      errors.height = "Chiều cao phải từ 140 - 220cm";
    // Huyết áp: dạng số/số
    if (!data.bloodPressure || !/^\d{2,3}\/\d{2,3}$/.test(data.bloodPressure))
      errors.bloodPressure = "Huyết áp phải đúng định dạng (vd: 120/80)";
    // Nhịp tim: 50-110 bpm
    if (!data.heartRate || data.heartRate < 50 || data.heartRate > 110)
      errors.heartRate = "Nhịp tim phải từ 50-110 bpm";
    // Nồng độ cồn: phải >= 0 (bạn muốn bắt buộc hay ko?)
    if (data.alcoholLevel && data.alcoholLevel < 0)
      errors.alcoholLevel = "Nồng độ cồn không hợp lệ";
    // Nhiệt độ: 36-38 °C
    if (!data.temperature || data.temperature < 36 || data.temperature > 38)
      errors.temperature = "Nhiệt độ phải từ 36-38°C";
    // Hemoglobin: >= 12 (tùy giới tính), ví dụ lấy 12-18
    if (!data.hemoglobin || data.hemoglobin < 12 || data.hemoglobin > 18)
      errors.hemoglobin = "Hemoglobin phải từ 12-18 g/dL";

    // Quantity và volume check như cũ
    if (!data.quantity || data.quantity < 1)
      errors.quantity = "Số lượng phải >= 1";
    if (!data.volume || data.volume < 50)
      errors.volume = "Thể tích tối thiểu 50ml";

    if (!data.confirmedBloodGroup)
      errors.confirmedBloodGroup = "Vui lòng chọn nhóm máu xác nhận";
    if (!data.confirmedComponent)
      errors.confirmedComponent = "Vui lòng chọn thành phần máu xác nhận";

    return errors;
  }

  const handleHealthCheckSubmit = async (e) => {
    e.preventDefault();

    if (!healthCheckRequest) return;
    //validate
    if (activeTab === "complete") {
      const errors = validateHealthCheck(healthCheckData);
      setHealthErrors(errors);
      if (Object.keys(errors).length > 0) {
        // Nếu có lỗi thì không gửi đi
        return;
      }
    }

    try {
      // Get a fresh token from storage
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("common.notAuthenticated"));

      console.log(
        "Health check submission for request:",
        healthCheckRequest._id
      );

      // Create closure for the API call to support retry
      const makeApiCall = async (requestData) => {
        const apiUrl = `${API_BASE_URL}/donateRegistration/${healthCheckRequest._id}/complete`;
        console.log("API URL:", apiUrl);
        console.log("Request data:", JSON.stringify(requestData));

        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(
              `Server responded with status ${res.status}:`,
              errorText
            );

            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage =
                errorData.message ||
                errorData.error ||
                t("donateRequest.updateError");
            } catch (e) {
              errorMessage = errorText || t("donateRequest.updateError");
            }
            throw new Error(errorMessage);
          }

          return await res.json();
        } catch (error) {
          console.error("API call error:", error);
          throw error;
        }
      };

      if (activeTab === "complete") {
        // Validate quantity
        if (!healthCheckData.quantity || healthCheckData.quantity < 1) {
          return alert(t("donateRequest.invalidQuantity"));
        }

        // Đảm bảo số lượng là số hợp lệ
        const qty = Number(healthCheckData.quantity);
        if (isNaN(qty) || qty < 1) {
          return alert(t("donateRequest.invalidQuantity"));
        }
        const vol = Number(healthCheckData.volume);
        if (isNaN(vol) || vol < 50) {
          return alert(t("Invalid volume(50ml)"));
        }
        // Validate nhóm máu/thành phần
        if (!healthCheckData.confirmedBloodGroup) {
          return alert("Vui lòng chọn nhóm máu xác nhận");
        }
        if (!healthCheckData.confirmedComponent) {
          return alert("Vui lòng chọn thành phần máu xác nhận");
        }

        const requestData = {
          healthCheckStatus: "completed",
          quantity: qty,
          volume: vol,
          healthCheck: {
            weight: healthCheckData.weight
              ? parseFloat(healthCheckData.weight)
              : null,
            height: healthCheckData.height
              ? parseFloat(healthCheckData.height)
              : null,
            bloodPressure: healthCheckData.bloodPressure || "",
            heartRate: healthCheckData.heartRate
              ? parseFloat(healthCheckData.heartRate)
              : null,
            alcoholLevel: healthCheckData.alcoholLevel
              ? parseFloat(healthCheckData.alcoholLevel)
              : null,
            temperature: healthCheckData.temperature
              ? parseFloat(healthCheckData.temperature)
              : null,
            hemoglobin: healthCheckData.hemoglobin
              ? parseFloat(healthCheckData.hemoglobin)
              : null,
          },
          confirmedBloodGroup: healthCheckData.confirmedBloodGroup,
          confirmedComponent: healthCheckData.confirmedComponent,
        };

        const data = await makeApiCall(requestData);
        console.log("Complete response data:", data);
        alert(t("donateRequest.completedSuccessfully"));
        if (data.donationHistoryId) setSelectedId(data.donationHistoryId);
      } else if (activeTab === "cancel") {
        // Validate reason and follow-up date
        if (!cancellationData.reason.trim()) {
          return alert(t("donateRequest.reasonRequired"));
        }

        //reject
        await handleStatusUpdate(
          healthCheckRequest._id,
          "Rejected",
          cancellationData.reason.trim()
        );

        alert(t("donateRequest.canceledSuccessfully"));
      }

      // Close modal and refresh data
      handleCloseHealthCheck();
      fetchRequests();
    } catch (err) {
      setError(err.message);
      alert(t("donateRequest.updateError") + ": " + err.message);
      console.error("Error processing health check:", err);
    }
  };

  const handleHealthCheckChange = (e) => {
    const { name, value } = e.target;
    setHealthCheckData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancellationChange = (e) => {
    const { name, value } = e.target;
    setCancellationData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  }; // Hàm để xem lịch sử bệnh (câu hỏi y tế) của người dùng
  const handleViewMedicalHistory = (request, e) => {
    try {
      e.preventDefault(); // Ngăn chặn sự kiện mặc định
      e.stopPropagation(); // Ngăn chặn sự kiện lan truyền

      console.log("Viewing medical questions for request:", request._id);

      // Kiểm tra xem request có thông tin screening không
      if (!request.screening || request.screening.length === 0) {
        console.log("No screening data available for this request");
      } else {
        console.log("Screening data:", request.screening);
      }

      // Hiển thị modal câu hỏi y tế
      setShowMedicalQuestions(request);
    } catch (err) {
      setError(err.message);
      console.error("Error viewing medical questions:", err);
    }
  }; // Hàm đóng modal câu hỏi y tế
  const closeMedicalQuestions = () => {
    console.log("Closing medical questions modal");
    setShowMedicalQuestions(null);
  };

  const toggleExpandRequest = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const getFilteredByDateRange = (requests) => {
    if (!startDate && !endDate) return requests;

    return requests.filter((request) => {
      const requestDate = new Date(request.readyDate);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return requestDate >= start && requestDate <= end;
      }

      if (startDate) {
        const start = new Date(startDate);
        return requestDate >= start;
      }

      if (endDate) {
        const end = new Date(endDate);
        return requestDate <= end;
      }

      return true;
    });
  };

  const filteredRequests = getFilteredByDateRange(
    filterStatus === "all"
      ? requests
      : requests.filter((request) => request.status === filterStatus)
  );

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
              {isStaff ? t("common.role.staff") : t("common.role.member")}
            </span>
          </h2>
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

          <div className="date-range-filter">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // Nếu ngày bắt đầu lớn hơn ngày kết thúc, cập nhật ngày kết thúc
                if (endDate && e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              className="date-input"
            />

            <label>Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="date-input"
            />

            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="clear-date-button"
              title="Xóa bộ lọc ngày"
            >
              ×
            </button>
          </div>

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
                    {isStaff && (
                      <span className="request-by">
                        {request.userId?.name ||
                          request.createdBy?.name ||
                          "Unknown"}
                      </span>
                    )}
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
                    `donateRequest.status.${(
                      request.status || ""
                    ).toLowerCase()}`
                  )}
                </div>
              </div>
              <div className="request-content">
                {(request.status === "Rejected" ||
                  request.status === "Cancelled") &&
                  request.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>{t("donateRequest.rejectionReason")}:</strong>{" "}
                      {request.rejectionReason}
                    </div>
                  )}
                {request.status === "Cancelled" && request.nextReadyDate && (
                  <div className="next-eligible">
                    <strong>Ngày hẹn lại:</strong>{" "}
                    {new Date(request.nextReadyDate).toLocaleDateString()}
                  </div>
                )}
                <div className="component">
                  <strong>{t("donateRequest.donationType")}:</strong>{" "}
                  {t(
                    `common.component.${(
                      request.component || ""
                    ).toLowerCase()}`
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
                        handleOpenRejectionModal(request._id);
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
                        handleOpenHealthCheck(request);
                      }}
                      className="complete-button"
                    >
                      {t("donateRequest.healthCheck")}
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
                )}{" "}
                <button
                  onClick={(e) => {
                    handleViewMedicalHistory(request, e);
                  }}
                  className="history-button"
                >
                  {t("donateRequest.medicalHistory")}
                </button>
                {request.status === "Completed" && (
                  <button
                    className="detail-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(request.historyId);
                    }}
                  >
                    {t("donateRequest.detailInfo")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Model history detail*/}
      {selectedId && (
        <DonateHistoryDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
      {/* Modal hiển thị câu hỏi y tế */}
      {showMedicalQuestions && (
        <div
          className="medical-questions-modal"
          onClick={(e) =>
            e.target.className === "medical-questions-modal" &&
            closeMedicalQuestions()
          }
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t("donateRequest.medicalQuestionsTitle")}</h3>
              <button className="close-button" onClick={closeMedicalQuestions}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>{t("common.loading")}</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : showMedicalQuestions.screening &&
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
                onClick={closeMedicalQuestions}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Health Check Modal */}
      {showHealthCheck && healthCheckRequest && (
        <div
          className="health-check-modal"
          onClick={(e) =>
            e.target.className === "health-check-modal" &&
            handleCloseHealthCheck()
          }
        >
          <div className="health-check-content">
            <div className="health-check-header">
              <h3>{t("donateRequest.healthCheckTitle")}</h3>
              <button className="close-button" onClick={handleCloseHealthCheck}>
                &times;
              </button>
            </div>

            <div className="health-check-tabs">
              <button
                className={`health-check-tab ${
                  activeTab === "complete" ? "active" : ""
                }`}
                onClick={() => setActiveTab("complete")}
              >
                {t("donateRequest.completeTab")}
              </button>
              <button
                className={`health-check-tab ${
                  activeTab === "cancel" ? "active" : ""
                }`}
                onClick={() => setActiveTab("cancel")}
              >
                {t("donateRequest.cancelTab")}
              </button>
            </div>
            <form onSubmit={handleHealthCheckSubmit}>
              {/* Basic Health Metrics - only show in complete tab */}
              {activeTab === "complete" && (
                <div className="health-check-form">
                  <div className="form-field">
                    <label>{t("donateRequest.weight")} (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={healthCheckData.weight}
                      onChange={handleHealthCheckChange}
                      step="0.1"
                      className={
                        healthErrors.weight ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.weight && (
                      <div className="field-error">{healthErrors.weight}</div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.height")} (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={healthCheckData.height}
                      onChange={handleHealthCheckChange}
                      step="0.1"
                      className={
                        healthErrors.height ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.height && (
                      <div className="field-error">{healthErrors.height}</div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.bloodPressure")}</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={healthCheckData.bloodPressure}
                      onChange={handleHealthCheckChange}
                      placeholder="120/80"
                      className={
                        healthErrors.bloodPressure ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.bloodPressure && (
                      <div className="field-error">
                        {healthErrors.bloodPressure}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.heartRate")} (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      value={healthCheckData.heartRate}
                      onChange={handleHealthCheckChange}
                      className={
                        healthErrors.heartRate ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.heartRate && (
                      <div className="field-error">
                        {healthErrors.heartRate}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.alcoholLevel")}</label>
                    <input
                      type="number"
                      name="alcoholLevel"
                      value={healthCheckData.alcoholLevel}
                      onChange={handleHealthCheckChange}
                      step="0.01"
                      className={
                        healthErrors.alcoholLevel ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.alcoholLevel && (
                      <div className="field-error">
                        {healthErrors.alcoholLevel}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.temperature")} (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      value={healthCheckData.temperature}
                      onChange={handleHealthCheckChange}
                      step="0.1"
                      className={
                        healthErrors.temperature ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.temperature && (
                      <div className="field-error">
                        {healthErrors.temperature}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>{t("donateRequest.hemoglobin")} (g/dL)</label>
                    <input
                      type="number"
                      name="hemoglobin"
                      value={healthCheckData.hemoglobin}
                      onChange={handleHealthCheckChange}
                      step="0.1"
                      className={
                        healthErrors.hemoglobin ? "field-error-border" : ""
                      }
                    />
                    {healthErrors.hemoglobin && (
                      <div className="field-error">
                        {healthErrors.hemoglobin}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Nhóm máu xác nhận</label>
                    <select
                      name="confirmedBloodGroup"
                      value={healthCheckData.confirmedBloodGroup}
                      onChange={handleHealthCheckChange}
                      required
                      className={
                        healthErrors.confirmedBloodGroup
                          ? "field-error-border"
                          : ""
                      }
                    >
                      <option value="">Chọn nhóm máu</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    {healthErrors.confirmedBloodGroup && (
                      <div className="field-error">
                        {healthErrors.confirmedBloodGroup}
                      </div>
                    )}
                  </div>
                  <div className="form-field">
                    <label>Thành phần máu xác nhận</label>
                    <select
                      name="confirmedComponent"
                      value={healthCheckData.confirmedComponent}
                      onChange={handleHealthCheckChange}
                      required
                      className={
                        healthErrors.confirmedComponent
                          ? "field-error-border"
                          : ""
                      }
                    >
                      <option value="">Chọn thành phần</option>
                      <option value="WholeBlood">Toàn phần</option>
                      <option value="Plasma">Huyết tương</option>
                      <option value="Platelets">Tiểu cầu</option>
                      <option value="RedCells">Hồng cầu</option>
                    </select>
                    {healthErrors.confirmedComponent && (
                      <div className="field-error">
                        {healthErrors.confirmedComponent}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Conditional form fields */}
              {activeTab === "complete" ? (
                <>
                  <div className="form-field quantity-field large-quantity">
                    <label>{t("donateRequest.quantity")}</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={healthCheckData.quantity}
                      onChange={handleHealthCheckChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Thể tích máu (ml)</label>
                    <input
                      type="number"
                      name="volume"
                      min="50"
                      value={healthCheckData.volume}
                      onChange={handleHealthCheckChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="cancel-form">
                  <div className="form-field full-width">
                    <label>{t("donateRequest.cancellationReason")}</label>
                    <textarea
                      name="reason"
                      value={cancellationData.reason}
                      onChange={handleCancellationChange}
                      placeholder={t(
                        "donateRequest.cancellationReasonPlaceholder"
                      )}
                      required
                      className="large-textarea"
                    ></textarea>
                  </div>
                </div>
              )}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseHealthCheck}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="submit-button">
                  {activeTab === "complete"
                    ? t("donateRequest.confirmComplete")
                    : t("donateRequest.confirmCancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div
          className="rejection-modal"
          onClick={(e) =>
            e.target.className === "rejection-modal" &&
            handleCloseRejectionModal()
          }
        >
          <div className="rejection-modal-content">
            <div className="rejection-modal-header">
              <h3>{t("donateRequest.rejectionModalTitle")}</h3>
              <button
                className="close-button"
                onClick={handleCloseRejectionModal}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRejectionSubmit} className="rejection-form">
              <div className="rejection-modal-body">
                <div className="form-field full-width">
                  <label>{t("donateRequest.rejectionReason")}</label>
                  <textarea
                    name="reason"
                    value={rejectionData.reason}
                    onChange={handleRejectionReasonChange}
                    placeholder={t("donateRequest.rejectionReasonPlaceholder")}
                    required
                    className="large-textarea"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseRejectionModal}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="submit-button reject-submit-button"
                >
                  {t("donateRequest.confirmReject")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateRequestList;
