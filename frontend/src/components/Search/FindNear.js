import React, { useState } from "react";
import { API_BASE_URL } from "../../config";

function FindNear() {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

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
            console.error("API ERROR:", err);
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
              <li key={user._id}>
                <strong>{user.name}</strong> - Nhóm máu: {user.bloodGroup}{" "}
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FindNear;
