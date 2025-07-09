import React, { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { EditorState, ContentState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function CommentItem({ comment, postId, onReload }) {
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorState, setEditorState] = useState(null);
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

  // Initialize editor state when going into edit mode
  const initializeEditor = () => {
    try {
      const blocksFromHtml = htmlToDraft(comment.content);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    } catch (error) {
      // Fallback if parsing HTML fails
      setEditorState(
        EditorState.createWithText(comment.content.replace(/<[^>]+>/g, ""))
      );
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    initializeEditor();
    setError(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditorState(null);
    setError(null);
  };

  const handleEditSave = async () => {
    if (!editorState.getCurrentContent().hasText()) {
      setError("Nội dung không được để trống!");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const content = draftToHtml(
        convertToRaw(editorState.getCurrentContent())
      );

      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/comments/${comment._id}`,
        { content },
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
                {editorState && (
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    wrapperClassName="comment-editor-wrapper"
                    editorClassName="comment-editor-body"
                    toolbarClassName="comment-editor-toolbar"
                    toolbar={{
                      options: ["inline", "colorPicker", "link", "emoji"],
                      inline: {
                        options: ["bold", "italic", "underline"],
                      },
                    }}
                    readOnly={loading}
                  />
                )}
                <div className="edit-action-group">
                  <button
                    className="edit-save-btn"
                    onClick={handleEditSave}
                    disabled={
                      loading || !editorState?.getCurrentContent().hasText()
                    }
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
              <p
                className="comment-text"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              ></p>
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
        .comment-item {
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .is-reply {
          margin-left: 2rem;
          border-left: 3px solid #e74c3c;
        }

        .author-info {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          color: #2c3e50;
        }

        .comment-time {
          font-size: 0.75rem;
          color: #7f8c8d;
        }

        .comment-body {
          margin-bottom: 0.5rem;
        }

        .comment-text {
          white-space: pre-wrap;
          line-height: 1.5;
          color: #2c3e50;
        }

        .comment-actions {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .reply-btn,
        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          padding: 0;
          color: #7f8c8d;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: inherit;
        }

        .reply-btn:hover,
        .edit-btn:hover {
          color: #e74c3c;
        }

        .delete-btn:hover {
          color: #c0392b;
        }

        .replies-count {
          margin-left: auto;
          color: #7f8c8d;
          font-size: 0.875rem;
        }

        .comment-editor-wrapper {
          border: 1px solid #ced4da;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .comment-editor-toolbar {
          border: none !important;
          border-bottom: 1px solid #ced4da !important;
          background-color: #f8f9fa !important;
        }

        .comment-editor-body {
          min-height: 100px !important;
          padding: 10px !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }

        .edit-action-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .edit-save-btn,
        .edit-cancel-btn {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .edit-save-btn {
          background-color: #e74c3c;
          color: #fff;
          border: none;
        }

        .edit-cancel-btn {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
        }

        .edit-error-msg {
          color: #e74c3c;
          font-size: 0.875rem;
          margin-left: 0.5rem;
        }

        .reply-form-container {
          margin-top: 1rem;
        }

        .reply-form-wrapper {
          margin-left: 2rem;
        }

        @media (max-width: 640px) {
          .is-reply {
            margin-left: 1rem;
          }

          .reply-form-wrapper {
            margin-left: 1rem;
          }
        }
      `}</style>
    </>
  );
}
