import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { payPolicy } from '../../api/policies';

export const usePaymentForm = (policy) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e, field) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
        if (name === 'expiryDate') value = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
        if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 3);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        setTimeout(async () => {
            try {
                if (formData.cardNumber.replace(/\s/g, '').length !== 16) throw new Error('Неверный номер карты');
                if (formData.cvv.length !== 3) throw new Error('Неверный CVV код');
                await payPolicy(policy.id);
                setSuccess(true);
                setTimeout(() => navigate('/profile?tab=policies'), 2000);
            } catch (error) {
                setError(error.response?.data?.message || 'Ошибка при оплате');
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    const formatPrice = (price) => price?.toLocaleString() || '0';

    const handleCancel = () => {
        navigate('/profile');
    };

    return {
        loading,
        error,
        success,
        formData,
        handleInputChange,
        handleSubmit,
        handleCancel,
        formatPrice
    };
};