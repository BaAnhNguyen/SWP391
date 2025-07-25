import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Hàm hiển thị thông báo bằng innerHTML
const showNotification = (
  message,
  type = "info",
  duration = 3000,
  confirmCallback = null
) => {
  // Xóa thông báo cũ nếu có
  const existingNotification = document.getElementById("custom-notification");
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  // Tạo element mới cho thông báo
  const notification = document.createElement("div");
  notification.id = "custom-notification";

  // Xác định màu và icon dựa vào loại thông báo
  let bgColor, icon, borderColor, textColor;
  switch (type) {
    case "success":
      bgColor = "#e8f5e9";
      borderColor = "#4caf50";
      textColor = "#388e3c";
      icon = "✓";
      break;
    case "error":
      bgColor = "#ffebee";
      borderColor = "#f44336";
      textColor = "#d32f2f";
      icon = "✕";
      break;
    case "warning":
      bgColor = "#fff8e1";
      borderColor = "#ff9800";
      textColor = "#f57c00";
      icon = "⚠️";
      break;
    default:
      bgColor = "#e3f2fd";
      borderColor = "#2196f3";
      textColor = "#0288d1";
      icon = "ℹ️";
  }

  // Tạo nội dung HTML cho thông báo
  const buttons = confirmCallback
    ? `<div class="notification-actions">
      <button class="confirm-btn">Xác nhận</button>
      <button class="cancel-btn">Hủy</button>
    </div>`
    : `<div class="notification-actions">
      <button class="confirm-btn">OK</button>
    </div>`;

  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
      <div class="notification-close">&times;</div>
    </div>
    ${buttons}
  `;

  // CSS Inline cho thông báo
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 400px;
    background-color: ${bgColor};
    border-left: 4px solid ${borderColor};
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    overflow: hidden;
    animation: slideIn 0.3s ease-out;
  `;

  // Thêm CSS cho các phần tử con
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    #custom-notification .notification-content {
      display: flex;
      align-items: center;
      padding: 15px;
    }
    
    #custom-notification .notification-icon {
      font-size: 24px;
      margin-right: 12px;
      color: ${textColor};
    }
    
    #custom-notification .notification-message {
      flex: 1;
      color: ${textColor};
      font-size: 16px;
    }
    
    #custom-notification .notification-close {
      cursor: pointer;
      font-size: 20px;
      color: ${textColor};
      opacity: 0.7;
    }
    
    #custom-notification .notification-close:hover {
      opacity: 1;
    }
    
    #custom-notification .notification-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px 15px 15px;
      gap: 8px;
    }
    
    #custom-notification button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    #custom-notification .confirm-btn {
      background-color: ${borderColor};
      color: white;
    }
    
    #custom-notification .cancel-btn {
      background-color: rgba(0,0,0,0.1);
      color: ${textColor};
    }
    
    #custom-notification .confirm-btn:hover {
      filter: brightness(90%);
    }
    
    #custom-notification .cancel-btn:hover {
      background-color: rgba(0,0,0,0.15);
    }
  `;

  // Thêm thông báo vào body
  document.body.appendChild(style);
  document.body.appendChild(notification);

  // Thêm sự kiện xử lý cho nút đóng
  const closeButton = notification.querySelector(".notification-close");
  closeButton.addEventListener("click", () => {
    document.body.removeChild(notification);
    document.body.removeChild(style);
  });

  // Thêm sự kiện xử lý cho nút xác nhận
  const confirmButton = notification.querySelector(".confirm-btn");
  confirmButton.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    document.body.removeChild(notification);
    document.body.removeChild(style);
  });

  // Thêm sự kiện xử lý cho nút hủy nếu có
  const cancelButton = notification.querySelector(".cancel-btn");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      document.body.removeChild(notification);
      document.body.removeChild(style);
    });
  }

  // Tự động đóng sau khoảng thời gian nếu không phải là thông báo xác nhận
  if (!confirmCallback) {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
        document.body.removeChild(style);
      }
    }, duration);
  }
};

const BlogCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Kiểm tra quyền người dùng - Staff không được phép tạo bài viết
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser || currentUser.role === "Staff") {
      showNotification(
        "Bạn không có quyền tạo bài viết!",
        "error",
        3000,
        () => {
          navigate("/blogs");
        }
      );
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    // Calculate text-only character count from editor state
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText("");
    setWordCount(plainText.length);
  }, [editorState]);

  // Xử lý chọn ảnh
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 1) {
      showNotification("Chỉ được chọn tối đa 1 ảnh!", "warning");
      return;
    }

    // Kiểm tra kích thước file
    const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showNotification("Kích thước ảnh không được vượt quá 5MB!", "warning");
      return;
    }

    setSelectedImages(files);

    // Tạo preview cho ảnh
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve({
            file,
            url: e.target.result,
            name: file.name,
          });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreviews);
  };

  // Xóa ảnh đã chọn
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!title.trim() || !content.trim() || content === "<p></p>") {
      showNotification("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // Tạo FormData để gửi kèm ảnh
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // Thêm ảnh vào FormData
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await axios.post(`${API_BASE_URL}/blogs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        showNotification(
          "Tạo bài viết thành công! Bài viết đang chờ duyệt.",
          "success",
          3000,
          () => {
            navigate("/blogs/mine");
          }
        );
      }
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      showNotification("Có lỗi xảy ra khi tạo bài viết!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || editorState.getCurrentContent().hasText()) {
      showNotification(
        "Bạn có chắc chắn muốn hủy? Nội dung sẽ bị mất.",
        "warning",
        10000,
        () => {
          navigate("/blogs/mine");
        }
      );
    } else {
      navigate("/blogs/mine");
    }
  };

  return (
    <div className="blog-create-container">
      <div className="blog-create-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">✍️</span>
            Tạo Bài Viết Mới
          </h1>
          <p className="page-subtitle">
            Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng hiến máu
          </p>
        </div>
      </div>

      <div className="blog-create-content">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="blog-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <span className="label-text">Tiêu đề bài viết</span>
                <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết của bạn..."
                className="form-input title-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                <span className="label-text">Nội dung bài viết</span>
                <span className="required-mark">*</span>
              </label>
              <div className="content-input-container">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                  wrapperClassName="rich-editor-wrapper"
                  editorClassName="rich-editor-body"
                  toolbarClassName="rich-editor-toolbar"
                  placeholder="Viết nội dung bài viết của bạn ở đây... Hãy chia sẻ những thông tin hữu ích về hiến máu!"
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
                />
                <div className="word-counter">
                  <span
                    className={
                      wordCount > 5000 ? "count-warning" : "count-normal"
                    }
                  >
                    {wordCount} / 5000 ký tự
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">Ảnh minh họa</span>
                <span className="optional-mark">(Tùy chọn - 1 ảnh)</span>
              </label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="image-input"
                  style={{ display: "none" }}
                />
                <label htmlFor="images" className="image-upload-button">
                  <span className="upload-icon">📷</span>
                  <span>Chọn ảnh (1 ảnh, ≤ 5MB)</span>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="image-preview-container">
                    <h4>Ảnh đã chọn:</h4>
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview.url} alt="Preview" />
                          <button
                            type="button"
                            className="remove-image-button"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                          <span className="image-name">{preview.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-cancel"
                disabled={isSubmitting}
              >
                <span className="btn-icon">❌</span>
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  !editorState.getCurrentContent().hasText()
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">📝</span>
                    Tạo bài viết
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="tips-container">
          <div className="tips-card">
            <h3 className="tips-title">
              <span className="tips-icon">💡</span>
              Mẹo viết bài hiệu quả
            </h3>
            <ul className="tips-list">
              <li>Sử dụng tiêu đề súc tích và hấp dẫn</li>
              <li>Chia nội dung thành các đoạn ngắn dễ đọc</li>
              <li>Bao gồm thông tin chính xác và hữu ích</li>
              <li>Sử dụng ngôn ngữ đơn giản, dễ hiểu</li>
              <li>Kiểm tra chính tả trước khi đăng</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .blog-create-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .blog-create-header {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          padding: 4rem 2rem 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(231, 76, 60, 0.3);
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .title-icon {
          font-size: 2.5rem;
        }

        .page-subtitle {
          font-size: 1.2rem;
          opacity: 0.95;
          margin: 0;
          font-weight: 300;
          line-height: 1.6;
        }

        .blog-create-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .form-container {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .blog-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .label-text {
          color: #2c3e50;
        }

        .required-mark {
          color: #e74c3c;
          font-weight: bold;
        }

        .form-input {
          padding: 1rem 1.5rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
          background: #fff;
        }

        .form-input:focus {
          outline: none;
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
          transform: translateY(-1px);
        }

        .title-input {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .content-input-container {
          position: relative;
        }

        .rich-editor-wrapper {
          border: 1px solid #ced4da;
          border-radius: 8px;
          overflow: hidden;
          min-height: 400px;
        }

        .rich-editor-toolbar {
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

        .rich-editor-toolbar button {
          border-radius: 4px !important;
          margin: 0 1px !important;
          padding: 5px !important;
          border: 1px solid #e9ecef !important;
        }

        .rich-editor-toolbar button:hover {
          background-color: #e9ecef !important;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        }

        .rich-editor-toolbar button.rdw-option-active {
          background-color: #e74c3c !important;
          color: white !important;
        }

        .rich-editor-toolbar .rdw-dropdown-wrapper {
          border-radius: 4px !important;
          margin: 0 4px !important;
          border: 1px solid #ced4da !important;
          background-color: white !important;
        }

        .rich-editor-toolbar .rdw-dropdown-optionwrapper {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          border-radius: 4px !important;
        }

        .rich-editor-toolbar .rdw-dropdown-carettoopen {
          border-top-color: #555 !important;
        }

        .rich-editor-toolbar .toolbarInline,
        .rich-editor-toolbar .toolbarList,
        .rich-editor-toolbar .toolbarAlign {
          margin-right: 8px !important;
          padding-right: 8px !important;
          border-right: 1px solid #e9ecef !important;
        }

        .rich-editor-toolbar .toolbarHistory {
          position: static !important;
          right: auto !important;
          top: auto !important;
          border-left: 1px solid #e9ecef !important;
          padding-left: 8px !important;
          background-color: #f8f9fa !important;
          margin-left: auto !important;
        }

        .rich-editor-toolbar .toolbarHistory button {
          background-color: #f8f9fa !important;
          border-color: #e9ecef !important;
        }

        .rich-editor-toolbar .toolbarHistory button:hover {
          background-color: #e9ecef !important;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
        }

        .rich-editor-body {
          min-height: 350px !important;
          padding: 15px 20px !important;
          font-family: inherit !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
        }

        .word-counter {
          position: absolute;
          bottom: 10px;
          right: 15px;
          font-size: 0.85rem;
          color: #6c757d;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .count-warning {
          color: #e74c3c !important;
          font-weight: 600;
        }

        .count-normal {
          color: #6c757d;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          min-width: 140px;
          justify-content: center;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }

        .btn-submit {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .tips-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tips-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          height: fit-content;
        }

        .tips-title {
          color: #e74c3c;
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tips-icon {
          font-size: 1.5rem;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tips-list li {
          padding: 0.75rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 10px;
          border-left: 4px solid #e74c3c;
          color: #2c3e50;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .tips-list li:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
        }

        @media (max-width: 1024px) {
          .blog-create-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .tips-container {
            order: -1;
          }
        }

        /* Image Upload Styles */
        .image-upload-container {
          margin-top: 0.5rem;
        }

        .image-upload-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border: 2px dashed #e74c3c;
          border-radius: 12px;
          background: #fdf2f2;
          color: #e74c3c;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .image-upload-button:hover {
          background: #f8e8e8;
          border-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
        }

        .upload-icon {
          font-size: 1.5rem;
        }

        .optional-mark {
          color: #6c757d;
          font-weight: 400;
          font-size: 0.9rem;
        }

        .image-preview-container {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .image-preview-container h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .image-preview-grid {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .image-preview-item {
          position: relative;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          width: 300px;
          max-width: 100%;
        }

        .image-preview-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .remove-image-button {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background: #e74c3c;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .remove-image-button:hover {
          background: #c0392b;
          transform: scale(1.1);
        }

        .image-name {
          display: block;
          padding: 0.5rem;
          font-size: 0.8rem;
          color: #6c757d;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .blog-create-header {
            padding: 3rem 1rem 1.5rem;
          }

          .page-title {
            font-size: 2.2rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .page-subtitle {
            font-size: 1rem;
          }

          .blog-create-content {
            padding: 2rem 1rem;
          }

          .form-container {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.8rem;
          }

          .form-container {
            padding: 1rem;
          }

          .content-input {
            min-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogCreate;
