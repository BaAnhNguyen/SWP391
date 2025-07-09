// src/components/Blog/BlogCardPro.js
import React from "react";
import { Link } from "react-router-dom";

// Trạng thái bài viết
const STATUS_INFO = {
  Approved: { text: "Đã duyệt", color: "#10b981", bg: "#d1fae5", icon: "✅" },
  Pending: { text: "Chờ duyệt", color: "#f59e0b", bg: "#fef3c7", icon: "⏳" },
  Rejected: { text: "Từ chối", color: "#ef4444", bg: "#fee2e2", icon: "❌" },
};

export default function BlogCardPro({
  blog,
  currentUser,
  showActions = false,
  actions = [],
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showStatusBadge = false,
  statusOverride = null,
}) {
  const status = statusOverride || blog.status;
  const statusInfo = STATUS_INFO[status] || {
    text: status,
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: "❓",
  };

  // Check if current user is admin
  const isAdmin =
    currentUser?.role === "Admin" || currentUser?.role === "admin";

  // Admin can edit approved blogs
  const canEdit =
    actions.includes("edit") || (isAdmin && status === "Approved");

  // Show actions if explicitly set or if admin has edit permissions
  const shouldShowActions = showActions || (isAdmin && status === "Approved");

  return (
    <div className="blog-card-pro">
      <div className="blog-header">
        {showStatusBadge && (
          <div
            className="status-badge"
            style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
          >
            <span className="status-icon">{statusInfo.icon}</span>{" "}
            {statusInfo.text}
          </div>
        )}
        {shouldShowActions && (
          <div className="blog-actions">
            {canEdit && (
              <Link
                to={`/blogs/${blog._id}/edit`}
                className="action-btn edit-btn"
                title={isAdmin ? "Chỉnh sửa (Admin)" : "Chỉnh sửa"}
                onClick={onEdit}
              >
                ✏️
              </Link>
            )}
            {actions.includes("delete") && (
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete?.(blog._id, blog.title)}
                title="Xóa"
              >
                🗑️
              </button>
            )}
            {actions.includes("approve") && (
              <button
                className="action-btn approve-btn"
                onClick={() => onApprove?.(blog._id, blog.title)}
                title="Duyệt"
              >
                ✅
              </button>
            )}
            {actions.includes("reject") && (
              <button
                className="action-btn reject-btn"
                onClick={() => onReject?.(blog._id, blog.title)}
                title="Từ chối"
              >
                ❌
              </button>
            )}
          </div>
        )}
      </div>

      <div className="blog-content">
        <h3 className="blog-title">
          <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
        </h3>
        <p className="blog-excerpt">
          {blog.content
            ? blog.content.replace(/<[^>]+>/g, "").substring(0, 150)
            : ""}
          {blog.content &&
            blog.content.replace(/<[^>]+>/g, "").length > 150 &&
            "..."}
        </p>
        <div className="blog-meta">
          {blog.author?.name && (
            <span className="meta-item">👤 {blog.author.name}</span>
          )}
          <span className="meta-item">
            📅{" "}
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {blog.updatedAt !== blog.createdAt && (
            <span className="meta-item">
              ✏️ Cập nhật:{" "}
              {new Date(blog.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      <style jsx>{`
        .blog-card-pro {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .blog-card-pro::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }

        .blog-card-pro:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(231, 76, 60, 0.15);
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
          padding: 8px 14px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid currentColor;
        }
        .status-icon {
          font-size: 14px;
        }
        .blog-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.3s ease;
          text-decoration: none;
          font-weight: 600;
        }
        .edit-btn {
          background: #f8f9fa;
          color: #e74c3c;
          border: 2px solid #e9ecef;
        }
        .edit-btn:hover {
          background: #e74c3c;
          color: white;
          border-color: #e74c3c;
          transform: translateY(-2px);
        }
        .delete-btn {
          background: #fdf2f2;
          color: #e74c3c;
          border: 2px solid #e74c3c;
        }
        .delete-btn:hover {
          background: #e74c3c;
          color: white;
          transform: translateY(-2px);
        }
        .approve-btn {
          background: #f0f9ff;
          color: #2563eb;
          border: 2px solid #2563eb;
        }
        .approve-btn:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-2px);
        }
        .reject-btn {
          background: #fdf2f2;
          color: #e74c3c;
          border: 2px solid #e74c3c;
        }
        .reject-btn:hover {
          background: #e74c3c;
          color: white;
          transform: translateY(-2px);
        }
        .blog-content {
        }
        .blog-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 700;
        }
        .blog-title a {
          color: #2c3e50;
          text-decoration: none;
          transition: all 0.2s;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .blog-title a:hover {
          background: linear-gradient(135deg, #c0392b, #a93226);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .blog-excerpt {
          color: #6c757d;
          line-height: 1.6;
          margin: 0 0 16px 0;
          font-size: 14px;
          padding: 12px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 8px;
          border-left: 3px solid #e74c3c;
        }
        .blog-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .meta-item {
          color: #6c757d;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          background: #f8f9fa;
          border-radius: 4px;
          width: fit-content;
        }
      `}</style>
    </div>
  );
}
