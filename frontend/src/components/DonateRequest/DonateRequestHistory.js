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
            ×
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
                  <span className="label">Người hiến máu</span>
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
                        Ngày sinh{" "}
                        {new Date(
                          detail.userId.dateOfBirth
                        ).toLocaleDateString()}
                      </div>
                    )}
                    {detail.userId.gender && (
                      <div>
                        Giới tính{" "}
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
                <span className="label">Ngày hiến</span>
                <span className="value">
                  {new Date(detail.donationDate).toLocaleDateString()}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Nhóm máu</span>
                <span className="value blood-type">{detail.bloodGroup}</span>
              </div>

              <div className="info-row">
                <span className="label">Thành phần</span>
                <span className="value">
                  {bloodComponentVN[detail.component] || detail.component}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Số lượng</span>
                <span className="value">{detail.quantity ?? "?"}</span>
              </div>
              <div className="info-row">
                <span className="label">Thể tích (ml)</span>
                <span className="value">{detail.volume ?? "?"}</span>
              </div>

              <div className="info-row">
                <span className="label">Trạng thái</span>
                <span className={`value status ${detail.status.toLowerCase()}`}>
                  {detail.status}
                </span>
              </div>
            </div>

            {/* Thông tin sức khỏe */}
            {detail.healthCheck && (
              <div className="info-section">
                <div className="section-title">Thông tin sức khỏe</div>

                <div className="info-row">
                  <span className="label">Cân nặng</span>
                  <span className="value">
                    {detail.healthCheck.weight ?? "?"} kg
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Chiều cao</span>
                  <span className="value">
                    {detail.healthCheck.height ?? "?"} cm
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Huyết áp</span>
                  <span className="value">
                    {detail.healthCheck.bloodPressure ?? "?"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Nhịp tim</span>
                  <span className="value">
                    {detail.healthCheck.heartRate ?? "?"} bpm
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Nhiệt độ</span>
                  <span className="value">
                    {detail.healthCheck.temperature ?? "?"} °C
                  </span>
                </div>
              </div>
            )}

            {/* Thông tin hủy bỏ (nếu có) */}
            {detail.cancellation && (
              <div className="info-section">
                <div className="section-title">Thông tin hủy bỏ</div>

                <div className="info-row">
                  <span className="label">Lý do hủy</span>
                  <span className="value">{detail.cancellation.reason}</span>
                </div>

                <div className="info-row">
                  <span className="label">Ngày hẹn lại</span>
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
            <div className="modal-footer">
            <button className="close-modal-button" onClick={onClose}>
              Close
            </button>
          </div>
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
          border-radius: 8px;
          width: 555px; /* Giảm kích thước tổng thể */
          max-width: 90vw;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: white;
          border-bottom: 1px solid #eee;
}
        
        .modal-title {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
          color: #333;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
           color: #333;
        }

        .modal-footer {
          margin:-20px;
          padding: 15px;
          display: flex;
          justify-content: right;
          border-top: 1px solid #eee;
  }

  .close-button {
    padding: 8px 24px;
    background: #6B7280;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background: #4B5563;
  }
        
        .loading-container, .error-container {
          padding: 24px 16px;
          text-align: center;
        }
        
        .error-container p {
          color: #d32f2f;
          margin: 0;
        }
        
        .detail-content {
          padding: 16px;
        }
        
        .info-section {
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          border-radius: 6px;
        }
        
        .info-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .section-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          font-size: 15px;
          padding: 0 0 8px 0;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8px;
          align-items: flex-start;
          padding: 4px 0;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .label {
          min-width: 110px;
          font-weight: 500;
          color: #666;
          margin-right: 12px;
          flex-shrink: 0;
          font-size: 14px;
        }
        
        .value {
          flex: 1;
          color: #333;
          font-size: 14px;
        }
        
        .donor-name {
          font-weight: 700;
          font-size: 17px;
          margin-bottom: 4px;
          color: red;
        }
        
        .donor-email {
          color: #666;
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        .blood-type {
          background: rgba(211, 47, 47, 0.1);
          color: #d32f2f;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 500;
          display: inline-block;
          font-size: 13px;
        }
        
        .status {
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 500;
          text-transform: capitalize;
          display: inline-block;
          font-size: 13px;
        }
        
        .status.completed {
          background: rgba(46, 125, 50, 0.1);
          color: #2e7d32;
        }
        
        .status.pending {
          background: rgba(245, 124, 0, 0.1);
          color: #f57c00;
        }
        
        .status.cancelled {
          background: rgba(211, 47, 47, 0.1);
          color: #d32f2f;
        }

        .detail-content,.info-row .label,.info-row .value,.section-title {
          font-size: 1.05rem;
        }
        `}
      </style>

    </div>
  );
};

export default DonateHistoryDetail;
