import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCardPro from "./BlogCardPro";
import { API_BASE_URL } from "../../config";
import { Link, useNavigate } from "react-router-dom";

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
    if (!window.confirm(`Bạn có chắc muốn xóa bài viết "${blogTitle}"?`))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prev) => prev.filter((blog) => blog._id !== blogId));
    } catch (err) {
      alert("Lỗi khi xóa bài viết");
    }
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
        {user && (
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
            {user && (
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
