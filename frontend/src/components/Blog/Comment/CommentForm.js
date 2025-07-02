import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

export default function CommentForm({ postId, parent, onDone }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      setContent("");
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

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <div className="comment-form-container">
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-input-group">
          <div className="input-wrapper">
            <textarea
              value={content}
              onChange={handleInputChange}
              required
              placeholder={
                parent ? "Viết phản hồi..." : "Viết bình luận của bạn..."
              }
              disabled={loading}
              className="comment-input"
              rows="3"
            />
            <div className="input-helper">{content.length}/500 ký tự</div>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
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
            <button
              className="close-btn"
              onClick={() => setError(null)}
              type="button"
            >
              ×
            </button>
          </div>
        )}
      </form>

      <style jsx>{`
        .comment-form-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          margin: 16px 0;
        }

        .comment-form {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .comment-form:focus-within {
          border-color: #e74c3c; /* Red theme */
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1); /* Red theme */
        }

        .comment-input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-wrapper {
          flex: 1;
        }

        .comment-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s ease;
          background: #f9fafb;
          line-height: 1.5;
        }

        .comment-input:focus {
          outline: none;
          border-color: #e74c3c; /* Red theme */
          background: white;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1); /* Red theme */
        }

        .comment-input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .comment-input::placeholder {
          color: #9ca3af;
        }

        .input-helper {
          font-size: 12px;
          color: #6b7280;
          text-align: right;
          margin-top: 4px;
        }

        .comment-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(
            135deg,
            #e74c3c 0%,
            #c0392b 100%
          ); /* Red theme */
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-end;
          min-width: 120px;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); /* Red theme */
        }

        .comment-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
          background: linear-gradient(135deg, #c0392b, #a83226);
        }

        .comment-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: #9ca3af;
          box-shadow: none;
        }

        .btn-icon {
          font-size: 16px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .notification {
          margin-top: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .success-notification {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .error-notification {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          justify-content: space-between;
        }

        .notification-icon {
          font-size: 16px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .comment-form {
            padding: 16px;
          }

          .comment-input-group {
            gap: 16px;
          }

          .comment-input {
            font-size: 16px; /* Prevent zoom on iOS */
            min-height: 70px;
          }

          .comment-submit-btn {
            width: 100%;
            padding: 14px 24px;
          }
        }

        @media (max-width: 480px) {
          .comment-form {
            padding: 12px;
            border-radius: 8px;
          }

          .comment-input {
            padding: 10px 12px;
            min-height: 60px;
          }

          .comment-submit-btn {
            padding: 12px 20px;
            font-size: 14px;
          }
        }

        /* Parent comment styling (reply form) */
        ${parent
          ? `
          .comment-form {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            margin-left: 20px;
            position: relative;
          }
          
          .comment-form::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 20px;
            width: 8px;
            height: 2px;
            background: #3b82f6;
            border-radius: 2px;
          }
          
          @media (max-width: 768px) {
            .comment-form {
              margin-left: 10px;
            }
            
            .comment-form::before {
              left: -6px;
            }
          }
        `
          : ""}
      `}</style>
    </div>
  );
}
