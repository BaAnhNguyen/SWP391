import React, { useState } from "react";
import { API_BASE_URL } from "../../config";

function FindNear({ needRequestId, excludedUserId }) {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [showInvite, setShowInvite] = useState({});

  // Tìm donor gần đây
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ lấy vị trí!");
      return;
    }
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

          const result = await response.json();
          setResult(result);
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
  };

  // Gửi mail mời hiến máu
  const handleSendInvite = async (user) => {
    setSending((prev) => ({ ...prev, [user._id]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/needrequest/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donorId: user._id,
          needRequestId: needRequestId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Đã gửi mail mời hiến máu cho người này!");
        setShowInvite((prev) => ({ ...prev, [user._id]: false }));
      } else {
        alert(data.message || "Gửi mail thất bại!");
      }
    } catch (err) {
      alert("Lỗi khi gửi mail: " + err.message);
    }
    setSending((prev) => ({ ...prev, [user._id]: false }));
  };

  //filter
  const filteredResult = excludedUserId
    ? result.filter((user) => user._id !== excludedUserId)
    : result;

  return (
    <div>
      <button onClick={handleFindNearby} disabled={loading}>
        {loading ? "Đang tìm..." : "Tìm người hiến máu quanh tôi"}
      </button>
      {filteredResult.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <h4>Kết quả gần bạn:</h4>
          <ul>
            {filteredResult.map((user) => (
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
                Địa chỉ: {user.address || "(Chưa có)"} <br />
                SĐT: {user.phoneNumber || "(Ẩn)"} <br />
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
                    <button
                      onClick={() => handleSendInvite(user)}
                      disabled={sending[user._id]}
                    >
                      {sending[user._id] ? "Đang gửi..." : "Gửi lời mời"}
                    </button>
                    <button
                      style={{ marginLeft: 8, color: "#b71c1c" }}
                      onClick={() =>
                        setShowInvite((prev) => ({
                          ...prev,
                          [user._id]: false,
                        }))
                      }
                      disabled={sending[user._id]}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && (
          <div style={{ marginTop: 16, color: "#888" }}>
            Không tìm thấy người hiến máu nào gần bạn.
          </div>
        )
      )}
    </div>
  );
}

export default FindNear;
