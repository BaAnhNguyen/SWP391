import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdminPanel.css";
import { API_BASE_URL } from "../../config";

function AdminPanel() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("admin.authError"));
      }
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("admin.fetchError"));
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      if (error.response?.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token);
    if (token) {
      fetchUsers();
    } else {
      setError("No authentication token found. Please login again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  const changeRole = async (id, role) => {

    const confirmChange = window.confirm(t("admin.confirmRoleChange", { role }));
    if (!confirmChange) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("admin.authError"));
      }
      const response = await fetch(`${API_BASE_URL}/user/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("admin.updateError"));
      }
      await fetchUsers();
    } catch (error) {
      console.error("Error changing role:", error);
      alert(error.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("admin.authError"));
      }
      const response = await fetch(`${API_BASE_URL}/user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || t("admin.deleteError"));
      }
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.message);
    }
  };

  if (loading)
    return (
      <div className="admin-panel">
        <div className="admin-loading">{t("admin.loading")}</div>
      </div>
    );

  if (error)
    return (
      <div className="admin-panel">
        <div className="admin-error">{error}</div>
      </div>
    );

  return (
    <div className="admin-panel">
      <h1>{t("admin.title")}</h1>
      <p>{t("admin.description")}</p>

      <div className="admin-sections">
        <div className="admin-section">
          <h2>{t("admin.users.title")}</h2>
          <div className="admin-card">
            <table>
              <thead>
                <tr>
                  <th>{t("admin.users.name")}</th>
                  <th>{t("admin.users.email")}</th>
                  <th>{t("admin.users.role")}</th>
                  <th>{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      {t("admin.users.noUsers")}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) =>
                            changeRole(u._id || u.id, e.target.value)
                          }
                        >
                          {["Member", "Staff", "Admin"].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteUser(u._id || u.id)}
                          className="delete-btn"
                        >
                          {t("admin.users.delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
