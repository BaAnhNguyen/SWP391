import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddressForm from '../AddressForm/AddressForm';
import './AddressFormPage.css';

function AddressFormPage() {
    const { t } = useTranslation();
    const [address, setAddress] = useState({
        street: '',
        district: '',
        city: ''
    });
    const [submittedAddress, setSubmittedAddress] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmittedAddress({ ...address });
        alert(t('addressForm.submitted'));
    };

    const handleAddressChange = (updatedAddress) => {
        setAddress(updatedAddress);
    };

    return (
        <div className="address-form-page">
            <h1>{t('addressForm.title')}</h1>

            <form onSubmit={handleSubmit}>
                <AddressForm
                    initialAddress={address}
                    onChange={handleAddressChange}
                />

                <button type="submit" className="submit-button">
                    {t('addressForm.submit')}
                </button>
            </form>

            {submittedAddress && (
                <div className="submitted-address">
                    <h3>{t('addressForm.submittedAddress')}</h3>
                    <p>
                        <strong>{t('profile.street')}:</strong> {submittedAddress.street}
                    </p>
                    <p>
                        <strong>{t('profile.district')}:</strong> {submittedAddress.district}
                    </p>
                    <p>
                        <strong>{t('profile.city')}:</strong> {submittedAddress.city}
                    </p>
                </div>
            )}
        </div>
    );
}

export default AddressFormPage;
