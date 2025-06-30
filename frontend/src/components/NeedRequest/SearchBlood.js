import React, { useState } from 'react';
import './SearchBlood.css';

const compatibilityChart = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
};

const bloodComponents = ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma'];

const SearchBlood = () => {
    const [bloodType, setBloodType] = useState('');
    const [showResults, setShowResults] = useState(false);

    const handleSearch = () => {
        if (bloodType) {
            setShowResults(true);
        }
    };

    return (
        <div className="search-blood-wrapper">
            <h2>Tìm nhóm máu tương thích</h2>
            <div className="search-form">
                <label>Chọn nhóm máu của bạn:</label>
                <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                    <option value="">-- Chọn nhóm máu --</option>
                    {Object.keys(compatibilityChart).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <button onClick={handleSearch}>Tìm kiếm</button>
            </div>

            {showResults && (
                <div className="results-section">
                    <h3>Nhóm máu {bloodType} có thể nhận từ:</h3>
                    <div className="compatible-list">
                        {compatibilityChart[bloodType].map(type => (
                            <span className="blood-badge" key={type}>
                                {type}
                                {type === 'O-' && <span className="note"> (Người cho phổ quát)</span>}
                                {bloodType === 'AB+' && type === 'AB+' && <span className="note"> (Người nhận phổ quát)</span>}
                            </span>
                        ))}
                    </div>

                    <h4>Thành phần máu tương thích:</h4>
                    <ul>
                        {bloodComponents.map(component => (
                            <li key={component}>
                                <strong>{component}</strong> - có thể được truyền nếu phù hợp với điều kiện y tế.
                            </li>
                        ))}
                    </ul>

                    <div className="note-box">
                        <strong>Lưu ý:</strong> Đây là bảng minh họa dựa trên nguyên tắc truyền máu cơ bản. Luôn tham khảo bác sĩ hoặc nhân viên y tế để đảm bảo an toàn truyền máu.
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBlood;
