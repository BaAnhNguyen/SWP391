import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const BlogCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (e) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    // Calculate text-only character count from editor state
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText("");
    setWordCount(plainText.length);
  }, [editorState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    if (!title.trim() || !content.trim() || content === "<p></p>") {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/blogs`,
        { title, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert("Tạo bài viết thành công! Bài viết đang chờ duyệt.");
        navigate("/blogs/mine");
      }
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      alert("Có lỗi xảy ra khi tạo bài viết!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || editorState.getCurrentContent().hasText()) {
      if (window.confirm("Bạn có chắc chắn muốn hủy? Nội dung sẽ bị mất.")) {
        navigate("/blogs/mine");
      }
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
                    options: [
                      "inline",
                      "blockType",
                      "fontSize",
                      "fontFamily",
                      "list",
                      "textAlign",
                      "history",
                    ],
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
                    blockType: {
                      inDropdown: true,
                      dropdownClassName: "blockTypeDropdown",
                      options: ["Normal", "H1", "H2", "H3", "H4"],
                    },
                    fontSize: {
                      options: [10, 12, 14, 16, 18, 24, 30, 36],
                      className: "fontSizeDropdown",
                    },
                    fontFamily: {
                      options: ["Arial", "Times New Roman", "Verdana"],
                      className: "fontFamilyDropdown",
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
          position: absolute !important;
          right: 10px !important;
          top: 8px !important;
          border-left: 1px solid #e9ecef !important;
          padding-left: 8px !important;
          background-color: #f8f9fa !important;
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
