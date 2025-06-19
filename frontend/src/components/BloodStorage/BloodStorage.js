import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config';
import './BloodStorage.css';

function BloodStorage() {
    const { t } = useTranslation();
    const [bloodInventory, setBloodInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBloodUnit, setNewBloodUnit] = useState({
        BloodType: 'A+',
        ComponentType: 'WholeBlood',
        Volume: 450, // Default volume in mL
        DateAdded: new Date().toISOString().split('T')[0]
    });
    const [summaryData, setSummaryData] = useState({});

    // Blood types and component types for form selection
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const componentTypes = [
        { value: "WholeBlood", label: t("bloodStorage.componentType.wholeBlood") },
        { value: "Plasma", label: t("bloodStorage.componentType.plasma") },
        { value: "Platelets", label: t("bloodStorage.componentType.platelets") },
        { value: "RedCells", label: t("bloodStorage.componentType.redCells") }
    ];

    // Fetch blood inventory from the backend
    const fetchBloodInventory = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(t("common.notAuthenticated"));
            }

            const response = await fetch(`${API_BASE_URL}/bloodunit`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(t("bloodStorage.fetchError"));
            }

            const data = await response.json();
            setBloodInventory(data);

            // Generate summary data
            const summary = processBloodInventory(data);
            setSummaryData(summary);
        } catch (err) {
            console.error("Error fetching blood inventory:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Process blood inventory to create summary data
    const processBloodInventory = (data) => {
        // Initialize summary object with all blood types
        const summary = {};
        bloodTypes.forEach(type => {
            summary[type] = {
                WholeBlood: 0,
                Plasma: 0,
                Platelets: 0,
                RedCells: 0,
                total: 0,
                status: 'critical' // Default status
            };
        });

        // Count units by blood type and component
        data.forEach(unit => {
            if (summary[unit.BloodType]) {
                summary[unit.BloodType][unit.ComponentType] += 1;
                summary[unit.BloodType].total += 1;
            }
        });

        // Determine status based on total units
        Object.keys(summary).forEach(type => {
            const total = summary[type].total;
            if (total > 20) {
                summary[type].status = 'sufficient';
            } else if (total > 10) {
                summary[type].status = 'medium';
            } else {
                summary[type].status = 'critical';
            }
        });

        return summary;
    };

    // Add a new blood unit
    const handleAddBloodUnit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(t("common.notAuthenticated"));
            }

            const response = await fetch(`${API_BASE_URL}/bloodunit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newBloodUnit)
            });

            if (!response.ok) {
                throw new Error(t("bloodStorage.addError"));
            }

            // Refresh the inventory
            fetchBloodInventory();
            setShowAddForm(false);
            setNewBloodUnit({
                BloodType: 'A+',
                ComponentType: 'WholeBlood',
                Volume: 450,
                DateAdded: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Error adding blood unit:", err);
            setError(err.message);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBloodUnit({
            ...newBloodUnit,
            [name]: value
        });
    };

    // Delete a blood unit
    const handleDeleteBloodUnit = async (id) => {
        if (!window.confirm(t("bloodStorage.confirmDelete"))) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(t("common.notAuthenticated"));
            }

            const response = await fetch(`${API_BASE_URL}/bloodunit/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(t("bloodStorage.deleteError"));
            }

            // Refresh the inventory
            fetchBloodInventory();
        } catch (err) {
            console.error("Error deleting blood unit:", err);
            setError(err.message);
        }
    };

    // Load blood inventory on component mount
    useEffect(() => {
        fetchBloodInventory();
    }, [fetchBloodInventory]);

    // Helper function to determine status class
    const getStatusClass = (status) => {
        switch (status) {
            case 'sufficient': return 'high';
            case 'medium': return 'medium';
            case 'critical': return 'low';
            default: return 'low';
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get days until expiration
    const getDaysUntilExpiration = (expirationDate) => {
        const now = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="blood-storage-container">
            <h1>{t("bloodStorage.title", "Blood Storage Management")}</h1>
            <p>{t("bloodStorage.staffOnly", "This page is restricted to staff and admin users only.")}</p>

            {/* Error message */}
            {error && <div className="error-message">{error}</div>}

            {/* Summary Cards */}
            <h2>{t("bloodStorage.summary", "Blood Inventory Summary")}</h2>
            <div className="blood-storage-dashboard">
                {bloodTypes.map(type => (
                    <div key={type} className="blood-storage-card">
                        <h3>{type} {t("bloodStorage.blood", "Blood")}</h3>
                        <div className={`blood-level ${getStatusClass(summaryData[type]?.status || 'critical')}`}>
                            {summaryData[type]?.total || 0} {t("bloodStorage.units", "Units")}
                        </div>
                        <p>
                            {t("bloodStorage.status", "Status")}:
                            {summaryData[type]?.status === 'sufficient'
                                ? t("bloodStorage.sufficient", " Sufficient")
                                : summaryData[type]?.status === 'medium'
                                    ? t("bloodStorage.low", " Low")
                                    : t("bloodStorage.critical", " Critical")}
                        </p>
                        <div className="component-breakdown">
                            <p>{t("bloodStorage.componentType.wholeBlood")}: {summaryData[type]?.WholeBlood || 0}</p>
                            <p>{t("bloodStorage.componentType.plasma")}: {summaryData[type]?.Plasma || 0}</p>
                            <p>{t("bloodStorage.componentType.platelets")}: {summaryData[type]?.Platelets || 0}</p>
                            <p>{t("bloodStorage.componentType.redCells")}: {summaryData[type]?.RedCells || 0}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Management Controls */}
            <div className="management-controls">
                <button
                    className="add-inventory-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm
                        ? t("bloodStorage.cancelAdd", "Cancel")
                        : t("bloodStorage.addUnit", "Add Blood Unit")}
                </button>
                <button
                    className="refresh-btn"
                    onClick={fetchBloodInventory}
                >
                    {t("bloodStorage.refresh", "Refresh Data")}
                </button>
            </div>

            {/* Add Blood Unit Form */}
            {showAddForm && (
                <div className="add-blood-form">
                    <h3>{t("bloodStorage.addNewUnit", "Add New Blood Unit")}</h3>
                    <form onSubmit={handleAddBloodUnit}>
                        <div className="form-group">
                            <label>{t("bloodStorage.bloodType", "Blood Type")}:</label>
                            <select
                                name="BloodType"
                                value={newBloodUnit.BloodType}
                                onChange={handleInputChange}
                                required
                            >
                                {bloodTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t("bloodStorage.component", "Component")}:</label>
                            <select
                                name="ComponentType"
                                value={newBloodUnit.ComponentType}
                                onChange={handleInputChange}
                                required
                            >
                                {componentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{t("bloodStorage.volume", "Volume (mL)")}:</label>
                            <input
                                type="number"
                                name="Volume"
                                value={newBloodUnit.Volume}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t("bloodStorage.dateAdded", "Date Added")}:</label>
                            <input
                                type="date"
                                name="DateAdded"
                                value={newBloodUnit.DateAdded}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn">
                            {t("bloodStorage.addUnit", "Add Unit")}
                        </button>
                    </form>
                </div>
            )}

            {/* Detailed Inventory Table */}
            <h2>{t("bloodStorage.detailedInventory", "Detailed Inventory")}</h2>
            {loading ? (
                <p>{t("common.loading", "Loading...")}</p>
            ) : (
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>{t("bloodStorage.bloodType", "Blood Type")}</th>
                                <th>{t("bloodStorage.component", "Component")}</th>
                                <th>{t("bloodStorage.volume", "Volume (mL)")}</th>
                                <th>{t("bloodStorage.dateAdded", "Date Added")}</th>
                                <th>{t("bloodStorage.expirationDate", "Expiration Date")}</th>
                                <th>{t("bloodStorage.daysUntilExpired", "Days Until Expired")}</th>
                                <th>{t("common.actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bloodInventory.length > 0 ? (
                                bloodInventory.map(unit => (
                                    <tr key={unit._id} className={getDaysUntilExpiration(unit.DateExpired) <= 0 ? 'expired' : ''}>
                                        <td>{unit.BloodType}</td>
                                        <td>
                                            {unit.ComponentType === "WholeBlood" && t("bloodStorage.componentType.wholeBlood")}
                                            {unit.ComponentType === "Plasma" && t("bloodStorage.componentType.plasma")}
                                            {unit.ComponentType === "Platelets" && t("bloodStorage.componentType.platelets")}
                                            {unit.ComponentType === "RedCells" && t("bloodStorage.componentType.redCells")}
                                        </td>
                                        <td>{unit.Volume}</td>
                                        <td>{formatDate(unit.DateAdded)}</td>
                                        <td>{formatDate(unit.DateExpired)}</td>
                                        <td>
                                            {getDaysUntilExpiration(unit.DateExpired) <= 0
                                                ? t("bloodStorage.expired", "Expired")
                                                : getDaysUntilExpiration(unit.DateExpired)}
                                        </td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteBloodUnit(unit._id)}
                                            >
                                                {t("common.delete", "Delete")}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">{t("bloodStorage.noUnits", "No blood units available")}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BloodStorage;
