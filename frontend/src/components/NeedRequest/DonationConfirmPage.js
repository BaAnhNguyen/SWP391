import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const DonationConfirmPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/donationMatch/confirm/${matchId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setMessage(data.message);

        // Tự động về trang chủ sau 3s nếu đã xác nhận hoặc expired
        if (data.status === "already_matched" || data.status === "expired") {
          setTimeout(() => navigate("/"), 3000);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Không thể xác nhận. Có lỗi xảy ra.");
      });
  }, [matchId, navigate]);

  return (
    <div style={{ margin: "40px auto", maxWidth: 600, textAlign: "center" }}>
      {status === "loading" && <div>Đang xác nhận...</div>}
      {status === "success" && (
        <div style={{ color: "green", fontSize: 22 }}>
          {message}
          <br />
          <a href="/">Về trang chủ</a>
        </div>
      )}
      {status === "already_matched" && (
        <div style={{ color: "#0b63c5", fontSize: 20 }}>
          {message}
          <br />
          <span>Chuyển về trang chủ sau vài giây...</span>
        </div>
      )}
      {status === "expired" && (
        <div style={{ color: "red", fontSize: 20 }}>
          {message}
          <br />
          <span>Chuyển về trang chủ sau vài giây...</span>
        </div>
      )}
      {status === "error" && (
        <div style={{ color: "red", fontSize: 20 }}>{message}</div>
      )}
    </div>
  );
};

export default DonationConfirmPage;
