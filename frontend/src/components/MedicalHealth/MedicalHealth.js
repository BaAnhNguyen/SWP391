import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./MedicalHealth.css";

const MedicalHealth = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedOrder, setEditedOrder] = useState(0);
  const [newQuestion, setNewQuestion] = useState({ content: "", order: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(t("medicalHealth.authError"));
      }
      const response = await fetch(`${API_BASE_URL}/question`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("medicalHealth.fetchError"));
      }

      const data = await response.json();
      // Sort questions by order
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle editing a question
  const handleEdit = (question) => {
    setEditQuestionId(question._id);
    setEditedContent(question.content);
    setEditedOrder(question.order);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditQuestionId(null);
    setEditedContent("");
    setEditedOrder(0);
  };

  // Save edited question
  const handleSaveEdit = async (id) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(t("medicalHealth.authError"));
      }
      const response = await fetch(`${API_BASE_URL}/question/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedContent,
          order: parseInt(editedOrder, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("medicalHealth.updateError"));
      }

      setEditQuestionId(null);
      setSuccess(t("medicalHealth.updateSuccess"));
      setTimeout(() => setSuccess(null), 3000);
      await fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      setError(error.message);
    }
  };

  // Delete question
  const handleOpenDeleteModal = (id) => {
    setDeleteQuestionId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteQuestionId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(t("medicalHealth.authError"));
      }

      if (!deleteQuestionId) {
        console.error("No question ID selected for deletion");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/question/${deleteQuestionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("medicalHealth.deleteError"));
      }

      setSuccess(t("medicalHealth.deleteSuccess"));
      setTimeout(() => setSuccess(null), 3000);
      handleCloseDeleteModal();
      await fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      setError(error.message);
      console.error("Error deleting question:", error);
      setError(error.message);
    }
  };

  // Handle input change for new question
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    });
  };

  // Add new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(t("medicalHealth.authError"));
      }

      // Validate inputs
      if (!newQuestion.content.trim()) {
        throw new Error(t("medicalHealth.contentRequired"));
      }

      const orderValue =
        parseInt(newQuestion.order, 10) || questions.length + 1;
      const response = await fetch(`${API_BASE_URL}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newQuestion.content,
          order: orderValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("medicalHealth.createError"));
      }

      setNewQuestion({ content: "", order: "" });
      setSuccess(t("medicalHealth.createSuccess"));
      setTimeout(() => setSuccess(null), 3000);
      await fetchQuestions();
    } catch (error) {
      console.error("Error creating question:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="medical-health-container">
        <div className="loader">{t("medicalHealth.loading")}</div>
      </div>
    );
  }

  return (
    <div className="medical-health-container">
      <div className="medical-health-header">
        <h2>{t("medicalHealth.title")}</h2>
        <p>{t("medicalHealth.description")}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="questions-list">
        <h3>{t("medicalHealth.currentQuestions")}</h3>

        {questions.length === 0 ? (
          <p>{t("medicalHealth.noQuestions")}</p>
        ) : (
          questions.map((question) => (
            <div
              key={question._id}
              className={`question-item ${
                editQuestionId === question._id ? "edit-mode" : ""
              }`}
            >
              {editQuestionId === question._id ? (
                // Edit mode
                <>
                  <div className="question-order">
                    <input
                      type="number"
                      value={editedOrder}
                      onChange={(e) => setEditedOrder(e.target.value)}
                      className="question-input"
                      min="1"
                      style={{ width: "60px" }}
                    />
                  </div>
                  <div className="question-content">
                    <input
                      type="text"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="question-input"
                    />
                  </div>
                  <div className="question-actions">
                    <button
                      onClick={() => handleSaveEdit(question._id)}
                      className="save-btn"
                    >
                      {t("medicalHealth.save")}
                    </button>
                    <button onClick={handleCancelEdit} className="cancel-btn">
                      {t("medicalHealth.cancel")}
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="question-order">{question.order}</div>
                  <div className="question-content">{question.content}</div>
                  <div className="question-actions">
                    <button
                      onClick={() => handleEdit(question)}
                      className="edit-btn"
                    >
                      {t("medicalHealth.edit")}
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(question._id)}
                      className="delete-btn"
                    >
                      {t("medicalHealth.delete")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="add-question-form">
        <h3>{t("medicalHealth.addNewQuestion")}</h3>
        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label htmlFor="content">
              {t("medicalHealth.questionContent")}
            </label>
            <input
              id="content"
              name="content"
              type="text"
              value={newQuestion.content}
              onChange={handleInputChange}
              className="question-input"
              placeholder={t("medicalHealth.questionPlaceholder")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="order">{t("medicalHealth.questionOrder")}</label>
            <input
              id="order"
              name="order"
              type="number"
              value={newQuestion.order}
              onChange={handleInputChange}
              className="question-input"
              placeholder={t("medicalHealth.orderPlaceholder", {
                nextOrder: questions.length + 1,
              })}
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="add-btn">
              {t("medicalHealth.add")}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="delete-modal"
          onClick={(e) => {
            if (e.target.className === "delete-modal") {
              handleCloseDeleteModal();
            }
          }}
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="delete-modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div
              className="delete-modal-header"
              style={{
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Delete</h3>
              <button
                className="close-button"
                onClick={handleCloseDeleteModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
            <div className="delete-modal-body" style={{ marginBottom: "20px" }}>
              <p>Are you sure you want to delete?</p>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <button
                className="cancel-btn"
                onClick={handleCloseDeleteModal}
                style={{
                  padding: "8px 24px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                CANCEL
              </button>
              <button
                className="delete-btn"
                onClick={handleDelete}
                style={{
                  padding: "8px 24px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHealth;
