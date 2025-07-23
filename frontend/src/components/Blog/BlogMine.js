import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import BlogCardPro from "./BlogCardPro";

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

const BlogMine = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Bạn chưa đăng nhập");
        }
        const res = await axios.get(`${API_BASE_URL}/blogs/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Lỗi khi tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  // Filter and sort blogs
  const filteredAndSortedBlogs = React.useMemo(() => {
    let filtered = blogs;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((blog) => {
        if (filterStatus === "approved") {
          return blog.status === "Approved";
        } else if (filterStatus === "pending") {
          return blog.status === "Pending";
        }
        return true;
      });
    }

    // Sort blogs
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [blogs, filterStatus, sortBy]);

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
          setBlogs(blogs.filter((blog) => blog._id !== blogId));

          showNotification("Đã xóa bài viết thành công!", "success");
        } catch (err) {
          showNotification("Lỗi khi xóa bài viết", "error");
        }
      }
    );
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "Approved":
        return {
          text: "Đã duyệt",
          color: "#10b981",
          bg: "#d1fae5",
          icon: "✅",
        };
      case "Pending":
        return {
          text: "Chờ duyệt",
          color: "#f59e0b",
          bg: "#fef3c7",
          icon: "⏳",
        };
      case "Rejected":
        return {
          text: "Bị từ chối",
          color: "#ef4444",
          bg: "#fee2e2",
          icon: "❌",
        };
      default:
        return {
          text: "Không rõ",
          color: "#6b7280",
          bg: "#f3f4f6",
          icon: "❓",
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Đang tải bài viết của bạn...</p>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          color: #6b7280;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
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

  // Error component
  const ErrorMessage = () => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Có lỗi xảy ra</h3>
      <p>{error}</p>
      <div className="error-actions">
        <button onClick={() => window.location.reload()} className="retry-btn">
          Thử lại
        </button>
        <button onClick={() => navigate("/blogs")} className="back-btn">
          Quay lại trang chủ
        </button>
      </div>
      <style jsx>{`
        .error-container {
          text-align: center;
          padding: 60px 20px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          margin: 20px 0;
        }
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .error-container h3 {
          color: #dc2626;
          margin-bottom: 8px;
        }
        .error-container p {
          color: #7f1d1d;
          margin-bottom: 20px;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .retry-btn,
        .back-btn {
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
        }
        .retry-btn {
          background: #dc2626;
          color: white;
        }
        .retry-btn:hover {
          background: #b91c1c;
        }
        .back-btn {
          background: #f3f4f6;
          color: #374151;
        }
        .back-btn:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📝</div>
      <h3>Bạn chưa có bài viết nào</h3>
      <p>Hãy tạo bài viết đầu tiên để chia sẻ câu chuyện của bạn!</p>
      <Link to="/blogs/create" className="create-btn">
        Tạo bài viết đầu tiên
      </Link>
      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .empty-state h3 {
          color: #374151;
          margin-bottom: 8px;
          font-size: 24px;
        }
        .empty-state p {
          margin-bottom: 24px;
          font-size: 16px;
        }
        .create-btn {
          background: linear-gradient(to right, #e74c3c, #c0392b);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          display: inline-block;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
        }
      `}</style>
    </div>
  );

  // No results component - Fixed to maintain grid layout
  const NoResults = () => (
    <div className="no-results">
      <div className="no-results-icon">🔍</div>
      <h3>Không tìm thấy bài viết nào</h3>
      <p>Thử thay đổi bộ lọc để xem kết quả khác</p>
      <button
        onClick={() => setFilterStatus("all")}
        className="reset-filter-btn"
      >
        Xem tất cả bài viết
      </button>
      <style jsx>{`
        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          grid-column: 1 / -1; /* Span across all columns */
        }
        .no-results-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .no-results h3 {
          color: #374151;
          margin-bottom: 8px;
          font-size: 20px;
        }
        .no-results p {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .reset-filter-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .reset-filter-btn:hover {
          background: #c0392b;
        }
      `}</style>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <div className="blog-mine-container">
      {/* Header */}
      <div className="header-section">
        <div className="title-section">
          <h1 className="main-title">
            <span className="title-icon">📚</span>
            Bài viết của tôi
          </h1>
          <p className="subtitle">
            Quản lý và theo dõi tất cả bài viết bạn đã tạo
          </p>
        </div>

        <div className="header-actions">
          <Link to="/blogs/create" className="btn btn-primary">
            <span className="btn-icon">✏️</span>
            Tạo bài mới
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-number">{blogs.length}</span>
          <span className="stat-label">Tổng bài viết</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {blogs.filter((b) => b.status === "Approved").length}
          </span>
          <span className="stat-label">Đã duyệt</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {blogs.filter((b) => b.status === "Pending").length}
          </span>
          <span className="stat-label">Chờ duyệt</span>
        </div>
      </div>

      {/* Filters */}
      {blogs.length > 0 && (
        <div className="filters-section">
          <div className="filter-group">
            <label>Lọc theo trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sắp xếp theo:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Blog list */}
      <div className="blogs-section">
        {blogs.length === 0 ? (
          <EmptyState />
        ) : filteredAndSortedBlogs.length === 0 ? (
          <div className="blogs-grid">
            <NoResults />
          </div>
        ) : (
          <div className="blogs-grid">
            {filteredAndSortedBlogs.map((blog) => (
              <BlogCardPro
                key={blog._id}
                blog={blog}
                currentUser={JSON.parse(localStorage.getItem("user"))}
                showActions={true}
                actions={["edit", "delete"]}
                showStatusBadge={true}
                onEdit={() => navigate(`/blogs/${blog._id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .blog-mine-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding: 30px 0;
        }

        .title-section {
          flex: 1;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #e74c3c;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #555;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(to right, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
        }

        .btn-icon {
          font-size: 16px;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: none;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #e74c3c;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }

        .filters-section {
          background: white;
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          border: none;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: border-color 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #e74c3c;
        }

        .blogs-section {
          min-height: 200px;
          padding: 0;
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .blogs-grid {
            grid-template-columns: 1fr;
          }
        }

        .blog-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: none;
          transition: all 0.3s ease;
          height: fit-content;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-icon {
          font-size: 14px;
        }

        .blog-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .edit-btn {
          background: #fff3cd;
          color: #856404;
        }

        .edit-btn:hover {
          background: #ffeeba;
          transform: scale(1.1);
        }

        .delete-btn {
          background: #f8d7da;
          color: #721c24;
        }

        .delete-btn:hover {
          background: #f5c6cb;
          transform: scale(1.1);
        }

        .blog-content {
          flex: 1;
        }

        .blog-title {
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 700;
        }

        .blog-title a {
          color: #333;
          text-decoration: none;
          transition: color 0.3s;
        }

        .blog-title a:hover {
          color: #e74c3c;
        }

        .blog-excerpt {
          color: #666;
          line-height: 1.7;
          margin: 0 0 20px 0;
          font-size: 15px;
        }

        .blog-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-item {
          color: #999;
          font-size: 13px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .blog-mine-container {
            padding: 15px;
          }

          .header-section {
            flex-direction: column;
            gap: 20px;
          }

          .main-title {
            font-size: 2rem;
          }

          .filters-section {
            flex-direction: column;
            gap: 16px;
          }

          .stats-section {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .stats-section {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default BlogMine;
