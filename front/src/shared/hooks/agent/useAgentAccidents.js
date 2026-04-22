import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export const useAgentAccidents = () => {
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString.split('T')[0];
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'На рассмотрении',
            'approved': 'Одобрено',
            'paid': 'Выплачено',
            'rejected': 'Отклонено'
        };
        return statusMap[status] || status;
    };

    const loadAccidents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/accidents');
            setAccidents(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки страховых случаев');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccidents();
    }, [loadAccidents]);

    const updateAccidentStatus = async (id, status) => {
        try {
            await api.put(`/agent/accidents/${id}`, { status });
            await loadAccidents();
        } catch (error) {
            setError('Ошибка обновления статуса');
        }
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
        formatDate,
        getStatusText,
        loadAccidents,
        updateAccidentStatus,
        openModal,
        closeModal
    };
};