import React, { useState } from "react";
import CommentForm from "./CommentForm";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

export default function CommentItem({ comment, postId, onReload }) {
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy user hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("user")) || null;
  const userId = currentUser?._id || currentUser?.id; // lấy _id nếu có, không thì lấy id

  let authorId = null;
  if (comment.author) {
    if (typeof comment.author === "object" && comment.author._id)
      authorId = comment.author._id;
    else authorId = comment.author;
  }
  const isOwnComment =
    userId && authorId && String(userId) === String(authorId);
  const isAdmin = currentUser && currentUser.role === "Admin";

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setError(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError(null);
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) {
      setError("Nội dung không được để trống!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/comments/${comment._id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      onReload && onReload();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Lỗi khi cập nhật bình luận!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác!"
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/comments/${comment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onReload && onReload();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Lỗi khi xóa bình luận!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`comment-item ${comment.parent ? "is-reply" : "is-root"}`}
      >
        {/* Comment Content */}
        <div className="comment-content">
          <div className="comment-header">
            <div className="author-info">
              <div className="author-details">
                <span className="author-name">
                  {comment.author?.name || "Ẩn danh"}
                </span>
                <span className="comment-time">
                  {new Date(comment.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="comment-body">
            {isEditing ? (
              <div className="edit-form">
                <textarea
                  className="comment-edit-input"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: 15,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <div className="edit-action-group">
                  <button
                    className="edit-save-btn"
                    onClick={handleEditSave}
                    disabled={loading}
                  >
                    💾 Lưu
                  </button>
                  <button
                    className="edit-cancel-btn"
                    onClick={handleEditCancel}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  {error && <span className="edit-error-msg">{error}</span>}
                </div>
              </div>
            ) : (
              <p className="comment-text">{comment.content}</p>
            )}
          </div>

          <div className="comment-actions">
            <button
              className="reply-btn"
              onClick={() => setShowReply((s) => !s)}
            >
              <span className="reply-icon">↩️</span>
              {showReply ? "Hủy" : "Trả lời"}
            </button>
            {(isOwnComment || isAdmin) && !isEditing && (
              <>
                {isOwnComment && (
                  <button className="edit-btn" onClick={handleEdit}>
                    <span className="edit-icon">📝</span> Sửa
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <span className="delete-icon">🗑️</span> Xóa
                </button>
              </>
            )}
            {comment.replies?.length > 0 && (
              <span className="replies-count">
                {comment.replies.length} phản hồi
              </span>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReply && (
          <div className="reply-form-container">
            <div className="reply-form-wrapper">
              <CommentForm
                postId={postId}
                parent={comment._id}
                onDone={() => {
                  setShowReply(false);
                  onReload();
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div
          className={
            "replies-container" +
            (comment.parent ? " replies-nested" : " replies-first")
          }
        >
          {comment.replies.map((reply, index) => (
            <div key={reply._id} className="reply-wrapper">
              <CommentItem
                comment={reply}
                postId={postId}
                onReload={onReload}
              />
              {index < comment.replies.length - 1 && (
                <div className="reply-divider"></div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        /* Updated styles with red theme */
        .edit-form {
          margin-top: 8px;
        }
        .edit-action-group {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }
        .edit-save-btn {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .edit-save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c0392b, #a93226);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        .edit-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .edit-cancel-btn {
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .edit-cancel-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #e74c3c;
          color: #e74c3c;
          transform: translateY(-1px);
        }
        .edit-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .edit-error-msg {
          color: #e74c3c;
          margin-left: 10px;
          font-size: 13px;
          font-weight: 600;
        }
        .edit-btn,
        .delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .edit-btn {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          color: #e74c3c;
          border-color: #e9ecef;
          margin-left: 8px;
        }
        .edit-btn:hover {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-color: #e74c3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
        }
        .delete-btn {
          background: linear-gradient(135deg, #fdf2f2, #fef2f2);
          color: #e74c3c;
          border-color: #e74c3c;
          margin-left: 8px;
        }
        .delete-btn:hover {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-color: #e74c3c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }
        .edit-icon,
        .delete-icon {
          font-size: 13px;
        }
        .replies-container {
          /* Không thụt mặc định */
          margin-left: 0;
          border-left: none;
          padding-left: 0;
        }
        .replies-first {
          margin-left: 32px; /* Chỉ replies của comment root mới thụt vào */
          border-left: 2px solid #e9ecef;
          padding-left: 16px;
        }
        .replies-nested {
          margin-left: 0;
          border-left: none;
          padding-left: 0;
        }
      `}</style>
    </>
  );
}
