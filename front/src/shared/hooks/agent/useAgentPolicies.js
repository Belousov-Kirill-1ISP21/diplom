import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { policyDiscountSchema, policyRenewSchema } from '../../../shared/lib/validations/panelsValidations';

export const useAgentPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString.split('T')[0];
    };

    const getStatusText = (status) => {
        const statusMap = {
            'draft': 'Черновик', 'active': 'Активен', 'expired': 'Просрочен', 'cancelled': 'Отменён'
        };
        return statusMap[status] || status;
    };

    const loadPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/policies');
            setPolicies(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки полисов');
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
                await api.post(`/agent/policies/${id}/cancel`);
                await loadPolicies();
            } catch (error) {
                setError('Ошибка отмены полиса');
            }
        }
    };

    const activatePolicy = async (id) => {
        try {
            await api.post(`/agent/policies/${id}/activate`);
            await loadPolicies();
        } catch (error) {
            setError('Ошибка активации полиса');
        }
    };

    const renewPolicy = async (id) => {
        const days = prompt('На сколько дней продлить полис? (1-365)', '365');
        if (days) {
            try {
                await policyRenewSchema.validate({ days: parseInt(days) }, { abortEarly: false });
                await api.post(`/agent/policies/${id}/renew`, { days: parseInt(days) });
                await loadPolicies();
            } catch (err) {
                if (err.name === 'ValidationError') {
                    setError(err.errors[0]);
                } else {
                    setError('Ошибка продления полиса');
                }
            }
        }
    };

    const updatePolicyDiscount = async (id, discount) => {
        try {
            await policyDiscountSchema.validate({ discount_amount: discount }, { abortEarly: false });
            await api.put(`/agent/policies/${id}`, { discount_amount: discount });
            await loadPolicies();
        } catch (err) {
            if (err.name === 'ValidationError') {
                setError(err.errors[0]);
            } else {
                setError('Ошибка обновления скидки');
            }
        }
    };

    const filteredPolicies = policies.filter(policy => !statusFilter || policy.status === statusFilter);

    return {
        policies,
        loading,
        error,
        statusFilter,
        setStatusFilter,
        formatDate,
        getStatusText,
        loadPolicies,
        cancelPolicy,
        activatePolicy,
        renewPolicy,
        updatePolicyDiscount,
        filteredPolicies
    };
};