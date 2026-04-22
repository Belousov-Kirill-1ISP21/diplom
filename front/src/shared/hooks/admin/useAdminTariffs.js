import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { tariffValidationSchema } from '../../../shared/lib/validations/panelsValidations';

export const useAdminTariffs = () => {
    const [tariffs, setTariffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    const loadTariffs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/tariffs');
            setTariffs(response.data.data || []);
        } catch (error) {
            setError('Ошибка загрузки тарифов: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTariffs();
    }, [loadTariffs]);

    const deleteTariff = async (id) => {
        if (window.confirm('Удалить тариф?')) {
            try {
                await api.delete(`/admin/tariffs/${id}`);
                await loadTariffs();
            } catch (error) {
                setError('Ошибка удаления тарифа');
            }
        }
    };

    const saveTariff = async (e) => {
        e.preventDefault();
        
        try {
            await tariffValidationSchema.validate(formData, { abortEarly: false });
        } catch (err) {
            const errors = {};
            err.inner.forEach(error => {
                errors[error.path] = error.message;
            });
            setValidationErrors(errors);
            return;
        }
        
        try {
            if (selectedItem) {
                await api.put(`/admin/tariffs/${selectedItem.id}`, formData);
            } else {
                await api.post('/admin/tariffs', formData);
            }
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            setValidationErrors({});
            await loadTariffs();
        } catch (error) {
            setError('Ошибка сохранения тарифа');
        }
    };

    const openModal = (tariff = null) => {
        setSelectedItem(tariff);
        setFormData(tariff || {});
        setValidationErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setFormData({});
        setValidationErrors({});
    };

    return {
        tariffs,
        loading,
        error,
        showModal,
        selectedItem,
        formData,
        validationErrors,
        setFormData,
        deleteTariff,
        saveTariff,
        openModal,
        closeModal
    };
};