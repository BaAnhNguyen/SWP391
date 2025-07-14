import React from 'react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel"
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p className="delete-confirm-message">{message}</p>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onClose}
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        type="button"
                        className="confirm-delete-button"
                        onClick={onConfirm}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
