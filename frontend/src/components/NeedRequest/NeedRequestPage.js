import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import NeedRequestForm from './NeedRequestForm';
import NeedRequestList from './NeedRequestList';
import SearchBlood from './SearchBlood';
import './NeedRequest.css';

const NeedRequestPage = ({ user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('form');
  const [refreshList, setRefreshList] = useState(false);

  // Determine if the user is a staff member or admin
  const isStaff = user?.role === 'Staff' || user?.role === 'Admin';

  // Check for refresh parameter in URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('refresh')) {
      setRefreshList(true);
    }
  }, [location.search]);

  // Set default active tab to list for staff users
  useEffect(() => {
    if (isStaff) {
      setActiveTab('list');
    }
  }, [isStaff]);

  // Handle successful request creation to refresh the list
  const handleRequestCreated = () => {
    setActiveTab('list');
    setRefreshList(true);
  };

  // Reset the refresh flag after the list has been refreshed
  useEffect(() => {
    if (refreshList) {
      setRefreshList(false);
    }
  }, [refreshList]);

  return (
    <div className="need-request-container">
      <div className="need-request-page-header">
        <div className="blood-icon">
          <div className="blood-drop"></div>
        </div>
        <h1>{t('needRequest.title')}</h1>
        <p>{t('needRequest.description')}</p>
      </div>

      <div className="need-request-tabs">
        {!isStaff && (
          <>
            <button
              className={`need-request-tab ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              {t('needRequest.nav.createRequest')}
            </button>
            <button
              className={`need-request-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              {t('needRequest.nav.searchBlood')}
            </button>
          </>
        )}
        <button
          className={`need-request-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          {isStaff ? t('needRequest.nav.viewAllRequests') : t('needRequest.nav.viewMyRequests')}
        </button>
      </div>

      {activeTab === 'form' && !isStaff && (
        <NeedRequestForm onRequestCreated={handleRequestCreated} />
      )}

      {activeTab === 'search' && !isStaff && (
        <SearchBlood />
      )}

      {activeTab === 'list' && (
        <NeedRequestList
          userRole={user?.role || 'Member'}
          refresh={refreshList}
        />
      )}
    </div>
  );
};

export default NeedRequestPage;
