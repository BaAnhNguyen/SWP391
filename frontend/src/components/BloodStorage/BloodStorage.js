import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import "./BloodStorage.css";

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
      <h2>Dashboard Tồn Kho Máu</h2>

      {/* Form nhập máu thủ công (nhập tay) */}
      <h3>Thêm máu vào kho (nhập tay)</h3>
      <form className="add-blood-form" onSubmit={handleAddBloodUnit}>
        <label>
          Nhóm máu:
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
        </label>
        <label>
          Thành phần:
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
        </label>
        <label>
          Số túi:
          <input
            type="number"
            name="Quantity"
            min="1"
            value={newUnit.Quantity}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Tổng thể tích (ml):
          <input
            type="number"
            name="Volume"
            min="1"
            value={newUnit.Volume}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Ghi chú:
          <input
            type="text"
            name="note"
            value={newUnit.note}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit" disabled={adding}>
          {adding ? "Đang thêm..." : "Thêm vào kho"}
        </button>
      </form>

      <div className="blood-summary-cards">
        {bloodTypes.map((type) => (
          <div
            key={type}
            className={`blood-summary-card ${getStatusClass(
              summaryData[type]?.status || "critical"
            )}`}
          >
            <div className="blood-type">{type}</div>
            <div className="blood-level">
              {summaryData[type]?.total || 0} túi
              <br />
              <span style={{ fontSize: "0.9em" }}>
                Tổng: {summaryData[type]?.totalVolume || 0} ml
              </span>
            </div>
            <div className="component-breakdown">
              <p>
                Toàn phần: {summaryData[type]?.WholeBlood || 0} (
                {summaryData[type]?.WholeBloodVolume || 0} ml)
              </p>
              <p>
                Huyết tương: {summaryData[type]?.Plasma || 0} (
                {summaryData[type]?.PlasmaVolume || 0} ml)
              </p>
              <p>
                Tiểu cầu: {summaryData[type]?.Platelets || 0} (
                {summaryData[type]?.PlateletsVolume || 0} ml)
              </p>
              <p>
                Hồng cầu: {summaryData[type]?.RedCells || 0} (
                {summaryData[type]?.RedCellsVolume || 0} ml)
              </p>
            </div>
            <div
              className={`status-label ${getStatusClass(
                summaryData[type]?.status || "critical"
              )}`}
            >
              {summaryData[type]?.status === "sufficient"
                ? "Đủ"
                : summaryData[type]?.status === "medium"
                ? "Trung bình"
                : "Cảnh báo"}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>BẢNG THỐNG KÊ/LỊCH SỬ NHẬP KHO MÁU</h2>
      <div className="filter-row" style={{ margin: "10px 0" }}>
        <label>
          Từ ngày:{" "}
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </label>
        <label>
          Đến ngày:{" "}
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </label>
        <label>
          Kiểu nhập:
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
              <th>Ngày nhập</th>
              <th>Nhóm máu</th>
              <th>Thành phần</th>
              <th>Số túi</th>
              <th>Thể tích (ml)</th>
              <th>Kiểu nhập</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredBloodInventory.length > 0 ? (
              filteredBloodInventory.map((unit) => (
                <tr key={unit._id}>
                  <td>{formatDate(unit.DateAdded)}</td>
                  <td>{unit.BloodType}</td>
                  <td>
                    {unit.ComponentType === "WholeBlood" && "Toàn phần"}
                    {unit.ComponentType === "Plasma" && "Huyết tương"}
                    {unit.ComponentType === "Platelets" && "Tiểu cầu"}
                    {unit.ComponentType === "RedCells" && "Hồng cầu"}
                  </td>
                  <td>{unit.Quantity || 1}</td>
                  <td>{unit.Volume || ""}</td>
                  <td>
                    {unit.SourceType === "donation"
                      ? "Hiến máu"
                      : unit.SourceType === "import"
                      ? "Nhập tay"
                      : ""}
                  </td>
                  <td>{unit.note || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Không có bản ghi phù hợp.</td>
              </tr>
            )}
            {/* Tổng kết cuối bảng */}
            <tr style={{ fontWeight: "bold", background: "#ffeaea" }}>
              <td colSpan="3">TỔNG</td>
              <td>{totalQuantity}</td>
              <td>{totalVolume}</td>
              <td colSpan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BloodStorage;
