import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NeedRequestForm from './NeedRequestForm';
import NeedRequestList from './NeedRequestList';
import './NeedRequest.css';

const NeedRequestPage = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('form');
  const [refreshList, setRefreshList] = useState(false);

  // Determine if the user is a staff member or admin
  const isStaff = user?.role === 'Staff' || user?.role === 'Admin';
  
  // Handle successful request creation to refresh the list
  const handleRequestCreated = () => {
    if (isStaff) {
      setActiveTab('list');
      setRefreshList(true);
    }
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
        <button 
          className={`need-request-tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          {t('needRequest.nav.createRequest')}
        </button>        <button 
          className={`need-request-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          {isStaff ? t('needRequest.nav.viewAllRequests') : t('needRequest.nav.viewMyRequests')}
        </button>
      </div>
      
      {activeTab === 'form' && (
        <NeedRequestForm onRequestCreated={handleRequestCreated} />
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
