import React from 'react';
import { useTranslation } from 'react-i18next';
import './BloodStorage.css';

function BloodStorage() {
    const { t } = useTranslation();

    return (
        <div className="blood-storage-container">
            <h1>Blood Storage Management</h1>
            <p>This page is restricted to staff and admin users only.</p>

            {/* Placeholder for blood storage management features */}
            <div className="blood-storage-dashboard">
                <div className="blood-storage-card">
                    <h3>A+ Blood</h3>
                    <div className="blood-level high">75%</div>
                    <p>Status: Sufficient</p>
                </div>
                <div className="blood-storage-card">
                    <h3>O- Blood</h3>
                    <div className="blood-level low">15%</div>
                    <p>Status: Critical</p>
                </div>
                <div className="blood-storage-card">
                    <h3>B+ Blood</h3>
                    <div className="blood-level medium">45%</div>
                    <p>Status: Low</p>
                </div>
                <div className="blood-storage-card">
                    <h3>AB+ Blood</h3>
                    <div className="blood-level high">80%</div>
                    <p>Status: Sufficient</p>
                </div>
                {/* Add more blood type cards as needed */}
            </div>

            <div className="management-controls">
                <button className="update-inventory-btn">Update Inventory</button>
                <button className="generate-report-btn">Generate Report</button>
            </div>
        </div>
    );
}

export default BloodStorage;
