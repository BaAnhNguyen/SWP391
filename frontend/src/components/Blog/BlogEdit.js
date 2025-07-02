import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useParams, useNavigate } from "react-router-dom";

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({ title: res.data.title, content: res.data.content });
        setStatus(res.data.status);
      } catch (err) {
        setError("Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa!");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== "Admin" && status !== "Pending") {
      setError("Bạn chỉ có thể chỉnh sửa bài khi đang chờ duyệt.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/blogs/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/blogs/mine");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Lỗi khi cập nhật bài viết!"
      );
    } finally {
      setSaving(false);
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
        <button onClick={() => navigate("/blogs/mine")} className="back-btn">
          Quay lại
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
          .back-btn {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
          }
        `}</style>
      </div>
    );

  return (
    <div className="blog-create-container">
      <div className="header-section">
        <div className="title-section">
          <h1 className="main-title">
            <span className="title-icon">✏️</span>
            Chỉnh sửa bài viết
          </h1>
          <p className="subtitle">
            Chỉnh sửa nội dung bài viết của bạn khi bài chưa được duyệt
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: "16px 0" }}>
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="blog-form">
          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Tiêu đề</span>
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Nhập tiêu đề bài viết của bạn..."
              disabled={
                saving || (status !== "Pending" && user?.role !== "Admin")
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span className="label-text">Nội dung</span>
              <span className="required">*</span>
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              className="form-textarea"
              placeholder="Viết nội dung bài viết của bạn ở đây..."
              rows="12"
              disabled={
                saving || (status !== "Pending" && user?.role !== "Admin")
              }
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={
                saving || (status !== "Pending" && user?.role !== "Admin")
              }
            >
              {saving ? (
                <>
                  <span className="spinner"></span>
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .blog-create-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }

        .header-section {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(231, 76, 60, 0.3);
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          margin: 0;
          font-weight: 300;
        }

        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin: 20px 0;
          font-weight: 500;
        }

        .alert-danger {
          background: #fdf2f2;
          color: #e74c3c;
          border: 2px solid #e74c3c;
        }

        .form-container {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .blog-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .required {
          color: #e74c3c;
          font-weight: bold;
        }

        .form-input,
        .form-textarea {
          padding: 14px 18px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          font-family: inherit;
          background: #fff;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
          transform: translateY(-1px);
        }

        .form-input:disabled,
        .form-textarea:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          min-height: 200px;
          line-height: 1.6;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
        }

        .cancel-btn,
        .submit-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .submit-btn {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }

        .cancel-btn:disabled,
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        @media (max-width: 768px) {
          .blog-create-container {
            padding: 15px;
          }

          .header-section {
            padding: 30px 15px;
          }

          .main-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 8px;
          }

          .form-container {
            padding: 20px;
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-btn,
          .submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogEdit;
