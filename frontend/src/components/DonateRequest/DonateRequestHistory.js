import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";

const bloodComponentVN = {
  WholeBlood: "Toàn phần",
  Plasma: "Huyết tương",
  Platelets: "Tiểu cầu",
  RedCells: "Hồng cầu",
  unknown: "Không xác định",
};

const DonateHistoryDetail = ({ id, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/donationHistory/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể lấy chi tiết lần hiến máu!");
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (!id) return null;

  return (
    <div className="donation-detail-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Chi tiết lần hiến máu</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading && (
          <div className="loading-container">
            <p>Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {detail && (
          <div className="detail-content">
            {/* Thông tin người hiến máu */}
            {detail.userId && (
              <div className="info-section">
                <div className="info-row">
                  <span className="label">Người hiến máu:</span>
                  <div className="value">
                    <div className="donor-name">{detail.userId.name || ""}</div>
                    <div className="donor-email">
                      {detail.userId.email || ""}
                    </div>
                    {detail.userId.phoneNumber && (
                      <div>SĐT: {detail.userId.phoneNumber}</div>
                    )}
                    {detail.userId.dateOfBirth && (
                      <div>
                        Ngày sinh:{" "}
                        {new Date(
                          detail.userId.dateOfBirth
                        ).toLocaleDateString()}
                      </div>
                    )}
                    {detail.userId.gender && (
                      <div>
                        Giới tính:{" "}
                        {detail.userId.gender === "male"
                          ? "Nam"
                          : detail.userId.gender === "female"
                          ? "Nữ"
                          : detail.userId.gender}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Thông tin hiến máu */}
            <div className="info-section">
              <div className="info-row">
                <span className="label">Ngày hiến:</span>
                <span className="value">
                  {new Date(detail.donationDate).toLocaleDateString()}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Nhóm máu:</span>
                <span className="value blood-type">{detail.bloodGroup}</span>
              </div>

              <div className="info-row">
                <span className="label">Thành phần:</span>
                <span className="value">
                  {bloodComponentVN[detail.component] || detail.component}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Số lượng:</span>
                <span className="value">{detail.quantity ?? "?"}</span>
              </div>

              <div className="info-row">
                <span className="label">Trạng thái:</span>
                <span className={`value status ${detail.status.toLowerCase()}`}>
                  {detail.status}
                </span>
              </div>
            </div>

            {/* Thông tin sức khỏe */}
            {detail.healthCheck && (
              <div className="info-section">
                <div className="section-title">Thông tin sức khỏe:</div>

                <div className="info-row">
                  <span className="label">Cân nặng:</span>
                  <span className="value">
                    {detail.healthCheck.weight ?? "?"} kg
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Chiều cao:</span>
                  <span className="value">
                    {detail.healthCheck.height ?? "?"} cm
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Huyết áp:</span>
                  <span className="value">
                    {detail.healthCheck.bloodPressure ?? "?"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Mạch:</span>
                  <span className="value">
                    {detail.healthCheck.heartRate ?? "?"} bpm
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Nhiệt độ:</span>
                  <span className="value">
                    {detail.healthCheck.temperature ?? "?"} °C
                  </span>
                </div>
              </div>
            )}

            {/* Thông tin hủy bỏ (nếu có) */}
            {detail.cancellation && (
              <div className="info-section">
                <div className="section-title">Thông tin hủy bỏ:</div>

                <div className="info-row">
                  <span className="label">Lý do hủy:</span>
                  <span className="value">{detail.cancellation.reason}</span>
                </div>

                <div className="info-row">
                  <span className="label">Ngày hẹn lại:</span>
                  <span className="value">
                    {detail.cancellation.followUpDate
                      ? new Date(
                          detail.cancellation.followUpDate
                        ).toLocaleDateString()
                      : "Chưa có"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>
        {`
        .donation-detail-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-content {
          background: #fff;
          border-radius: 12px;
          min-width: 500px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 16px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #d32f2f;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #f5f5f5;
          color: #d32f2f;
        }
        
        .loading-container, .error-container {
          padding: 40px 24px;
          text-align: center;
        }
        
        .error-container p {
          color: #d32f2f;
          margin: 0;
        }
        
        .detail-content {
          padding: 24px;
        }
        
        .info-section {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .info-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .section-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .label {
          min-width: 120px;
          font-weight: 500;
          color: #555;
          margin-right: 16px;
          flex-shrink: 0;
        }
        
        .value {
          flex: 1;
          color: #333;
        }
        
        .donor-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .donor-email {
          color: #666;
          margin-bottom: 4px;
        }
        
        .blood-type {
          background: #d32f2f;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
        }
        
        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
          text-transform: capitalize;
          display: inline-block;
        }
        
        .status.completed {
          background: #e8f5e8;
          color: #2e7d32;
        }
        
        .status.pending {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .status.cancelled {
          background: #ffebee;
          color: #d32f2f;
        }
        `}
      </style>
    </div>
  );
};

export default DonateHistoryDetail;
