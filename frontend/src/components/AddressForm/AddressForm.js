import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AddressForm.css';

function AddressForm({ initialAddress, onChange, standalone = false }) {
    const { t } = useTranslation();
    const [address, setAddress] = useState({
        street: initialAddress?.street || '',
        district: initialAddress?.district || '',
        city: initialAddress?.city || '',
    });

    useEffect(() => {
        if (initialAddress) {
            setAddress({
                street: initialAddress.street || '',
                district: initialAddress.district || '',
                city: initialAddress.city || '',
            });
        }
    }, [initialAddress]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        const field = name.replace('address.', '');

        const updatedAddress = {
            ...address,
            [field]: value
        };

        setAddress(updatedAddress);

        // Notify parent component about the change
        if (onChange) {
            onChange(updatedAddress);
        }
    };

    return (
        <div className={`address-form ${standalone ? 'standalone' : ''}`}>
            {standalone && (
                <h2 className="address-form-title">{t('profile.addressDetails')}</h2>
            )}

            <div className="address-fields">
                <div className="form-group">
                    <label htmlFor="street">{t('profile.street')}</label>
                    <input
                        type="text"
                        id="street"
                        name="address.street"
                        value={address.street}
                        onChange={handleAddressChange}
                        placeholder={t('profile.streetPlaceholder')}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="district">{t('profile.district')}</label>
                    <input
                        type="text"
                        id="district"
                        name="address.district"
                        value={address.district}
                        onChange={handleAddressChange}
                        placeholder={t('profile.districtPlaceholder')}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="city">{t('profile.city')}</label>
                    <input
                        type="text"
                        id="city"
                        name="address.city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder={t('profile.cityPlaceholder')}
                    />
                    <div className="input-hint">
                        <p>{t('profile.city.hint')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddressForm;
