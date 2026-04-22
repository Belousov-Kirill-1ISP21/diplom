import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export const useAdminPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const loadPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/policies');
            setPolicies(response.data.data || []);
        } catch (error) {
            setError('Ошибка загрузки полисов: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPolicies();
    }, [loadPolicies]);

    const cancelPolicy = async (id) => {
        if (window.confirm('Отменить полис?')) {
            try {
                await api.post(`/admin/policies/${id}/cancel`);
                await loadPolicies();
            } catch (error) {
                setError('Ошибка отмены полиса');
            }
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'draft': 'Черновик',
            'active': 'Активен',
            'expired': 'Просрочен',
            'cancelled': 'Отменён'
        };
        return statusMap[status] || status;
    };

    const filteredPolicies = policies.filter(policy => !statusFilter || policy.status === statusFilter);

    return {
        policies,
        loading,
        error,
        statusFilter,
        setStatusFilter,
        loadPolicies,
        cancelPolicy,
        getStatusText,
        filteredPolicies
    };
};