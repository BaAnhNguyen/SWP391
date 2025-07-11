import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdminPanel.css";
import { API_BASE_URL } from "../../config";

function AdminPanel() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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
    const confirmChange = window.confirm(
      t("admin.confirmRoleChange", { role })
    );
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

  // Ban user
  const banUser = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn BAN user này không?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Lỗi xác thực!");
      const response = await fetch(`${API_BASE_URL}/user/ban/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ban user thất bại!");
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  // Unban user
  const unbanUser = async (id) => {
    if (!window.confirm("Bạn muốn mở khóa user này?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Lỗi xác thực!");
      const response = await fetch(`${API_BASE_URL}/user/unban/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unban user thất bại!");
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  // Filter and sort users
  const filteredUsers = users.filter((user) => {
    const searchText = filterText.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText) ||
      user.role.toLowerCase().includes(searchText);

    // Apply role filter if not set to 'all'
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Apply sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === "role") {
      const roleOrder = { Admin: 1, Staff: 2, Member: 3 };
      if (sortDirection === "asc") {
        return roleOrder[a.role] - roleOrder[b.role];
      } else {
        return roleOrder[b.role] - roleOrder[a.role];
      }
    }

    let valA = a[sortField];
    let valB = b[sortField];

    // Handle string comparisons
    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  // Calculate user statistics
  const userStats = {
    total: users.length,
    admin: users.filter((user) => user.role === "Admin").length,
    staff: users.filter((user) => user.role === "Staff").length,
    member: users.filter((user) => user.role === "Member").length,
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          {" "}
          <div className="admin-section-header">
            <h2>{t("admin.users.title")}</h2>
            <button
              onClick={fetchUsers}
              className="admin-refresh-btn"
              title="Refresh User Data"
            >
              ↻
            </button>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-value">{userStats.total}</div>
              <div className="stat-label">{t("admin.users.totalUsers")}</div>
            </div>
            <div className="stat-card admin">
              <div className="stat-value">{userStats.admin}</div>
              <div className="stat-label">{t("admin.users.roleAdmin")}</div>
            </div>
            <div className="stat-card staff">
              <div className="stat-value">{userStats.staff}</div>
              <div className="stat-label">{t("admin.users.roleStaff")}</div>
            </div>
            <div className="stat-card member">
              <div className="stat-value">{userStats.member}</div>
              <div className="stat-label">{t("admin.users.roleMember")}</div>
            </div>
          </div>
          <div className="admin-card">
            <div className="admin-filter-sort">
              <div className="admin-search-container">
                <input
                  type="text"
                  placeholder={t("admin.users.search")}
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="admin-search"
                />
                {filterText && (
                  <button
                    onClick={() => setFilterText("")}
                    className="admin-search-clear"
                    aria-label="Clear search"
                  ></button>
                )}
              </div>

              <div className="admin-filters">
                <div className="admin-filter">
                  <span>{t("admin.users.role")}:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">{t("admin.users.allRoles")}</option>
                    <option value="Admin">{t("admin.users.roleAdmin")}</option>
                    <option value="Staff">{t("admin.users.roleStaff")}</option>
                    <option value="Member">
                      {t("admin.users.roleMember")}
                    </option>
                  </select>
                </div>
              </div>
              <div className="admin-sort">
                <span>{t("admin.users.sortBy")}:</span>
                <select
                  value={sortField}
                  onChange={(e) => handleSort(e.target.value)}
                  className="admin-sort-select"
                >
                  <option value="name">{t("admin.users.name")}</option>
                  <option value="email">{t("admin.users.email")}</option>
                  <option value="role">{t("admin.users.role")}</option>
                </select>
                <button
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="admin-sort-direction"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
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
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      {t("admin.users.noUsers")}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>
                        {u.name}
                        {u.isBanned && (
                          <span className="ban-status">
                            {" "}
                            {t("admin.users.ban")}
                          </span>
                        )}
                      </td>

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
                              {t(`admin.users.role${r}`)}
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
                        {u.isBanned ? (
                          <button
                            onClick={() => unbanUser(u._id || u.id)}
                            className="unban-btn"
                          >
                            {t("admin.users.unban")}
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(u._id || u.id)}
                            className="ban-btn"
                            title="Cấm user"
                          >
                            {t("admin.users.ban")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>{" "}
            <div className="admin-pagination">
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="admin-page-nav"
                    title="First Page"
                  >
                    «
                  </button>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="admin-page-nav"
                    title="Previous Page"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => {
                    // Show limited page buttons with ellipsis for large page counts
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => paginate(pageNum)}
                          className={`admin-page-btn ${
                            currentPage === pageNum ? "active" : ""
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={i} className="admin-page-ellipsis">
                          …
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="admin-page-nav"
                    title="Next Page"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="admin-page-nav"
                    title="Last Page"
                  >
                    »
                  </button>
                </>
              )}

              {totalPages > 0 && (
                <span className="admin-page-info">
                  {indexOfFirstUser + 1}-
                  {Math.min(indexOfLastUser, sortedUsers.length)} of{" "}
                  {sortedUsers.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
