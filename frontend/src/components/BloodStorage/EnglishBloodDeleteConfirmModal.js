import React from 'react';
import '../common/DeleteConfirmModal-enhanced.css';

const EnglishBloodDeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Delete Blood Unit</h3>
                <p className="delete-confirm-message">
                    Are you sure you want to delete this blood unit?
                </p>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="confirm-delete-button"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnglishBloodDeleteConfirmModal;
