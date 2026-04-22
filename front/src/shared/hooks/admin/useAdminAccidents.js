import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export const useAdminAccidents = () => {
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString.split('T')[0];
    };

    const loadAccidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/accidents');
            setAccidents(response.data.data || []);
        } catch (error) {
            setError('Ошибка загрузки страховых случаев: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccidents();
    }, [loadAccidents]);

    const updateAccidentFault = async (id, isClientFault) => {
        try {
            await api.put(`/admin/accidents/${id}`, { is_client_fault: isClientFault });
            await loadAccidents();
        } catch (error) {
            setError('Ошибка обновления вины клиента');
        }
    };

    const updateAccidentStatus = async (id, status) => {
        try {
            await api.put(`/admin/accidents/${id}`, { status });
            await loadAccidents();
        } catch (error) {
            setError('Ошибка обновления статуса');
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'На рассмотрении',
            'approved': 'Одобрено',
            'rejected': 'Отклонено',
            'paid': 'Выплачено'
        };
        return statusMap[status] || status;
    };

    const openModal = (accident) => {
        setSelectedItem(accident);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    return {
        accidents,
        loading,
        error,
        selectedItem,
        showModal,
        updateAccidentFault,
        updateAccidentStatus,
        getStatusText,
        formatDate,
        openModal,
        closeModal
    };
};