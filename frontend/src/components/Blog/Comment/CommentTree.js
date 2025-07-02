import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { API_BASE_URL } from "../../../config";

const CommentTree = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/comments/${postId}`);
        setComments(res.data);
      } catch (err) {
        setError("Không lấy được bình luận!");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, reload]);

  function buildTree(list) {
    const map = {};
    list.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    const roots = [];
    list.forEach((c) => {
      if (c.parent) map[c.parent]?.replies.push(map[c._id]);
      else roots.push(map[c._id]);
    });
    return roots;
  }

  const commentTree = buildTree(comments);

  return (
    <div className="comment-tree-container">
      {/* Header Section */}
      <div className="comment-section-header">
        <h3 className="section-title">
          <span className="title-icon">💬</span>
          Bình luận ({comments.length})
        </h3>
        <p className="section-subtitle">
          Chia sẻ suy nghĩ của bạn về bài viết này
        </p>
      </div>

      {/* Comment Form */}
      <div className="comment-form-section">
        <CommentForm postId={postId} onDone={() => setReload((r) => r + 1)} />
      </div>

      {/* Comments List */}
      <div className="comments-list-section">
        {loading && (
          <div className="loading-state">
            <div className="loading-content">
              <div className="spinner-large"></div>
              <span className="loading-text">Đang tải bình luận...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <div>
                <h4>Có lỗi xảy ra!</h4>
                <p>{error}</p>
              </div>
            </div>
            <button
              className="retry-btn"
              onClick={() => setReload((r) => r + 1)}
            >
              <span className="retry-icon">🔄</span>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && commentTree.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <span className="empty-icon">💭</span>
              <h4>Chưa có bình luận nào</h4>
              <p>Hãy là người đầu tiên bình luận về bài viết này!</p>
            </div>
          </div>
        )}

        {!loading && !error && commentTree.length > 0 && (
          <div className="comments-list">
            {commentTree.map((comment, index) => (
              <div key={comment._id} className="comment-wrapper">
                <CommentItem
                  comment={comment}
                  postId={postId}
                  onReload={() => setReload((r) => r + 1)}
                />
                {index < commentTree.length - 1 && (
                  <div className="comment-divider"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .comment-tree-container {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background-color: #f9f9f9; /* Lighter background */
        }

        .comment-section-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px 0;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #333; /* Darker text for better contrast */
          margin: 0 0 8px 0;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 2rem;
          color: #e74c3c; /* Red theme */
        }

        .section-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .comment-form-section {
          margin-bottom: 40px;
        }

        .comments-list-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 4px solid #fde8e6; /* Lighter red */
          border-top: 4px solid #e74c3c; /* Red theme */
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

        .loading-text {
          font-size: 1rem;
          color: #555;
          font-weight: 500;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 40px;
          background: #fdf2f2;
          border-radius: 12px;
          border: 1px solid #e74c3c;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .error-icon {
          font-size: 2.5rem;
          color: #c0392b;
        }

        .error-state h4 {
          margin: 0;
          font-size: 1.25rem;
          color: #c0392b;
        }

        .error-state p {
          margin: 0;
          color: #c0392b;
        }

        .retry-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .retry-icon {
          font-size: 1.1rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
        }

        .empty-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 3.5rem;
          color: #e74c3c;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state h4 {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #666;
          line-height: 1.6;
        }

        /* Comments List */
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comment-wrapper {
          /* No specific styles needed here now */
        }

        .comment-divider {
          height: 1px;
          background-color: #e5e7eb;
          margin-top: 20px; /* Spacing after the item before the divider */
        }
      `}</style>
    </div>
  );
};

export default CommentTree;
