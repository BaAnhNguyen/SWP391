import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { API_BASE_URL } from "../../config";
import "./DonateRequestForm.css";

const DonateRequestForm = ({ onRequestCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    bloodGroup: "",
    component: "",
    readyDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // State cho form 2 bước
  const [step, setStep] = useState(1); // 1: Thông tin cơ bản, 2: Câu hỏi y tế
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Thêm state cho thông tin profile
  const [bloodGroupError, setBloodGroupError] = useState(null); // Thêm state cho lỗi nhóm máu

  const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
    "unknown",
  ];

  const components = [
    { value: "WholeBlood", label: t("donateRequest.component.wholeblood") },
    { value: "Plasma", label: t("donateRequest.component.plasma") },
    { value: "Platelets", label: t("donateRequest.component.platelets") },
    { value: "RedCells", label: t("donateRequest.component.redcells") },
    { value: "unknown", label: t("donateRequest.component.unknown") },
  ];
  useEffect(() => {
    // Component mount effect (empty)
  }, []);

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const userData = await response.json();
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear blood group error when user changes selection
    if (name === "bloodGroup") {
      setBloodGroupError(null);
    }
  };
  // Handle next button click
  const handleNext = async (e) => {
    e.preventDefault();

    // Validate blood group against user profile
    if (
      userProfile &&
      userProfile.bloodGroup &&
      formData.bloodGroup !== userProfile.bloodGroup
    ) {
      const errorMessage = t("donateRequest.bloodGroupError");
      setBloodGroupError(errorMessage);
      return; // Prevent proceeding to next step
    }
    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để tiếp tục");
      }

      // Gọi API để lấy danh sách câu hỏi y tế
      const apiUrl = `${API_BASE_URL}/question`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Không thể lấy câu hỏi: ${response.status}`);
      }

      const responseText = await response.text();

      // Thử parse JSON từ responseText
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("JSON parse error:", err);
        throw new Error("Định dạng dữ liệu không hợp lệ");
      }

      if (!Array.isArray(data)) {
        console.error("Dữ liệu không phải mảng:", data);
        throw new Error("Định dạng dữ liệu không hợp lệ: cần mảng các câu hỏi");
      }
      // Không throw error nữa khi không có câu hỏi nào
      if (data.length === 0) {
        console.warn("Không có câu hỏi nào");
        // Vẫn tiếp tục thay vì throw error
      }
      setQuestions(data);

      // Khởi tạo answers
      const initialAnswers = {};
      data.forEach((q) => {
        initialAnswers[q._id] = "";
      });

      setAnswers(initialAnswers);
      setStep(2); // Chuyển sang bước 2 sau khi có câu hỏi
    } catch (err) {
      console.error("Lỗi khi lấy câu hỏi:", err);
      setQuestionsError(err.message);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi câu trả lời y tế
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Kiểm tra xem tất cả câu hỏi đã được trả lời chưa
  const allQuestionsAnswered = () => {
    if (questions.length === 0) return true;

    return questions.every(
      (q) => answers[q._id] === "yes" || answers[q._id] === "no"
    );
  };

  // Hàm xử lý khi submit form cuối cùng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để tiếp tục");
      }

      // Tạo dữ liệu screening từ danh sách câu hỏi và câu trả lời
      const screening = questions.map((q) => {
        return {
          question: q.content || `Câu hỏi #${q._id}`, // Đảm bảo luôn có giá trị
          answer: answers[q._id] === "yes", // true if yes, false if no
        };
      });

      // Tạo request body với thông tin cơ bản và câu trả lời y tế
      const requestBody = {
        ...formData,
        screening,
        confirmation: true, // Member đã xác nhận thông tin
      };

      const response = await fetch(`${API_BASE_URL}/donateregistration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Lấy nội dung lỗi từ response
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          throw new Error(
            `Lỗi HTTP ${response.status}: ${response.statusText}`
          );
        }
        throw new Error(
          errorData.message || errorData.error || "Lỗi khi đăng ký hiến máu"
        );
      }

      setSuccess(true);
      setFormData({
        bloodGroup: "",
        component: "",
        readyDate: "",
      });
      setAnswers({});
      setStep(1); // Quay lại bước 1

      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donate-request-form-container">
      <h2>{t("donateRequest.title")}</h2>
      <p className="form-description">{t("donateRequest.description")}</p>

      {success && (
        <div className="success-message">
          Đăng ký hiến máu thành công! Cảm ơn bạn đã đăng ký hiến máu.
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Lỗi:</strong> {error}
          <p>
            Vui lòng kiểm tra thông tin và thử lại. Nếu lỗi vẫn tiếp diễn, hãy
            liên hệ quản trị viên.
          </p>
        </div>
      )}

      {/* Step 1: Thông tin cơ bản */}
      {step === 1 && (
        <form onSubmit={handleNext} className="donate-request-form">
          <div className="form-group">
            {" "}
            <label htmlFor="bloodGroup">
              {i18n.language === "vi" ? "Nhóm máu" : "Blood Group"}
              <span className="required">*</span>
            </label>{" "}
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
              className={`form-control ${bloodGroupError ? "error" : ""}`}
            >
              <option value="">
                {i18n.language === "vi"
                  ? "Chọn nhóm máu"
                  : "Select blood group"}
              </option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {bloodGroupError && (
              <div className="error-message">{bloodGroupError}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="component">
              Thành phần máu
              <span className="required">*</span>
            </label>
            <select
              id="component"
              name="component"
              value={formData.component}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Chọn thành phần máu</option>
              {components.map((comp) => (
                <option key={comp.value} value={comp.value}>
                  {comp.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="readyDate">
              Ngày hiến máu
              <span className="required">*</span>
            </label>
            <input
              type="date"
              id="readyDate"
              name="readyDate"
              value={formData.readyDate}
              onChange={handleChange}
              required
              className="form-control"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={questionsLoading}
          >
            {questionsLoading ? "Đang tải..." : "Tiếp theo"}
          </button>
        </form>
      )}

      {/* Step 2: Câu hỏi y tế */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="donate-request-form">
          <h3>Câu hỏi y tế</h3>

          {questionsError && (
            <div className="error-message">
              <p>{questionsError}</p>
              <button
                type="button"
                onClick={handleNext}
                className="retry-button"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Hiển thị debug info khi có lỗi */}

          {questions.length > 0 ? (
            <div className="medical-questions">
              {questions.map((question, index) => (
                <div key={question._id} className="form-group medical-question">
                  <label>
                    {index + 1}. {question.content}
                    <span className="required">*</span>
                  </label>
                  <div className="answer-options">
                    <label>
                      <input
                        type="radio"
                        name={`question_${question._id}`}
                        value="yes"
                        checked={answers[question._id] === "yes"}
                        onChange={() => handleAnswerChange(question._id, "yes")}
                        required
                      />
                      Có
                    </label>
                    <label style={{ marginLeft: "20px" }}>
                      <input
                        type="radio"
                        name={`question_${question._id}`}
                        value="no"
                        checked={answers[question._id] === "no"}
                        onChange={() => handleAnswerChange(question._id, "no")}
                        required
                      />
                      Không
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : questionsLoading ? (
            <div className="loading">Đang tải câu hỏi...</div>
          ) : (
            <div className="no-questions">
              Không có câu hỏi nào. Vui lòng kiểm tra lại kết nối hoặc thử lại.
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="back-button"
              onClick={() => setStep(1)}
            >
              Quay lại
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={loading || !allQuestionsAnswered()}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DonateRequestForm;
