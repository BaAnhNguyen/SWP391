import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCardPro from "./BlogCardPro";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";

// Hàm hiển thị thông báo bằng innerHTML
const showNotification = (
  message,
  type = "info",
  duration = 3000,
  confirmCallback = null
) => {
  // Xóa thông báo cũ nếu có
  const existingNotification = document.getElementById("custom-notification");
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  // Tạo element mới cho thông báo
  const notification = document.createElement("div");
  notification.id = "custom-notification";

  // Xác định màu và icon dựa vào loại thông báo
  let bgColor, icon, borderColor, textColor;
  switch (type) {
    case "success":
      bgColor = "#e8f5e9";
      borderColor = "#4caf50";
      textColor = "#388e3c";
      icon = "✓";
      break;
    case "error":
      bgColor = "#ffebee";
      borderColor = "#f44336";
      textColor = "#d32f2f";
      icon = "✕";
      break;
    case "warning":
      bgColor = "#fff8e1";
      borderColor = "#ff9800";
      textColor = "#f57c00";
      icon = "⚠️";
      break;
    default:
      bgColor = "#e3f2fd";
      borderColor = "#2196f3";
      textColor = "#0288d1";
      icon = "ℹ️";
  }

  // Tạo nội dung HTML cho thông báo
  const buttons = confirmCallback
    ? `<div class="notification-actions">
      <button class="confirm-btn">Xác nhận</button>
      <button class="cancel-btn">Hủy</button>
    </div>`
    : `<div class="notification-actions">
      <button class="confirm-btn">OK</button>
    </div>`;

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
      <div class="notification-close">&times;</div>
    </div>
    ${buttons}
  `;

  // CSS Inline cho thông báo
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    background-color: ${bgColor};
    border-left: 4px solid ${borderColor};
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
  `;

  // Thêm CSS cho các phần tử con
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    #custom-notification .notification-content {
      display: flex;
      align-items: center;
      padding: 15px;
    }
    
    #custom-notification .notification-icon {
      font-size: 24px;
      margin-right: 12px;
      color: ${textColor};
    }
    
    #custom-notification .notification-message {
      flex: 1;
      color: ${textColor};
      font-size: 16px;
    }
    
    #custom-notification .notification-close {
      cursor: pointer;
      font-size: 20px;
      color: ${textColor};
      opacity: 0.7;
    }
    
    #custom-notification .notification-close:hover {
      opacity: 1;
    }
    
    #custom-notification .notification-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px 15px 15px;
      gap: 8px;
    }
    
    #custom-notification button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    #custom-notification .confirm-btn {
      background-color: ${borderColor};
      color: white;
    }
    
    #custom-notification .cancel-btn {
      background-color: rgba(0,0,0,0.1);
      color: ${textColor};
    }
    
    #custom-notification .confirm-btn:hover {
      filter: brightness(90%);
    }
    
    #custom-notification .cancel-btn:hover {
      background-color: rgba(0,0,0,0.15);
    }
  `;

  // Thêm thông báo vào body
  document.body.appendChild(style);
  document.body.appendChild(notification);

  // Thêm sự kiện xử lý cho nút đóng
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    document.body.removeChild(notification);
    document.body.removeChild(style);
  });

  // Thêm sự kiện xử lý cho nút xác nhận
  const confirmButton = notification.querySelector(".confirm-btn");
  confirmButton.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    document.body.removeChild(notification);
    document.body.removeChild(style);
  });

  // Thêm sự kiện xử lý cho nút hủy nếu có
  const cancelButton = notification.querySelector(".cancel-btn");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(notification);
      document.body.removeChild(style);
    });
  }

  // Tự động đóng sau khoảng thời gian nếu không phải là thông báo xác nhận
  if (!confirmCallback) {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
        document.body.removeChild(style);
      }
    }, duration);
  }
};

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/blogs`);
        setBlogs(res.data);
      } catch (err) {
        setError("Lỗi khi tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Xử lý xóa blog (chỉ cho admin)
  const handleDelete = async (blogId, blogTitle) => {
    showNotification(
      `Bạn có chắc muốn xóa bài viết "${blogTitle}"?`,
      "warning",
      10000,
      async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));

          // Hiện thông báo thành công
          showNotification("Đã xóa bài viết thành công!", "success");
        } catch (err) {
          showNotification("Lỗi khi xóa bài viết", "error");
        }
      }
    );
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải bài viết...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            color: #6c757d;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            min-height: 50vh;
            border-radius: 16px;
            margin: 20px;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f8f9fa;
            border-top: 4px solid #e74c3c;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Thử lại
        </button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 60px 20px;
            background: #fdf2f2;
            border: 2px solid #e74c3c;
            border-radius: 16px;
            margin: 20px;
            color: #c0392b;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-container h3 {
            color: #e74c3c;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .retry-btn {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
          }
        `}</style>
      </div>
    );

  return (
    <div className="blog-list-container">
      {/* Header */}
      <div className="header-section-redesigned">
        <div className="title-section">
          <h1 className="main-title">
            <span className="title-icon">📚</span>
            Bài viết từ cộng đồng
          </h1>
          <p className="subtitle">
            Khám phá những câu chuyện, kiến thức và kinh nghiệm được chia sẻ
          </p>
        </div>
        {user && user.role !== "Staff" && (
          <div className="action-buttons">
            <Link to="/blogs/create" className="btn btn-primary-red">
              <span className="btn-icon">✏️</span>
              Tạo bài viết
            </Link>
            <Link to="/blogs/mine" className="btn btn-outline-red">
              <span className="btn-icon">👤</span>
              Bài của tôi
            </Link>
            {user.role === "Admin" && (
              <Link to="/blogs/pending" className="btn btn-admin-red">
                <span className="btn-icon">🔍</span>
                Duyệt bài viết
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Blog grid */}
      <div className="blogs-grid">
        {blogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Chưa có bài viết nào</h3>
            <p>Hãy là người đầu tiên chia sẻ câu chuyện của bạn!</p>
            {user && user.role !== "Staff" && (
              <Link to="/blogs/create" className="create-first-btn">
                Tạo bài viết đầu tiên
              </Link>
            )}
          </div>
        ) : (
          blogs.map((blog) => (
            <BlogCardPro
              key={blog._id}
              blog={blog}
              currentUser={user}
              showStatusBadge={false}
              showActions={user?.role === "Admin"}
              actions={["delete"]}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Style giữ nguyên từ bản gốc */}
      <style jsx>{`
        .blog-list-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background-color: #f9f9f9;
        }

        .header-section-redesigned {
          text-align: center;
          padding: 50px 20px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          border-radius: 16px;
          margin-bottom: 40px;
          color: white;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .main-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -1px;
        }

        .title-icon {
          margin-right: 12px;
          font-size: 2.8rem;
        }

        .subtitle {
          font-size: 1.2rem;
          margin-top: 8px;
          opacity: 0.9;
        }

        .action-buttons {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn {
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .btn-primary-red {
          background-color: white;
          color: #e74c3c;
          border-color: white;
        }

        .btn-primary-red:hover {
          background-color: transparent;
          color: white;
          transform: translateY(-2px);
        }

        .btn-outline-red {
          background-color: transparent;
          color: white;
          border-color: white;
        }

        .btn-outline-red:hover {
          background-color: white;
          color: #e74c3c;
          transform: translateY(-2px);
        }

        .btn-admin-red {
          background-color: #ffc107; /* A distinct color for admin actions */
          color: #333;
          border-color: #ffc107;
        }

        .btn-admin-red:hover {
          background-color: #ffca2c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .empty-icon {
          font-size: 4rem;
          color: #e74c3c;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 24px;
        }

        .create-first-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .create-first-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(231, 76, 60, 0.3);
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem;
          }
          .subtitle {
            font-size: 1rem;
          }
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          .btn {
            width: 80%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogList;
