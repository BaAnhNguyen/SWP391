import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentTree from "./Comment/CommentTree";
import { API_BASE_URL } from "../../config";
import { useParams, useNavigate, Link } from "react-router-dom";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Không tìm thấy bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

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

  // Get role info
  const getRoleInfo = (role) => {
    switch (role) {
      case "Admin":
        return {
          text: "Quản trị viên",
          color: "#dc2626",
          bg: "#fee2e2",
          icon: "👑",
        };
      default:
        return {
          text: "Thành viên",
          color: "#059669",
          bg: "#d1fae5",
          icon: "👤",
        };
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="spinner"></div>
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
        }
        .spinner {
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
          Quay lại danh sách
        </button>
      </div>
      <style jsx>{`
        .error-container {
          text-align: center;
          padding: 60px 20px;
          background: #fdf2f2;
          border: 2px solid #e74c3c;
          border-radius: 16px;
          margin: 20px 0;
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
        .error-container p {
          color: #c0392b;
          margin-bottom: 20px;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .retry-btn,
        .back-btn {
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
        }
        .retry-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
        }
        .retry-btn:hover {
          background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        .back-btn {
          background: #f8f9fa;
          color: #2c3e50;
          border: 2px solid #e9ecef;
        }
        .back-btn:hover {
          background: #e9ecef;
          border-color: #e74c3c;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  if (!blog) return null;

  const statusInfo = getStatusInfo(blog.status);
  const roleInfo = getRoleInfo(blog.author?.role);

  return (
    <div className="blog-detail-container">
      {/* Back Navigation */}
      <div className="nav-section">
        <Link to="/blogs" className="back-link">
          <span className="back-arrow">←</span>
          Quay lại danh sách bài viết
        </Link>
      </div>

      {/* Blog Header */}
      <div className="blog-header">
        <div className="blog-title-section">
          <h1 className="blog-title">{blog.title}</h1>

          <div className="blog-meta">
            <div className="author-info">
              <div className="author-details">
                <span className="author-name">
                  {blog.author?.name || "Ẩn danh"}
                </span>
                <div
                  className="role-badge"
                  style={{
                    color: roleInfo.color,
                    backgroundColor: roleInfo.bg,
                  }}
                >
                  {roleInfo.text}
                </div>
              </div>
            </div>

            <div className="meta-info">
              <span className="meta-item">📅 {formatDate(blog.createdAt)}</span>
              {blog.updatedAt !== blog.createdAt && (
                <span className="meta-item">
                  ✏️ Cập nhật: {formatDate(blog.updatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="blog-status">
          <div
            className="status-badge"
            style={{
              color: statusInfo.color,
              backgroundColor: statusInfo.bg,
            }}
          >
            <span className="status-icon">{statusInfo.icon}</span>
            {statusInfo.text}
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="blog-content">
        <div className="content-wrapper">
          <div className="content-text">{blog.content}</div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <div className="comments-header">
          <h3 className="comments-title">
            <span className="comments-icon">💬</span>
            Bình luận
          </h3>
        </div>
        <div className="comments-wrapper">
          <CommentTree postId={id} />
        </div>
      </div>

      <style jsx>{`
        .blog-detail-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }

        .nav-section {
          margin-bottom: 20px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: white;
          backdrop-filter: blur(10px);
          border: 2px solid #e9ecef;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .back-link:hover {
          color: #e74c3c;
          background: #f8f9fa;
          border-color: #e74c3c;
          transform: translateX(-4px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.2);
        }

        .back-arrow {
          font-size: 16px;
          font-weight: 700;
        }

        .blog-header {
          background: white;
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }

        .blog-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }

        .blog-title-section {
          flex: 1;
        }

        .blog-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 20px 0;
          line-height: 1.2;
        }

        .blog-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .author-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          width: fit-content;
          border: 1px solid currentColor;
        }

        .meta-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-item {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
          padding: 4px 8px;
          background: #f8f9fa;
          border-radius: 6px;
          width: fit-content;
        }

        .blog-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          border: 2px solid currentColor;
        }

        .status-icon {
          font-size: 16px;
        }

        .blog-content {
          background: white;
          border-radius: 20px;
          margin-bottom: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .content-wrapper {
          padding: 32px;
        }

        .content-text {
          font-size: 16px;
          line-height: 1.8;
          color: #2c3e50;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .comments-section {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .comments-header {
          padding: 24px 32px;
          border-bottom: 2px solid #e9ecef;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .comments-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e74c3c;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .comments-icon {
          font-size: 1.25rem;
        }

        .comments-wrapper {
          padding: 24px 32px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .blog-detail-container {
            padding: 15px;
          }

          .blog-header {
            flex-direction: column;
            padding: 24px;
            gap: 16px;
          }

          .blog-title {
            font-size: 2rem;
          }

          .author-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .content-wrapper,
          .comments-header,
          .comments-wrapper {
            padding: 20px;
          }

          .meta-info {
            flex-direction: row;
            gap: 16px;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .blog-title {
            font-size: 1.75rem;
          }

          .author-name {
            font-size: 16px;
          }

          .meta-info {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;
