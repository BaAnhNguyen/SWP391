/**
 * BloodStorage Component
 * 
 * This component is responsible for displaying and managing the blood storage inventory.
 * It provides functionality for:
 * - Viewing blood inventory summary by blood type and component
 * - Adding new blood units to inventory manually
 * - Viewing detailed inventory history with filtering options
 * - Deleting blood units from inventory
 * - Tracking expiration dates and status of blood units
 * - Pagination for inventory history table
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./BloodStorage.css";
import "../../styles/colors.css";
import "../../styles/tables.css";
import "../../styles/blood-badges.css";
import EnglishBloodDeleteConfirmModal from "./EnglishBloodDeleteConfirmModal";

/**
 * Array of all blood types for display and filtering
 */
const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/**
 * Formats a date string to locale date format
 * 
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted date string in user's locale format
 */
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
}

/**
 * Calculates the number of days until a blood unit expires
 * 
 * @param {string} expirationDate - ISO date string of expiration date
 * @returns {number} Number of days until expiration (negative if already expired)
 */
function getDaysUntilExpiration(expirationDate) {
  if (!expirationDate) return "";
  const now = new Date();
  const exp = new Date(expirationDate);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * Gets the CSS class name for a blood inventory status
 * 
 * @param {string} status - Status of blood inventory ('sufficient', 'medium', 'critical')
 * @returns {string} CSS class name for styling the status
 */
function getStatusClass(status) {
  switch (status) {
    case "sufficient":
      return "status-sufficient";  // Green - Good supply
    case "medium":
      return "status-medium";      // Orange - Medium supply
    case "critical":
      return "status-critical";    // Red - Critical/Low supply
    default:
      return "";
  }
}

/**
 * Processes blood inventory data to create a summary by blood type and component
 * Calculates totals and determines inventory status (critical, medium, sufficient)
 * Only includes blood units that have not expired
 * 
 * @param {Array} data - Raw blood inventory data from API
 * @returns {Object} Summarized inventory data grouped by blood type with status indicators
 */
const processBloodInventory = (data) => {
  // Ensure data is an array
  const arr = Array.isArray(data) ? data : [];

  // Initialize summary object with zeroes for all blood types and components
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
      status: "critical",  // Default to critical until evaluated
    };
  });

  // Current date for checking expiration
  const now = new Date();

  // Process each blood unit and update the summary
  arr.forEach((unit) => {
    // Only count units that haven't expired and have a valid blood type
    if (summary[unit.BloodType] && new Date(unit.DateExpired) > now) {
      const qty = Number(unit.Quantity) || 1;  // Default to 1 if quantity not specified
      const vol = Number(unit.Volume) || 0;    // Default to 0 if volume not specified

      // Update component-specific counts
      summary[unit.BloodType][unit.ComponentType] += qty;
      summary[unit.BloodType][unit.ComponentType + "Volume"] += vol;

      // Update total counts
      summary[unit.BloodType].total += qty;
      summary[unit.BloodType].totalVolume += vol;
    }
  });

  // Determine status for each blood type based on total units available
  Object.keys(summary).forEach((type) => {
    const total = summary[type].total;
    if (total > 20) {
      summary[type].status = "sufficient";  // More than 20 units is sufficient
    } else if (total > 10) {
      summary[type].status = "medium";      // 11-20 units is medium
    } else {
      summary[type].status = "critical";    // 0-10 units is critical
    }
  });

  return summary;
};

/**
 * BloodStorage component for managing blood inventory
 * 
 * @returns {JSX.Element} The rendered BloodStorage component
 */
const BloodStorage = () => {
  // Core hooks and state
  const { t } = useTranslation();  // Translation hook
  const [bloodInventory, setBloodInventory] = useState([]);  // Blood inventory data from API
  const [loading, setLoading] = useState(true);  // Loading state for API calls
  const [error, setError] = useState(null);  // Error state for API calls
  const [showAddForm, setShowAddForm] = useState(false);  // Controls visibility of add blood form

  // Filter states for inventory table
  const [filterStartDate, setFilterStartDate] = useState("");  // Start date filter
  const [filterEndDate, setFilterEndDate] = useState("");  // End date filter
  const [filterSourceType, setFilterSourceType] = useState("all");  // Source type filter (donation/import/all)

  // Pagination states for inventory history table
  const [currentPage, setCurrentPage] = useState(1);  // Current page number
  const [itemsPerPage, setItemsPerPage] = useState(10);  // Number of items per page

  // State for the manual blood entry form
  const [newUnit, setNewUnit] = useState({
    bloodType: "A+",  // Default blood type
    volume: 450,  // Default volume (450ml is standard for whole blood donation)
    sourceType: "Donation",  // Default source type
    collectionDate: new Date().toISOString().split('T')[0],  // Default collection date (today)
  });
  const [adding, setAdding] = useState(false);  // Loading state for adding blood unit

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);  // Controls visibility of delete modal
  const [deleteItemId, setDeleteItemId] = useState(null);  // ID of blood unit to delete

  /**
   * Fetches blood inventory data from the API
   * Updates state with the fetched data or error message
   */
  const fetchInventory = () => {
    setLoading(true);  // Start loading

    // Get authentication token
    const token = localStorage.getItem("token");

    // Fetch blood units from API
    fetch(`${API_BASE_URL}/bloodunit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle different response formats
        if (Array.isArray(data)) {
          // Direct array response
          setBloodInventory(data);
        } else if (data && Array.isArray(data.data)) {
          // Nested data property containing array
          setBloodInventory(data.data);
        } else {
          // No valid data format, set empty array
          setBloodInventory([]);
        }
        setLoading(false);  // End loading
      })
      .catch((err) => {
        // Handle fetch errors
        setError(err.message || "Unable to load blood storage data.");
        setBloodInventory([]);  // Reset inventory on error
        setLoading(false);  // End loading
      });
  };

  /**
   * Effect hook to fetch inventory data when component mounts
   */
  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, []);

  // Process blood inventory data for summary display
  const summaryData = processBloodInventory(bloodInventory);

  /**
   * Filter blood inventory based on selected filters
   * Filters by source type and date range
   */
  const filteredBloodInventory = (
    Array.isArray(bloodInventory) ? bloodInventory : []
  ).filter((unit) => {
    // Filter by source type (donation, import, or all)
    if (filterSourceType !== "all" && unit.SourceType !== filterSourceType)
      return false;

    // Filter by date added
    const date = new Date(unit.DateAdded);
    // Check if date is after start date (if provided)
    if (filterStartDate && date < new Date(filterStartDate)) return false;
    // Check if date is before end date (if provided, including the entire end day)
    if (filterEndDate && date > new Date(filterEndDate + "T23:59:59"))
      return false;

    // Include this unit if it passes all filters
    return true;
  });

  // Calculate pagination values
  const totalItems = filteredBloodInventory.length;  // Total number of filtered items
  const totalPages = Math.ceil(totalItems / itemsPerPage);  // Total number of pages

  /**
   * Effect hook to reset to first page when filters change
   * Prevents showing empty pages when filter results are smaller than current page
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSourceType, filterStartDate, filterEndDate]);

  // Get current page items based on pagination settings
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBloodInventory.slice(indexOfFirstItem, indexOfLastItem);

  /**
   * Pagination functions to navigate between pages
   */
  const paginate = (pageNumber) => setCurrentPage(pageNumber);  // Go to specific page
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));  // Go to next page
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));  // Go to previous page

  /**
   * Calculate totals for filtered inventory
   * Used to display summary information at the bottom of the table
   */
  // Total number of blood bags/units
  const totalQuantity = filteredBloodInventory.reduce(
    (sum, unit) => sum + (Number(unit.Quantity) || 1),  // Default to 1 if quantity not specified
    0
  );
  // Total volume in ml
  const totalVolume = filteredBloodInventory.reduce(
    (sum, unit) => sum + (Number(unit.Volume) || 0),  // Default to 0 if volume not specified
    0
  );

  /**
   * Handles input changes in the manual blood entry form
   * Updates the newUnit state with the changed values
   * 
   * @param {Event} e - The input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;  // Get field name and new value
    setNewUnit((prev) => ({ ...prev, [name]: value }));  // Update state preserving other fields
  };

  /**
   * Handles the submission of the manual blood entry form
   * Adds a new blood unit to the inventory through API
   * 
   * @param {Event} e - The form submission event
   */
  const handleAddBloodUnit = async (e) => {
    e.preventDefault();  // Prevent default form submission
    setAdding(true);     // Set loading state

    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Send request to create new blood unit
      const res = await fetch(`${API_BASE_URL}/bloodunit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newUnit,
          Quantity: Number(newUnit.Quantity),  // Ensure quantity is a number
          Volume: Number(newUnit.Volume),      // Ensure volume is a number
          SourceType: "import",                // Mark as manually imported
        }),
      });

      // Handle unsuccessful response
      if (!res.ok) throw new Error(t("bloodStorage.addError"));

      // Reset form to default values on success
      setNewUnit({
        bloodType: "A+",
        volume: 450,
        sourceType: "Donation",
        collectionDate: new Date().toISOString().split('T')[0],
      });

      // Reload inventory data to include the new unit
      fetchInventory();

      // Hide the form after successful submission
      setShowAddForm(false);
    } catch (err) {
      // Display error message
      alert(err.message);
    } finally {
      // Reset loading state regardless of outcome
      setAdding(false);
    }
  };

  /**
   * Opens the delete confirmation modal for a blood unit
   * 
   * @param {string} id - The ID of the blood unit to delete
   */
  const openDeleteModal = (id) => {
    setDeleteItemId(id);     // Set the ID of unit to delete
    setShowDeleteModal(true); // Show the confirmation modal
  };

  /**
   * Closes the delete confirmation modal and resets state
   */
  const closeDeleteModal = () => {
    setShowDeleteModal(false); // Hide the confirmation modal
    setDeleteItemId(null);    // Clear the ID of unit to delete
  };

  /**
   * Handles the deletion of a blood unit after confirmation
   * Removes the unit from inventory through API
   */
  const handleDeleteBloodUnit = async () => {
    // Check if there is a valid unit ID to delete
    if (!deleteItemId) return;

    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Send request to delete blood unit
      await fetch(`${API_BASE_URL}/bloodunit/${deleteItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Close the modal after successful deletion
      closeDeleteModal();

      // Refresh inventory data to remove deleted unit
      fetchInventory();
    } catch (err) {
      // Display error message
      alert(t("bloodStorage.deleteError"));
    }
  };

  /**
   * Gets the translated name for a blood component type
   * 
   * @param {string} componentType - The blood component type key
   * @returns {string} Translated name of the component
   */
  const getComponentTranslation = (componentType) => {
    switch (componentType) {
      case "WholeBlood":
        return t("bloodStorage.wholeBlood"); // Whole blood
      case "Plasma":
        return t("bloodStorage.plasma");     // Blood plasma
      case "Platelets":
        return t("bloodStorage.platelets");  // Blood platelets
      case "RedCells":
        return t("bloodStorage.redCells");   // Red blood cells
      default:
        return componentType;                // Return original if no translation
    }
  };

  /**
   * Gets the translated name for a blood source type
   * 
   * @param {string} sourceType - The source type key (donation/import)
   * @returns {string} Translated name of the source type
   */
  const getSourceTypeTranslation = (sourceType) => {
    switch (sourceType) {
      case "donation":
        return t("bloodStorage.donation"); // From direct donation
      case "import":
        return t("bloodStorage.import");   // Manually imported
      default:
        return sourceType;                 // Return original if no translation
    }
  };

  return (
    <div className="blood-storage-container">
      {/* Page Title */}
      <h1>{t("bloodStorage.centerTitle")}</h1>

      {/* Error Message Display */}
      {error && (
        <div
          className="error-message"
          style={{
            color: "white",
            padding: "12px 20px",
            background: "linear-gradient(135deg, #e74c3c, #c0392b)",
            borderRadius: "8px",
            margin: "15px 0",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(231, 76, 60, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="loading"
          style={{
            textAlign: "center",
            padding: "30px 20px",
            color: "#e74c3c",
            fontSize: "1.1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div className="loading-spinner"></div>
          <div>{t("bloodStorage.loading")}</div>
        </div>
      ) : (
        <>
          <h2>{t("bloodStorage.overview")}</h2>

          <div className="blood-storage-dashboard">
            {bloodTypes.map((type) => (
              <div key={type} className="blood-storage-card">
                <div className="blood-drop-icon" data-type={type}></div>
                <h3>{type}</h3>
                <div
                  className={`blood-level ${getStatusClass(
                    summaryData[type]?.status || "critical"
                  )}`}
                >
                  {summaryData[type]?.total || 0} {t("bloodStorage.units")} (
                  {summaryData[type]?.totalVolume || 0} ml)
                </div>
                <div className="component-breakdown">
                  <p>
                    <span>{t("bloodStorage.wholeBlood")}:</span>{" "}
                    <span>
                      {summaryData[type]?.WholeBlood || 0} (
                      {summaryData[type]?.WholeBloodVolume || 0} ml)
                    </span>
                  </p>
                  <p>
                    <span>{t("bloodStorage.plasma")}:</span>{" "}
                    <span>
                      {summaryData[type]?.Plasma || 0} (
                      {summaryData[type]?.PlasmaVolume || 0} ml)
                    </span>
                  </p>
                  <p>
                    <span>{t("bloodStorage.platelets")}:</span>{" "}
                    <span>
                      {summaryData[type]?.Platelets || 0} (
                      {summaryData[type]?.PlateletsVolume || 0} ml)
                    </span>
                  </p>
                  <p>
                    <span>{t("bloodStorage.redCells")}:</span>{" "}
                    <span>
                      {summaryData[type]?.RedCells || 0} (
                      {summaryData[type]?.RedCellsVolume || 0} ml)
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="management-controls">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-inventory-btn"
            >
              {showAddForm
                ? `✖ ${t("bloodStorage.hideForm")}`
                : `➕ ${t("bloodStorage.addToStorage")}`}
            </button>
          </div>

          {showAddForm && (
            <div className="filter-section">
              <h3>{t("bloodStorage.manualEntry")}</h3>
              <form
                className="add-blood-form filter-form"
                onSubmit={handleAddBloodUnit}
              >
                <div className="filter-form-group">
                  <label>{t("bloodStorage.bloodType")}:</label>
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
                  <label>{t("bloodStorage.component")}:</label>
                  <select
                    name="ComponentType"
                    value={newUnit.ComponentType}
                    onChange={handleInputChange}
                  >
                    <option value="WholeBlood">
                      {t("bloodStorage.wholeBlood")}
                    </option>
                    <option value="Plasma">{t("bloodStorage.plasma")}</option>
                    <option value="Platelets">
                      {t("bloodStorage.platelets")}
                    </option>
                    <option value="RedCells">
                      {t("bloodStorage.redCells")}
                    </option>
                  </select>
                </div>

                <div className="filter-form-group">
                  <label>{t("bloodStorage.units")}:</label>
                  <input
                    type="number"
                    name="Quantity"
                    min="1"
                    value={newUnit.Quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="filter-form-group">
                  <label>{t("bloodStorage.volume")} (ml):</label>
                  <input
                    type="number"
                    name="Volume"
                    min="1"
                    value={newUnit.Volume}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="filter-form-group">
                  <label>{t("bloodStorage.note")}:</label>
                  <input
                    type="text"
                    name="note"
                    value={newUnit.note}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={adding}>
                  {adding
                    ? t("bloodStorage.processing")
                    : t("bloodStorage.addToInventory")}
                </button>
              </form>
            </div>
          )}

          <h2>{t("bloodStorage.inventoryHistory")}</h2>
          <div className="filter-row">
            <label>
              {t("bloodStorage.fromDate")}:
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
            <label>
              {t("bloodStorage.toDate")}:
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
            <label>
              {t("bloodStorage.sourceType")}:
              <select
                value={filterSourceType}
                onChange={(e) => setFilterSourceType(e.target.value)}
              >
                <option value="all">{t("bloodStorage.all")}</option>
                <option value="donation">{t("bloodStorage.donation")}</option>
                <option value="import">{t("bloodStorage.import")}</option>
              </select>
            </label>
          </div>

          <div className="blood-inventory-table-wrapper">
            <table className="blood-inventory-table">
              <thead>
                <tr>
                  <th>{t("bloodStorage.dateAdded")}</th>
                  <th>{t("bloodStorage.bloodType")}</th>
                  <th>{t("bloodStorage.component")}</th>
                  <th>{t("bloodStorage.units")}</th>
                  <th>{t("bloodStorage.volume")} (ml)</th>
                  <th>{t("bloodStorage.sourceType")}</th>
                  <th>{t("bloodStorage.note")} / Nguoi hien</th>
                  <th>{t("bloodStorage.expirationDate")}</th>
                  <th>{t("bloodStorage.daysLeft")}</th>
                  <th>{t("bloodStorage.delete")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBloodInventory.length > 0 ? (
                  currentItems.map((unit) => {
                    const days = getDaysUntilExpiration(unit.DateExpired);
                    const isExpired = days <= 0;
                    return (
                      <tr
                        key={unit._id}
                        className={isExpired ? "expired-row" : ""}
                      >
                        <td>{formatDate(unit.DateAdded)}</td>
                        <td>{unit.BloodType}</td>
                        <td>{getComponentTranslation(unit.ComponentType)}</td>
                        <td>{unit.Quantity}</td>
                        <td>{unit.Volume}</td>
                        <td>{getSourceTypeTranslation(unit.SourceType)}</td>
                        <td>
                          {unit.donorName ? (
                            <span style={{ color: "#c0392b", fontWeight: 500 }}>
                              {unit.donorName}
                            </span>
                          ) : (
                            <span>{unit.note || ""}</span>
                          )}
                        </td>
                        <td>{formatDate(unit.DateExpired)}</td>
                        <td
                          style={{
                            color: isExpired ? "#b80000" : undefined,
                            fontWeight: isExpired ? "bold" : undefined,
                            minWidth: "100px",
                          }}
                        >
                          {isExpired ? t("bloodStorage.expired") : days}
                          <div style={{ fontSize: "12px", marginTop: 2 }}>
                            {isExpired ? (
                              <span style={{ color: "#b80000" }}>
                                {t("bloodStorage.expired")}
                              </span>
                            ) : unit.assignedToRequestId ? (
                              <>
                                <span
                                  style={{ color: "#1976d2", fontWeight: 500 }}
                                >
                                  Đã cấp phát
                                </span>
                                <br />
                                <span style={{ color: "#2c3e50" }}>
                                  {unit.assignedToRequestId.assignedTo?.name ||
                                    unit.assignedToRequestId.createdBy?.name ||
                                    "Không rõ người nhận"}
                                </span>
                              </>
                            ) : (
                              <span style={{ color: "#43a047" }}>
                                Còn trong kho
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {!unit.assignedToRequestId && (
                            <button
                              className="delete-button"
                              title={t("bloodStorage.deleteTitle")}
                              onClick={() => openDeleteModal(unit._id)}
                            >
                              {t("bloodStorage.delete")}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10">{t("bloodStorage.noRecords")}</td>
                  </tr>
                )}
                {/* Tổng kết cuối bảng */}
                <tr style={{ fontWeight: "bold", background: "#ffeaea" }}>
                  <td colSpan="3">{t("bloodStorage.total")}</td>
                  <td>{totalQuantity}</td>
                  <td>{totalVolume}</td>
                  <td colSpan="5"></td>
                </tr>
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredBloodInventory.length > 0 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  {t("bloodStorage.showing")} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} {t("bloodStorage.of")} {totalItems} {t("bloodStorage.entries")}
                </div>
                <div className="pagination-buttons">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    &laquo; {t("bloodStorage.prev")}
                  </button>

                  {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    [...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))
                  ) : (
                    // Show limited pages with ellipsis for many pages
                    <>
                      {currentPage > 2 && (
                        <button
                          onClick={() => paginate(1)}
                          className="pagination-button"
                        >
                          1
                        </button>
                      )}

                      {currentPage > 3 && <span className="pagination-ellipsis">...</span>}

                      {currentPage > 1 && (
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          className="pagination-button"
                        >
                          {currentPage - 1}
                        </button>
                      )}

                      <button
                        className="pagination-button active"
                      >
                        {currentPage}
                      </button>

                      {currentPage < totalPages && (
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          className="pagination-button"
                        >
                          {currentPage + 1}
                        </button>
                      )}

                      {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}

                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => paginate(totalPages)}
                          className="pagination-button"
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    {t("bloodStorage.next")} &raquo;
                  </button>
                </div>

                <div className="items-per-page">
                  <label>
                    {t("bloodStorage.rowsPerPage")}:
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          <EnglishBloodDeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteBloodUnit}
          />
        </>
      )}
    </div>
  );
};

export default BloodStorage;
