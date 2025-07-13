import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function CommentForm({ postId, parent, onDone }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    // Calculate text-only character count from editor state
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText("");
    setTextLength(plainText.length);
  }, [editorState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!content.trim() || content === "<p></p>") {
      setError("Bình luận không được để trống!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Bạn chưa đăng nhập!");

      await axios.post(
        `${API_BASE_URL}/comments`,
        { postId, content, parent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditorState(EditorState.createEmpty());
      setSuccess(true);

      // Hide success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);

      onDone && onDone();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-form-container">
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-input-group">
          <div className="input-wrapper">
            <Editor
              editorState={editorState}
              onEditorStateChange={(newState) => {
                setEditorState(newState);
                if (error) setError(null); // Clear error when user starts typing
              }}
              wrapperClassName="comment-editor-wrapper"
              editorClassName="comment-editor-body"
              toolbarClassName="comment-editor-toolbar"
              placeholder={
                parent ? "Viết phản hồi..." : "Viết bình luận của bạn..."
              }
              toolbar={{
                options: ["inline", "list", "textAlign", "history"],
                inline: {
                  options: ["bold", "italic", "underline", "strikethrough"],
                  inDropdown: false,
                  className: "toolbarInline",
                },
                list: {
                  options: ["unordered", "ordered"],
                  inDropdown: false,
                  className: "toolbarList",
                },
                textAlign: {
                  inDropdown: false,
                  className: "toolbarAlign",
                },
                history: {
                  inDropdown: false,
                  className: "toolbarHistory",
                },
              }}
              readOnly={loading}
            />
            <div className="input-helper">{textLength}/500 ký tự</div>
          </div>

          <button
            type="submit"
            disabled={loading || !editorState.getCurrentContent().hasText()}
            className="comment-submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <span className="btn-icon">💬</span>
                {parent ? "Phản hồi" : "Bình luận"}
              </>
            )}
          </button>
        </div>

        {/* Success notification */}
        {success && (
          <div className="notification success-notification">
            <span className="notification-icon">✅</span>
            <span>
              {parent ? "Phản hồi đã được gửi!" : "Bình luận đã được gửi!"}
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="notification error-notification">
            <span className="notification-icon">❌</span>
            <span>{error}</span>
          </div>
        )}
      </form>

      <style jsx>{`
        .comment-form-container {
          margin-bottom: 20px;
        }

        .comment-form {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .comment-input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-wrapper {
          flex: 1;
          position: relative;
        }

        .comment-editor-wrapper {
          border: 1px solid #ced4da;
          border-radius: 8px;
          overflow: hidden;
          min-height: 150px;
        }

        .comment-editor-toolbar {
          border: none !important;
          border-bottom: 1px solid #ced4da !important;
          background-color: #f8f9fa !important;
          padding: 8px 4px !important;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          position: relative !important;
          justify-content: space-between;
        }

        .comment-editor-toolbar button {
          border-radius: 4px !important;
          margin: 0 1px !important;
          padding: 5px !important;
          border: 1px solid #e9ecef !important;
        }

        .comment-editor-toolbar button:hover {
          background-color: #e9ecef !important;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        }

        .comment-editor-toolbar button.rdw-option-active {
          background-color: #e74c3c !important;
          color: white !important;
        }

        .comment-editor-toolbar .toolbarInline,
        .comment-editor-toolbar .toolbarList,
        .comment-editor-toolbar .toolbarAlign {
          margin-right: 8px !important;
          padding-right: 8px !important;
          border-right: 1px solid #e9ecef !important;
        }

        .comment-editor-toolbar .toolbarHistory {
          position: static !important;
          right: auto !important;
          top: auto !important;
          border-left: 1px solid #e9ecef !important;
          padding-left: 8px !important;
          background-color: #f8f9fa !important;
          margin-left: auto !important;
        }

        .comment-editor-toolbar .toolbarHistory button {
          background-color: #f8f9fa !important;
          border-color: #e9ecef !important;
        }

        .comment-editor-toolbar .toolbarHistory button:hover {
          background-color: #e9ecef !important;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        }
          border-bottom: 1px solid #ced4da !important;
          background-color: #f8f9fa !important;
        }

        .comment-editor-body {
          min-height: 100px !important;
          padding: 10px !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }

        .input-helper {
          color: #6c757d;
          font-size: 12px;
          text-align: right;
          margin-top: 4px;
        }

        .comment-submit-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          align-self: flex-end;
        }

        .comment-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .comment-submit-btn:disabled {
          background: #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
        }

        .notification {
          margin-top: 12px;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-notification {
          background-color: #d1fae5;
          color: #059669;
        }

        .error-notification {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .notification-icon {
          font-size: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 640px) {
          .comment-input-group {
            flex-direction: row;
          }

          .comment-submit-btn {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
