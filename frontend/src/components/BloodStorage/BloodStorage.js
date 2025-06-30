import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./BloodStorage.css";
import "../../styles/colors.css";
import "../../styles/tables.css";
import "../../styles/blood-badges.css";

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}

function getDaysUntilExpiration(expirationDate) {
  if (!expirationDate) return "";
  const now = new Date();
  const exp = new Date(expirationDate);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getStatusClass(status) {
  switch (status) {
    case "sufficient":
      return "status-sufficient";
    case "medium":
      return "status-medium";
    case "critical":
      return "status-critical";
    default:
      return "";
  }
}

// Tổng hợp số túi & ml, chỉ máu còn hạn
const processBloodInventory = (data) => {
  const arr = Array.isArray(data) ? data : [];
  const summary = {};
  bloodTypes.forEach((type) => {
    summary[type] = {
      WholeBlood: 0,
      WholeBloodVolume: 0,
      Plasma: 0,
      PlasmaVolume: 0,
      Platelets: 0,
      PlateletsVolume: 0,
      RedCells: 0,
      RedCellsVolume: 0,
      total: 0,
      totalVolume: 0,
      status: "critical",
    };
  });

  const now = new Date();
  arr.forEach((unit) => {
    if (summary[unit.BloodType] && new Date(unit.DateExpired) > now) {
      const qty = Number(unit.Quantity) || 1;
      const vol = Number(unit.Volume) || 0;
      summary[unit.BloodType][unit.ComponentType] += qty;
      summary[unit.BloodType][unit.ComponentType + "Volume"] += vol;
      summary[unit.BloodType].total += qty;
      summary[unit.BloodType].totalVolume += vol;
    }
  });

  Object.keys(summary).forEach((type) => {
    const total = summary[type].total;
    if (total > 20) {
      summary[type].status = "sufficient";
    } else if (total > 10) {
      summary[type].status = "medium";
    } else {
      summary[type].status = "critical";
    }
  });

  return summary;
};

const BloodStorage = () => {
  const [bloodInventory, setBloodInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Lọc ngày và kiểu nhập cho bảng thống kê
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterSourceType, setFilterSourceType] = useState("all");

  // State cho form thêm máu nhập tay
  const [newUnit, setNewUnit] = useState({
    BloodType: "A+",
    ComponentType: "WholeBlood",
    Quantity: 1,
    Volume: 350,
    note: "",
  });
  const [adding, setAdding] = useState(false);

  // Load dữ liệu kho máu
  const fetchInventory = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/bloodunit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBloodInventory(data);
        } else if (data && Array.isArray(data.data)) {
          setBloodInventory(data.data);
        } else {
          setBloodInventory([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải kho máu.");
        setBloodInventory([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, []);

  const summaryData = processBloodInventory(bloodInventory);

  // Filter cho bảng lịch sử tăng kho
  const filteredBloodInventory = (
    Array.isArray(bloodInventory) ? bloodInventory : []
  ).filter((unit) => {
    // Lọc theo kiểu nhập
    if (filterSourceType !== "all" && unit.SourceType !== filterSourceType)
      return false;
    // Lọc theo ngày nhập (DateAdded)
    const date = new Date(unit.DateAdded);
    if (filterStartDate && date < new Date(filterStartDate)) return false;
    if (filterEndDate && date > new Date(filterEndDate + "T23:59:59"))
      return false;
    return true;
  });

  // Tổng số túi và tổng ml của filter hiện tại
  const totalQuantity = filteredBloodInventory.reduce(
    (sum, unit) => sum + (Number(unit.Quantity) || 1),
    0
  );
  const totalVolume = filteredBloodInventory.reduce(
    (sum, unit) => sum + (Number(unit.Volume) || 0),
    0
  );

  // Xử lý thay đổi form nhập tay
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUnit((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit thêm máu nhập tay
  const handleAddBloodUnit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/bloodunit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newUnit,
          Quantity: Number(newUnit.Quantity),
          Volume: Number(newUnit.Volume),
          SourceType: "import",
        }),
      });
      if (!res.ok) throw new Error("Không thể thêm máu vào kho!");
      setNewUnit({
        BloodType: "A+",
        ComponentType: "WholeBlood",
        Quantity: 1,
        Volume: 350,
        note: "",
      });
      // Reload dashboard
      fetchInventory();
      setShowAddForm(false); // Hide form after successful submission
    } catch (err) {
      alert(err.message);
    }
    setAdding(false);
  };

  // Xóa máu khỏi kho
  const handleDeleteBloodUnit = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn vị máu này không?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/bloodunit/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
    } catch (err) {
      alert("Lỗi khi xóa đơn vị máu!");
    }
  };

  return (
    <div className="blood-storage-container">
      <h1>Trung Tâm Quản Lý Máu</h1>

      {error && (
        <div className="error-message" style={{
          color: "white",
          padding: "12px 20px",
          background: "linear-gradient(135deg, #e74c3c, #c0392b)",
          borderRadius: "8px",
          margin: "15px 0",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(231, 76, 60, 0.2)"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading" style={{
          textAlign: "center",
          padding: "30px 20px",
          color: "#e74c3c",
          fontSize: "1.1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px"
        }}>
          <div className="loading-spinner"></div>
          <div>Đang tải dữ liệu kho máu...</div>
        </div>
      ) : (
        <>
          <h2>Tổng Quan Kho Máu</h2>

          <div className="blood-storage-dashboard">
            {bloodTypes.map((type) => (
              <div key={type} className="blood-storage-card">
                <div className="blood-drop-icon" data-type={type}></div>
                <h3>{type}</h3>
                <div className={`blood-level ${getStatusClass(summaryData[type]?.status || "critical")}`}>
                  {summaryData[type]?.total || 0} túi ({summaryData[type]?.totalVolume || 0} ml)
                </div>
                <div className="component-breakdown">
                  <p><span>Toàn phần:</span> <span>{summaryData[type]?.WholeBlood || 0} ({summaryData[type]?.WholeBloodVolume || 0} ml)</span></p>
                  <p><span>Huyết tương:</span> <span>{summaryData[type]?.Plasma || 0} ({summaryData[type]?.PlasmaVolume || 0} ml)</span></p>
                  <p><span>Tiểu cầu:</span> <span>{summaryData[type]?.Platelets || 0} ({summaryData[type]?.PlateletsVolume || 0} ml)</span></p>
                  <p><span>Hồng cầu:</span> <span>{summaryData[type]?.RedCells || 0} ({summaryData[type]?.RedCellsVolume || 0} ml)</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="management-controls">
            <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="add-inventory-btn">
              {showAddForm ? '✖ Ẩn Form Nhập Máu' : '➕ Thêm Máu Vào Kho'}
            </button>
          </div>

          {showAddForm && (
            <div className="filter-section">
              <h3>Thêm Máu Vào Kho (Nhập Tay)</h3>
              <form className="add-blood-form filter-form" onSubmit={handleAddBloodUnit}>
                <div className="filter-form-group">
                  <label>Nhóm Máu:</label>
                  <select
                    name="BloodType"
                    value={newUnit.BloodType}
                    onChange={handleInputChange}
                  >
                    {bloodTypes.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-form-group">
                  <label>Thành Phần:</label>
                  <select
                    name="ComponentType"
                    value={newUnit.ComponentType}
                    onChange={handleInputChange}
                  >
                    <option value="WholeBlood">Toàn phần</option>
                    <option value="Plasma">Huyết tương</option>
                    <option value="Platelets">Tiểu cầu</option>
                    <option value="RedCells">Hồng cầu</option>
                  </select>
                </div>

                <div className="filter-form-group">
                  <label>Số Túi:</label>
                  <input
                    type="number"
                    name="Quantity"
                    min="1"
                    value={newUnit.Quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="filter-form-group">
                  <label>Thể Tích (ml):</label>
                  <input
                    type="number"
                    name="Volume"
                    min="1"
                    value={newUnit.Volume}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="filter-form-group">
                  <label>Ghi Chú:</label>
                  <input
                    type="text"
                    name="note"
                    value={newUnit.note}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={adding}>
                  {adding ? "Đang Xử Lý..." : "Thêm Vào Kho"}
                </button>
              </form>
            </div>
          )}

          <h2>Lịch Sử Nhập Kho Máu</h2>
          <div className="filter-row">
            <label>
              Từ Ngày:
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
            <label>
              Đến Ngày:
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
            <label>
              Kiểu Nhập:
              <select
                value={filterSourceType}
                onChange={(e) => setFilterSourceType(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="donation">Hiến máu</option>
                <option value="import">Nhập tay</option>
              </select>
            </label>
          </div>

          <div className="blood-inventory-table-wrapper">
            <table className="blood-inventory-table">
              <thead>
                <tr>
                  <th>Ngày Nhập</th>
                  <th>Nhóm Máu</th>
                  <th>Thành Phần</th>
                  <th>Số Túi</th>
                  <th>Thể Tích (ml)</th>
                  <th>Kiểu Nhập</th>
                  <th>Ghi Chú</th>
                  <th>Ngày Hết Hạn</th>
                  <th>Còn Lại (ngày)</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {filteredBloodInventory.length > 0 ? (
                  filteredBloodInventory.map((unit) => {
                    const days = getDaysUntilExpiration(unit.DateExpired);
                    const isExpired = days <= 0;
                    return (
                      <tr key={unit._id} className={isExpired ? "expired-row" : ""}>
                        <td>{formatDate(unit.DateAdded)}</td>
                        <td>{unit.BloodType}</td>
                        <td>
                          {unit.ComponentType === "WholeBlood" && "Toàn phần"}
                          {unit.ComponentType === "Plasma" && "Huyết tương"}
                          {unit.ComponentType === "Platelets" && "Tiểu cầu"}
                          {unit.ComponentType === "RedCells" && "Hồng cầu"}
                        </td>
                        <td>{unit.Quantity}</td>
                        <td>{unit.Volume}</td>
                        <td>
                          {unit.SourceType === "donation"
                            ? "Hiến máu"
                            : unit.SourceType === "import"
                              ? "Nhập tay"
                              : ""}
                        </td>
                        <td>{unit.note || ""}</td>
                        <td>{formatDate(unit.DateExpired)}</td>
                        <td
                          style={{
                            color: isExpired ? "#b80000" : undefined,
                            fontWeight: isExpired ? "bold" : undefined,
                          }}
                        >
                          {isExpired ? "Hết hạn" : days}
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteBloodUnit(unit._id)}
                            title="Xóa bản ghi này"
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10">Không có bản ghi phù hợp.</td>
                  </tr>
                )}
                {/* Tổng kết cuối bảng */}
                <tr style={{ fontWeight: "bold", background: "#ffeaea" }}>
                  <td colSpan="3">TỔNG</td>
                  <td>{totalQuantity}</td>
                  <td>{totalVolume}</td>
                  <td colSpan="5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BloodStorage;
