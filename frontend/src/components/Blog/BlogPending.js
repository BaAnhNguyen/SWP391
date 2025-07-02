import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCardPro from "./BlogCardPro";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";

// Format date helper function
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

export default function BlogPending() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Bạn chưa đăng nhập");
        const res = await axios.get(`${API_BASE_URL}/blogs/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Lỗi khi tải bài chờ duyệt");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  // Sort blogs
  const sortedBlogs = React.useMemo(() => {
    const sorted = [...blogs];
    sorted.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "author")
        return (a.author?.name || "").localeCompare(b.author?.name || "");
      return 0;
    });
    return sorted;
  }, [blogs, sortBy]);

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Bạn chắc chắn muốn duyệt bài "${title}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/blogs/${id}/approved`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert("Lỗi khi duyệt bài viết");
    }
  };

  const handleReject = async (id, title) => {
    if (!window.confirm(`Bạn chắc chắn muốn từ chối bài "${title}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/blogs/${id}/rejected`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert("Lỗi khi từ chối bài viết");
    }
  };

  if (loading) return <div>Đang tải bài viết chờ duyệt...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="blog-pending-container">
      <div className="header-section">
        <div className="title-section">
          <h1 className="main-title">
            <span className="title-icon">⏳</span>
            Bài viết chờ duyệt
          </h1>
          <p className="subtitle">
            Xem xét và phê duyệt các bài viết từ người dùng
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-number">{blogs.length}</span>
          <span className="stat-label">Bài viết chờ duyệt</span>
        </div>
        <div className="stat-card placeholder"></div>
        <div className="stat-card placeholder"></div>
      </div>

      {/* Sort */}
      {blogs.length > 0 && (
        <div className="filters-section">
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
              <option value="author">Tác giả A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Blog list */}
      <div className="blogs-section">
        {sortedBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Không có bài viết chờ duyệt</h3>
            <p>Tất cả bài viết đã được xem xét và xử lý!</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {sortedBlogs.map((blog) => (
              <BlogCardPro
                key={blog._id}
                blog={blog}
                currentUser={user}
                showActions={true}
                actions={["approve", "reject"]}
                showStatusBadge={true}
                statusOverride="Pending"
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .blog-pending-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
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

        .stat-card.placeholder {
          visibility: hidden;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #f59e0b;
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
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
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
          color: #f59e0b;
          background-color: #fef3c7;
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
        }

        .approve-btn {
          background: #d1fae5;
          color: #059669;
        }

        .approve-btn:hover {
          background: #a7f3d0;
          transform: scale(1.1);
        }

        .reject-btn {
          background: #fef2f2;
          color: #dc2626;
        }

        .reject-btn:hover {
          background: #fee2e2;
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

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-state h3 {
          color: #333;
          margin-bottom: 8px;
          font-size: 24px;
        }

        .empty-state p {
          margin-bottom: 24px;
          font-size: 16px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .blog-pending-container {
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
}
