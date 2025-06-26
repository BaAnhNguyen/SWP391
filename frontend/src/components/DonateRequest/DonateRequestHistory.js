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
        <button style={{ float: "right" }} onClick={onClose}>
          ✕
        </button>
        <h3>Chi tiết lần hiến máu</h3>
        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {detail && (
          <table>
            <tbody>
              {/* Người hiến máu */}
              {detail.userId && (
                <tr>
                  <td>
                    <b>Người hiến máu:</b>
                  </td>
                  <td>
                    {detail.userId.name || ""}
                    <br />
                    {detail.userId.email || ""}
                    {detail.userId.phoneNumber && (
                      <>
                        <br />
                        SĐT: {detail.userId.phoneNumber}
                      </>
                    )}
                    {detail.userId.dateOfBirth && (
                      <>
                        <br />
                        Ngày sinh:{" "}
                        {new Date(
                          detail.userId.dateOfBirth
                        ).toLocaleDateString()}
                      </>
                    )}
                    {detail.userId.gender && (
                      <>
                        <br />
                        Giới tính:{" "}
                        {detail.userId.gender === "male"
                          ? "Nam"
                          : detail.userId.gender === "female"
                          ? "Nữ"
                          : detail.userId.gender}
                      </>
                    )}
                  </td>
                </tr>
              )}
              {/* Các thông tin còn lại */}
              <tr>
                <td>
                  <b>Ngày hiến:</b>
                </td>
                <td>{new Date(detail.donationDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td>
                  <b>Nhóm máu:</b>
                </td>
                <td>{detail.bloodGroup}</td>
              </tr>
              <tr>
                <td>
                  <b>Thành phần:</b>
                </td>
                <td>
                  {bloodComponentVN[detail.component] || detail.component}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Số lượng:</b>
                </td>
                <td>{detail.quantity ?? "?"}</td>
              </tr>
              <tr>
                <td>
                  <b>Trạng thái:</b>
                </td>
                <td>{detail.status}</td>
              </tr>
              {detail.healthCheck && (
                <>
                  <tr>
                    <td colSpan={2}>
                      <b>Thông tin sức khỏe:</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Cân nặng:</td>
                    <td>{detail.healthCheck.weight ?? "?"} kg</td>
                  </tr>
                  <tr>
                    <td>Chiều cao:</td>
                    <td>{detail.healthCheck.height ?? "?"} cm</td>
                  </tr>
                  <tr>
                    <td>Huyết áp:</td>
                    <td>{detail.healthCheck.bloodPressure ?? "?"}</td>
                  </tr>
                  <tr>
                    <td>Mạch:</td>
                    <td>{detail.healthCheck.heartRate ?? "?"} bpm</td>
                  </tr>
                  <tr>
                    <td>Nhiệt độ:</td>
                    <td>{detail.healthCheck.temperature ?? "?"} °C</td>
                  </tr>
                </>
              )}
              {detail.cancellation && (
                <>
                  <tr>
                    <td>
                      <b>Lý do hủy:</b>
                    </td>
                    <td>{detail.cancellation.reason}</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Ngày hẹn lại:</b>
                    </td>
                    <td>
                      {detail.cancellation.followUpDate
                        ? new Date(
                            detail.cancellation.followUpDate
                          ).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        )}
      </div>
      <style>
        {`
        .donation-detail-modal {
          position: fixed; top: 0; left: 0; right:0; bottom: 0;
          background: rgba(0,0,0,0.3); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: #fff; padding: 32px 24px; border-radius: 8px; min-width: 400px; max-width: 90vw;
          max-height: 90vh; overflow-y: auto;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 12px;}
        td { padding: 8px;}
        tr:not(:last-child) { border-bottom: 1px solid #eee;}
        `}
      </style>
    </div>
  );
};

export default DonateHistoryDetail;
