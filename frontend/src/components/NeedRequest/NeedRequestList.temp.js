import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./NeedRequestList.css";

const NeedRequestList = ({ userRole, refresh }) => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [availableBloodUnits, setAvailableBloodUnits] = useState([]);
    const [loadingBloodUnits, setLoadingBloodUnits] = useState(false);
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
            setError(err.message); console.error("Error fetching requests:", err);
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

    const handleAssign = async (id) => {
        try {
            setLoadingBloodUnits(true);
            setSelectedRequestId(id);

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error(t("common.notAuthenticated"));
            }

            // Find the selected request to get bloodType and component
            const selectedRequest = requests.find(req => req._id === id);
            if (!selectedRequest) {
                throw new Error("Request not found");
            }

            // Fetch available compatible blood units for this request
            const response = await fetch(
                `${API_BASE_URL}/bloodunit/filter/for-request?bloodType=${selectedRequest.bloodGroup}&componentType=${selectedRequest.component}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || t("needRequest.fetchBloodUnitsError"));
            }

            const data = await response.json();
            setAvailableBloodUnits(data);
            setShowAssignModal(true);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching blood units:", err);
        } finally {
            setLoadingBloodUnits(false);
        }
    };

    const handleAssignConfirm = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error(t("common.notAuthenticated"));
            }

            const response = await fetch(`${API_BASE_URL}/needrequest/assign-blood-units`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ requestId: selectedRequestId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || t("needRequest.assignError"));
            }

            // Close modal and refresh the requests list
            setShowAssignModal(false);
            fetchRequests();
        } catch (err) {
            setError(err.message);
            console.error("Error assigning blood units:", err);
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
        Open: "var(--status-open)",
        Pending: "var(--status-open)",
        Assigned: "var(--status-assigned)",
        Fulfilled: "var(--status-fulfilled)",
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
                            {isStaff
                                ? t("common.role.staff")
                                : t("common.role.member")}
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
                        <option value="Fulfilled">{t("needRequest.status.fulfilled")}</option>
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
                                    className="status-badge"
                                    style={{ backgroundColor: statusColors[request.status] }}
                                >
                                    {t(`needRequest.status.${request.status.toLowerCase()}`)}
                                </div>
                            </div>

                            <div className="request-content">
                                <span className="component">
                                    <strong>{t("needRequest.bloodRequestType")}:</strong>{" "}
                                    {t(
                                        `common.component.${request.component.toLowerCase()}`
                                    )}
                                </span>
                                <div className="request-reason">
                                    <strong>{t("needRequest.reason")}:</strong> {request.reason}
                                </div>

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

                                {(isStaff || request.status === "Open") && (
                                    <>
                                        {isStaff && (request.status === "Open" || request.status === "Pending") && (
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assign Blood Units Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{t("needRequest.assignBloodUnits")}</h3>
                        {loadingBloodUnits ? (
                            <div className="loading">{t("common.loading")}</div>
                        ) : availableBloodUnits.length === 0 ? (
                            <p className="no-blood-units">{t("needRequest.noCompatibleBloodUnits")}</p>
                        ) : (
                            <div className="blood-units-list">
                                <table className="blood-units-table">
                                    <thead>
                                        <tr>
                                            <th>{t("common.bloodType")}</th>
                                            <th>{t("common.component")}</th>
                                            <th>{t("common.volume")} (mL)</th>
                                            <th>{t("common.dateAdded")}</th>
                                            <th>{t("common.dateExpired")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableBloodUnits.map((unit) => (
                                            <tr key={unit._id}>
                                                <td>{unit.BloodType}</td>
                                                <td>{unit.ComponentType}</td>
                                                <td>{unit.Volume}</td>
                                                <td>{new Date(unit.DateAdded).toLocaleDateString()}</td>
                                                <td>{new Date(unit.DateExpired).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button
                                onClick={handleAssignConfirm}
                                className="confirm-button"
                                disabled={availableBloodUnits.length === 0 || loadingBloodUnits}
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeedRequestList;
