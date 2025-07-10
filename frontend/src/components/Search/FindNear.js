import React, { useState } from "react";
import { API_BASE_URL } from "../../config";

function FindNear({ needRequestId }) {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState({});
  const [appointmentDate, setAppointmentDate] = useState({});

  const handleFindNearby = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const response = await fetch(
              `${API_BASE_URL}/user/nearby?lng=${lng}&lat=${lat}&maxDistance=1000000`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (!response.ok) {
              const errText = await response.text();
              throw new Error(errText || `HTTP ${response.status}`);
            }
            const data = await response.json();
            setResult(data);
          } catch (err) {
            alert("Lỗi API: " + (err.message || "Không rõ nguyên nhân"));
            setResult([]);
          }
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          alert("Không lấy được vị trí của bạn!");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ lấy vị trí!");
    }
  };

  const handleSendInvite = async (user) => {
    if (!appointmentDate[user._id]) {
      alert("Vui lòng chọn ngày giờ hẹn!");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/donationMatch/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donorId: user._id,
          needRequestId: needRequestId,
          appointmentDate: appointmentDate[user._id], // Gửi ngày hẹn
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Đã gửi mail mời hiến máu cho người này!");
        setShowInvite((prev) => ({ ...prev, [user._id]: false }));
        setAppointmentDate((prev) => ({ ...prev, [user._id]: "" }));
      } else {
        alert(data.message || "Gửi mail thất bại!");
      }
    } catch (err) {
      alert("Lỗi khi gửi mail: " + err.message);
    }
  };

  return (
    <div>
      <button onClick={handleFindNearby} disabled={loading}>
        {loading ? "Đang tìm..." : "Tìm người hiến máu quanh tôi"}
      </button>
      {result.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Kết quả gần bạn:</h4>
          <ul>
            {result.map((user) => (
              <li key={user._id} style={{ marginBottom: 20 }}>
                <strong>{user.name}</strong> - Nhóm máu: {user.bloodGroup}
                <br />
                {user.nextEligibleDate && (
                  <>
                    Ngày có thể hiến tiếp:{" "}
                    {new Date(user.nextEligibleDate).toLocaleDateString()}
                    <br />
                  </>
                )}
                Địa chỉ: {user.address} <br />
                SĐT: {user.phoneNumber} <br />
                Cách bạn: {user.distance && user.distance.toFixed(1)} m
                <br />
                {!showInvite[user._id] ? (
                  <button
                    onClick={() =>
                      setShowInvite((prev) => ({
                        ...prev,
                        [user._id]: true,
                      }))
                    }
                  >
                    Mời hiến máu
                  </button>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="datetime-local"
                      value={appointmentDate[user._id] || ""}
                      onChange={(e) =>
                        setAppointmentDate((prev) => ({
                          ...prev,
                          [user._id]: e.target.value,
                        }))
                      }
                      style={{ marginRight: 8 }}
                    />
                    <button onClick={() => handleSendInvite(user)}>
                      Gửi lời mời
                    </button>
                    <button
                      style={{ marginLeft: 8, color: "#b71c1c" }}
                      onClick={() =>
                        setShowInvite((prev) => ({
                          ...prev,
                          [user._id]: false,
                        }))
                      }
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FindNear;
