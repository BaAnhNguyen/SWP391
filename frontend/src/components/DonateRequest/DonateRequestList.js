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
  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [editDateRequest, setEditDateRequest] = useState(null);
  const [editReadyDate, setEditReadyDate] = useState("");
  const [editDateError, setEditDateError] = useState("");

  // Health check state
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [healthCheckRequest, setHealthCheckRequest] = useState(null);
  const [showDateAlert, setShowDateAlert] = useState(false);
  const [dateAlertMessage, setDateAlertMessage] = useState("");
  const [showDateSuccessModal, setShowDateSuccessModal] = useState(false);
  const [dateSuccessMessage, setDateSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("complete");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
  //failed
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedReason, setFailedReason] = useState("");

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
    // validate den ngay moi dc mo?
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const readyDate = new Date(request.readyDate);
    readyDate.setHours(0, 0, 0, 0);

    if (readyDate > today) {
      setDateAlertMessage(t("common.alertDate"));
      setShowDateAlert(true);
      return;
    }
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

  const handleCloseDateAlert = () => {
    setShowDateAlert(false);
    setDateAlertMessage("");
  };

  const handleCloseDateSuccessModal = () => {
    setShowDateSuccessModal(false);
    setDateSuccessMessage("");
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

  const handleOpenDeleteModal = (requestId) => {
    if (!requestId) {
      console.error("No request ID provided for deletion");
      alert("Error: Cannot delete this request. Missing ID.");
      return;
    }
    console.log("Opening delete modal for request ID:", requestId);
    setDeleteRequestId(requestId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteRequestId(null);
    setShowDeleteModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    fetchRequests();
  };

  const handleRejectionReasonChange = (e) => {
    setRejectionData((prev) => ({
      ...prev,
      reason: e.target.value,
    }));
  };

  //change readyDate
  const handleOpenEditDateModal = (request) => {
    setEditDateRequest(request);
    setEditReadyDate(
      request.readyDate ? request.readyDate.substring(0, 10) : ""
    );
    setEditDateError("");
    setShowEditDateModal(true);
  };

  const handleCloseEditDateModal = () => {
    setShowEditDateModal(false);
    setEditDateRequest(null);
    setEditReadyDate("");
    setEditDateError("");
  };

  const handleSubmitEditDate = async (e) => {
    e.preventDefault();
    if (!editReadyDate) {
      setEditDateError("Vui lòng chọn ngày hẹn mới");
      return;
    }
    // Validate ngày >= hôm nay
    const today = new Date();
    const picked = new Date(editReadyDate);
    today.setHours(0, 0, 0, 0);
    picked.setHours(0, 0, 0, 0);
    if (picked < today) {
      setEditDateError("Ngày hẹn phải từ hôm nay trở đi");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${API_BASE_URL}/donateregistration/${editDateRequest._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ readyDate: editReadyDate }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Lỗi cập nhật ngày hẹn");
      }
      handleCloseEditDateModal();
      fetchRequests();
      setDateSuccessMessage(
        t(
          "donateRequest.appointmentDateUpdated",
          "Appointment date updated successfully!"
        )
      );
      setShowDateSuccessModal(true);
    } catch (err) {
      setEditDateError(err.message);
    }
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

    const isPositiveNumber = (value) =>
      value !== null &&
      value !== "" &&
      !isNaN(parseFloat(value)) &&
      parseFloat(value) >= 0;

    // Các trường số > 0
    if (!isPositiveNumber(data.weight))
      errors.weight = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.height))
      errors.height = t("donate.errors.positiveNumber");
    if (!/^\d{2,3}\/\d{2,3}$/.test(data.bloodPressure || ""))
      errors.bloodPressure = t("donate.errors.formatBloodPressure");
    if (!isPositiveNumber(data.heartRate))
      errors.heartRate = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.alcoholLevel))
      errors.alcoholLevel = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.temperature))
      errors.temperature = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.hemoglobin))
      errors.hemoglobin = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.quantity))
      errors.quantity = t("donate.errors.positiveNumber");
    if (!isPositiveNumber(data.volume))
      errors.volume = t("donate.errors.positiveNumber");

    // Các trường bắt buộc chọn
    if (!data.confirmedBloodGroup)
      errors.confirmedBloodGroup = "Vui lòng chọn nhóm máu";
    if (!data.confirmedComponent)
      errors.confirmedComponent = "Vui lòng chọn thành phần máu";

    return errors;
  }

  const handleHealthCheckSubmit = async (e) => {
    e.preventDefault();

    if (!healthCheckRequest) return;

    // Validate ngày hiện tại >= ngày hẹn
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const readyDate = new Date(healthCheckRequest.readyDate);
    readyDate.setHours(0, 0, 0, 0);

    if (readyDate > today) {
      alert(t("common.alertDate"));
      return;
    }

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
          setSuccessMessage(t("donateRequest.invalidQuantity"));
          setShowSuccessModal(true);
          return;
        }

        // Đảm bảo số lượng là số hợp lệ
        const qty = Number(healthCheckData.quantity);
        if (isNaN(qty) || qty < 1) {
          setSuccessMessage(t("donateRequest.invalidQuantity"));
          setShowSuccessModal(true);
          return;
        }
        const vol = Number(healthCheckData.volume);
        if (isNaN(vol) || vol < 50) {
          setSuccessMessage(t("Invalid volume(50ml)"));
          setShowSuccessModal(true);
          return;
        }
        // Validate nhóm máu/thành phần
        if (!healthCheckData.confirmedBloodGroup) {
          setSuccessMessage("Vui lòng chọn nhóm máu xác nhận");
          setShowSuccessModal(true);
          return;
        }
        if (!healthCheckData.confirmedComponent) {
          setSuccessMessage("Vui lòng chọn thành phần máu xác nhận");
          setShowSuccessModal(true);
          return;
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
            bloodPressure: healthCheckData.bloodPressure?.trim() || null,
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
        setSuccessMessage(t("donateRequest.completedSuccessfully"));
        setShowSuccessModal(true);
        if (data.donationHistoryId) setSelectedId(data.donationHistoryId);
      } else if (activeTab === "cancel") {
        // Validate reason and follow-up date
        if (!cancellationData.reason.trim()) {
          setSuccessMessage(t("donateRequest.reasonRequired"));
          setShowSuccessModal(true);
          return;
        }

        //reject
        await handleStatusUpdate(
          healthCheckRequest._id,
          "Rejected",
          cancellationData.reason.trim()
        );

        setSuccessMessage(t("donateRequest.canceledSuccessfully"));
        setShowSuccessModal(true);
      }

      // Close health check modal but keep success modal open
      handleCloseHealthCheck();
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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("common.notAuthenticated"));
      }

      if (!deleteRequestId) {
        console.error("No request ID selected for deletion");
        return;
      }

      console.log("Deleting request with ID:", deleteRequestId);

      const response = await fetch(
        `${API_BASE_URL}/donateregistration/${deleteRequestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t("donateRequest.deleteError"));
      }

      console.log("Delete successful");
      // Close modal immediately without alerts
      handleCloseDeleteModal();

      // Refresh the requests list
      fetchRequests();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting request:", err);
      // Silently close modal even on error
      handleCloseDeleteModal();
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
    Failed: "#dc3545",
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
            <option value="Failed">{t("donateRequest.status.failed")}</option>
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

                {isStaff &&
                  expandedRequestId === request._id &&
                  request.userId && (
                    <div
                      className="donor-info"
                      style={{
                        marginTop: 8,
                        background: "#f8f8f8",
                        padding: 8,
                        borderRadius: 6,
                      }}
                    >
                      <div>
                        <strong>Email:</strong> {request.userId.email}
                      </div>
                      <div>
                        <strong>SDT:</strong> {request.userId.phoneNumber}
                      </div>
                      <div>
                        <strong>Ngày sinh:</strong>{" "}
                        {request.userId.dateOfBirth
                          ? new Date(
                              request.userId.dateOfBirth
                            ).toLocaleDateString()
                          : ""}
                      </div>
                      <div>
                        <strong>Giới tính:</strong>{" "}
                        {request.userId.gender === "male"
                          ? "Nam"
                          : request.userId.gender === "female"
                          ? "Nữ"
                          : request.userId.gender}
                      </div>
                    </div>
                  )}

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
                  request.status === "Cancelled" ||
                  request.status === "Failed") &&
                  request.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>
                        {request.status === "Failed"
                          ? "Lý do không đạt"
                          : t("donateRequest.rejectionReason")}
                        :
                      </strong>{" "}
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
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRejectionModal(request._id);
                      }}
                      className="rejectt-button"
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
                    <button
                      className="edit-date-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDateModal(request);
                      }}
                    >
                      {t(
                        "donateRequest.changeAppointmentDate",
                        "Change Appointment Date"
                      )}
                    </button>
                  </div>
                )}

                <div className="user-actions">
                  {(isStaff || request.status === "Pending") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(
                          "Delete button clicked for request:",
                          request
                        );
                        handleOpenDeleteModal(request._id);
                      }}
                      className="donate-delete-button"
                    >
                      {t("donateRequest.delete")}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      handleViewMedicalHistory(request, e);
                    }}
                    className="history-button"
                  >
                    {t("donateRequest.medicalHistory")}
                  </button>
                  {(request.status === "Completed" ||
                    request.status === "Failed") && (
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
                    <label>{t("donateRequest.confirmedBloodGroup")}</label>
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
                    <label>{t("donateRequest.confirmedComponent")}</label>
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
                      <option value="WholeBlood">
                        {t("common.component.wholeblood")}
                      </option>
                      <option value="Plasma">
                        {t("common.component.plasma")}
                      </option>
                      <option value="Platelets">
                        {t("common.component.platelets")}
                      </option>
                      <option value="RedCells">
                        {t("common.component.redcells")}
                      </option>
                      <option value="RedCells">
                        {t("common.component.unknown")}
                      </option>
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
                      className={
                        healthErrors.quantity ? "field-error-border" : ""
                      }
                    />
                  </div>
                  <div className="form-field quantity-field large-quantity">
                    <label>{t("donateRequest.bloodVolume")} (ml)</label>
                    <input
                      type="number"
                      name="volume"
                      min="50"
                      value={healthCheckData.volume}
                      onChange={handleHealthCheckChange}
                      required
                      className={
                        healthErrors.volume ? "field-error-border" : ""
                      }
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
                  className="cancell-button"
                  onClick={handleCloseHealthCheck}
                  style={{
                    backgroundColor: "#6c757d",
                    marginRight: 8,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    width: "170px",
                  }}
                >
                  {t("common.cancel")}
                </button>
                {activeTab === "complete" && (
                  <>
                    <button
                      type="submit"
                      className="submit-button"
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        width: "170px",
                      }}
                    >
                      {t("donateRequest.confirmComplete")}
                    </button>
                    <button
                      type="button"
                      className="submit-button"
                      style={{
                        backgroundColor: "#dc3545",
                        marginLeft: 8,
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        width: "170px",
                      }}
                      onClick={() => setShowFailedModal(true)}
                    >
                      {t("donateRequest.markFailed")}
                    </button>
                  </>
                )}
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
      {showEditDateModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay")
              handleCloseEditDateModal();
          }}
        >
          <div className="modal-content">
            <h3>
              {t(
                "donateRequest.changeBloodDonationAppointment",
                "Change Blood Donation Appointment"
              )}
            </h3>
            <form onSubmit={handleSubmitEditDate}>
              <label>
                {t("donateRequest.newAppointmentDate", "New Appointment Date")}:
              </label>
              <input
                type="date"
                value={editReadyDate}
                onChange={(e) => setEditReadyDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
              {editDateError && (
                <div className="field-error">{editDateError}</div>
              )}
              <div style={{ marginTop: 12 }}>
                <button type="button" onClick={handleCloseEditDateModal}>
                  {t("common.cancel", "Cancel")}
                </button>
                <button type="submit" style={{ marginLeft: 8 }}>
                  {t("common.update", "Update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="delete-modal"
          onClick={(e) => {
            if (e.target.className === "delete-modal") {
              handleCloseDeleteModal();
            }
          }}
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="delete-modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div
              className="delete-modal-header"
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>{t("common.delete")}</h3>
              <button
                className="close-button"
                onClick={handleCloseDeleteModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
            <div className="delete-modal-body" style={{ marginBottom: "20px" }}>
              <p>{t("donateRequest.confirmDelete")}</p>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <button
                className="cancel-button"
                onClick={handleCloseDeleteModal}
                style={{
                  padding: "8px 24px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                CANCEL
              </button>
              <button
                className="donate-delete-button"
                onClick={handleDelete}
                style={{
                  padding: "8px 24px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {showFailedModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              setShowFailedModal(false);
              setFailedReason("");
            }
          }}
        >
          <div className="modal-content">
            <h3>{t("donateRequest.failedReason")}</h3>
            <textarea
              value={failedReason}
              onChange={(e) => setFailedReason(e.target.value)}
              rows={4}
              className="large-textarea"
              style={{ width: "100%", marginTop: 12 }}
            />
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowFailedModal(false);
                  setFailedReason("");
                }}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  marginRight: 8,
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={async () => {
                  if (!failedReason.trim()) {
                    alert(
                      t("donateRequest.reasonRequired", "Please enter a reason")
                    );
                    return;
                  }

                  try {
                    const token = localStorage.getItem("token");
                    const apiUrl = `${API_BASE_URL}/donateRegistration/${healthCheckRequest._id}/failed`;

                    const requestData = {
                      healthCheckStatus: "rejected",
                      reason: failedReason.trim(),
                      healthCheck: {
                        weight: healthCheckData.weight
                          ? parseFloat(healthCheckData.weight)
                          : null,
                        height: healthCheckData.height
                          ? parseFloat(healthCheckData.height)
                          : null,
                        bloodPressure: healthCheckData.bloodPressure || null,
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
                    };

                    const res = await fetch(apiUrl, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(requestData),
                    });

                    if (!res.ok) {
                      const error = await res.json();
                      throw new Error(error.message || t("donateRequest.errorFail"));
                    }

                    setShowFailedModal(false);
                    setFailedReason("");
                    setSuccessMessage(t("donateRequest.markedFail"));
                    setShowSuccessModal(true);
                    handleCloseHealthCheck();
                  } catch (err) {
                    alert(t("common.error", "Error") + ": " + err.message);
                  }
                }}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  width: "170px",
                }}
              >
                {t("donateRequest.confirmFailed")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="success-modal"
          onClick={(e) => {
            if (e.target.className === "success-modal") {
              handleCloseSuccessModal();
            }
          }}
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="success-modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div
              className="success-modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>{t("common.notify")}</h3>
              <button
                className="close-button"
                onClick={handleCloseSuccessModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
            <div
              className="success-modal-body"
              style={{
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              <p>{successMessage}</p>
            </div>
            <div
              className="success-modal-footer"
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleCloseSuccessModal}
                style={{
                  padding: "8px 24px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Alert Modal */}
      {showDateAlert && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              handleCloseDateAlert();
            }
          }}
        >
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <h3
              style={{
                color: "#e74c3c",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {t("common.notify")}
            </h3>
            <p
              style={{
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              {dateAlertMessage || t("donateRquest.healthcheckAlert")}
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={handleCloseDateAlert}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Success Modal */}
      {showDateSuccessModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              handleCloseDateSuccessModal();
            }
          }}
        >
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <h3
              style={{
                color: "#28a745",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {t("common.notify")}
            </h3>
            <p
              style={{
                marginBottom: "20px",
                textAlign: "center",
                fontSize: "16px",
              }}
            >
              {dateSuccessMessage}
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={handleCloseDateSuccessModal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateRequestList;
