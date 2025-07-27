import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { API_BASE_URL } from "../../config";
import { useLocation } from "react-router-dom";
import "./DonateRequestForm.css";

const DonateRequestForm = ({ onRequestCreated }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [formData, setFormData] = useState({
    bloodGroup: "",
    component: "",
    readyDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [confirmationError, setConfirmationError] = useState(null);
  const [componentLocked, setComponentLocked] = useState(false);

  // State cho form 2 bước
  const [step, setStep] = useState(1); // 1: Thông tin cơ bản, 2: Câu hỏi y tế
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [bloodGroupError, setBloodGroupError] = useState(null);

  const [todayCount, setTodayCount] = useState(null);
  const [nextEligibleDate, setNextEligibleDate] = useState(null);

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
    { value: "WholeBlood", label: t("common.component.wholeblood") },
    { value: "Plasma", label: t("common.component.plasma") },
    { value: "Platelets", label: t("common.component.platelets") },
    { value: "RedCells", label: t("common.component.redcells") },
    { value: "unknown", label: t("common.component.unknown") },
  ];

  // Prefill component từ URL (chỉ component, không bloodGroup)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const componentParam = params.get("component");
    setFormData((prev) => ({
      ...prev,
      component: componentParam || prev.component,
    }));
    setComponentLocked(!!componentParam);
  }, [location.search]);

  // Fetch user profile và prefill bloodGroup nếu có
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");
        const userData = await response.json();
        setUserProfile(userData);

        setFormData((prev) => ({
          ...prev,
          bloodGroup: prev.bloodGroup || userData.bloodGroup || "",
        }));
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
    if (name === "bloodGroup") {
      setBloodGroupError(null);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (
      userProfile &&
      userProfile.bloodGroup &&
      formData.bloodGroup !== userProfile.bloodGroup
    ) {
      const errorMessage = t("donateRequest.bloodGroupError");
      setBloodGroupError(errorMessage);
      return;
    }
    setQuestionsLoading(true);
    setQuestionsError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập để tiếp tục");
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
        throw new Error(`Không thể lấy câu hỏi: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Định dạng dữ liệu không hợp lệ");
      }

      if (!Array.isArray(data)) {
        throw new Error("Định dạng dữ liệu không hợp lệ: cần mảng các câu hỏi");
      }
      setQuestions(data);

      // Khởi tạo answers
      const initialAnswers = {};
      data.forEach((q) => {
        initialAnswers[q._id] = "";
      });

      setAnswers(initialAnswers);
      setStep(2);
    } catch (err) {
      setQuestionsError(err.message);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const allQuestionsAnswered = () => {
    if (questions.length === 0) return true;
    return questions.every(
      (q) => answers[q._id] === "yes" || answers[q._id] === "no"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập để tiếp tục");

      const screening = questions.map((q) => ({
        question: q.content || `Câu hỏi #${q._id}`,
        answer: answers[q._id] === "yes",
      }));

      if (!confirmation) {
        setConfirmationError("Bạn phải xác nhận thông tin trước khi đăng ký.");
        setLoading(false);
        return;
      }

      const requestBody = {
        ...formData,
        screening,
        confirmation,
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
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
      setStep(1);

      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //load thong bao gioi han so lan gui
  useEffect(() => {
    const fetchTodayCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/donateregistration/countToday`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setTodayCount(data.count);
      } catch (err) {
        console.error("Lỗi khi lấy số lượng đơn hôm nay:", err);
      }
    };
    fetchTodayCount();
  }, []);

  //lay ngay hien tiep theo
  useEffect(() => {
    const fetchNextEligibleDate = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/donateRegistration/nextEligibleDate`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok)
          throw new Error("Không lấy được ngày hiến máu tiếp theo");

        const data = await response.json();
        if (data.nextEligibleDate) {
          setNextEligibleDate(new Date(data.nextEligibleDate));
        }
      } catch (err) {
        console.error("Lỗi lấy ngày đủ điều kiện hiến máu:", err);
      }
    };

    fetchNextEligibleDate();
  }, []);

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
      {nextEligibleDate && (
        <p style={{ marginTop: "1rem", color: "orange" }}>
          Bạn có thể hiến máu lại từ ngày:{" "}
          <strong>{nextEligibleDate.toLocaleDateString("vi-VN")}</strong>
        </p>
      )}

      {todayCount !== null && (
        <p
          style={{
            marginTop: "1rem",
            color: todayCount >= 3 ? "red" : "inherit",
          }}
        >
          Bạn đã đăng ký {todayCount}/3 đơn hôm nay.
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleNext} className="donate-request-form">
          <div className="form-group">
            <label htmlFor="bloodGroup">
              {i18n.language === "vi" ? "Nhóm máu" : "Blood Group"}
              <span className="required">*</span>
            </label>
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
              {t("needRequest.component")}
              <span className="required">*</span>
            </label>
            <select
              id="component"
              name="component"
              value={formData.component}
              onChange={handleChange}
              required
              className="form-control"
              disabled={componentLocked}
            >
              <option value="">{t("needRequest.selectComponent")}</option>
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
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={confirmation}
                onChange={() => {
                  setConfirmation(!confirmation);
                  setConfirmationError(null);
                }}
                required
              />
              &nbsp;Tôi xác nhận các thông tin trên là đúng và đồng ý tham gia
              hiến máu.
              <span className="required">*</span>
            </label>
            {confirmationError && (
              <div className="error-message">{confirmationError}</div>
            )}
          </div>

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
