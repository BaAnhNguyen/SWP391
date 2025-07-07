import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const SearchBlood = () => {
    const { t } = useTranslation();
    const [bloodType, setBloodType] = useState('');
    const [showResults, setShowResults] = useState(false);

    const bloodComponents = [
        t('common.component.wholeblood'),
        t('common.component.redcells'),
        t('common.component.platelets'),
        t('common.component.plasma')
    ];

    const handleSearch = () => {
        if (bloodType) {
            setShowResults(true);
        }
    };

    return (
        <div className="search-blood-wrapper">
            <h2>{t('bloodComponents.searchTitle')}</h2>
            <div className="search-form">
                <label>{t('bloodComponents.yourBloodType')}</label>
                <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                    <option value="">{t('bloodComponents.selectBloodType')}</option>
                    {Object.keys(compatibilityChart).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <button onClick={handleSearch}>{t('bloodComponents.searchButton')}</button>
            </div>

            {showResults && (
                <div className="results-section">
                    <h3>{t('bloodComponents.resultsTitle')} {bloodType}:</h3>
                    <div className="compatible-list">
                        {compatibilityChart[bloodType].map(type => (
                            <span className="blood-badge" key={type}>
                                {type}
                                {type === 'O-' && <span className="note"> ({t('bloodComponents.universalDonor')})</span>}
                                {bloodType === 'AB+' && type === 'AB+' && <span className="note"> ({t('bloodComponents.universalRecipient')})</span>}
                            </span>
                        ))}
                    </div>

                    <h4>{t('bloodComponents.componentInfo')}:</h4>
                    <ul>
                        {bloodComponents.map(component => (
                            <li key={component}>
                                <strong>{component}</strong> - {t('bloodComponents.compatible')}
                            </li>
                        ))}
                    </ul>

                    <div className="note-box">
                        <strong>{t('bloodComponents.transfusionGuidelines')}:</strong> {t('bloodComponents.universalNotes')}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBlood;
