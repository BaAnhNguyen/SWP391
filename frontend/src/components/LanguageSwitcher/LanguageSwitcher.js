import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="language-switcher">
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">{t('language.english')}</option>
        <option value="vi">{t('language.vietnamese')}</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;