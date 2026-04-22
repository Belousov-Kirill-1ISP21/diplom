import { useState, useEffect } from 'react';
import api from '../../api/client';

export const useAccidentForm = (isAuthenticated) => {
    const [step, setStep] = useState(1);
    const [myVehicles, setMyVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        accident_date: '',
        damage_amount: '',
        description: ''
    });

    const loadMyVehicles = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/client/vehicles');
            setMyVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    };

    const loadPoliciesForVehicle = async (vehicleId) => {
        try {
            const response = await api.get('/client/policies');
            const activePolicies = response.data.filter(
                policy => policy.vehicle_id === vehicleId && policy.status === 'active'
            );
            setPolicies(activePolicies);
            setSelectedPolicy(null);
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadMyVehicles();
        }
    }, [isAuthenticated]);

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        loadPoliciesForVehicle(vehicle.id);
        setStep(2);
        setError(null);
        setValidationErrors({});
    };

    const handleSelectPolicy = (policy) => {
        setSelectedPolicy(policy);
        setStep(3);
        setError(null);
        setValidationErrors({});
        setFormData({
            accident_date: '',
            damage_amount: '',
            description: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.accident_date) {
            errors.accident_date = 'Укажите дату происшествия';
        } else {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            
            if (formData.accident_date > todayStr) {
                errors.accident_date = 'Дата происшествия не может быть в будущем';
            }
            
            const policyStartDate = selectedPolicy.start_date.split('T')[0];
            if (formData.accident_date < policyStartDate) {
                const formattedDate = new Date(selectedPolicy.start_date).toLocaleDateString('ru-RU');
                errors.accident_date = `Дата происшествия не может быть раньше ${formattedDate}`;
            }
        }
        
        if (formData.damage_amount) {
            const amount = parseFloat(formData.damage_amount);
            if (isNaN(amount) || amount < 0) {
                errors.damage_amount = 'Укажите корректную сумму ущерба';
            } else if (amount === 0) {
                errors.damage_amount = 'Сумма ущерба не может быть равна 0';
            }
        }
        
        if (formData.description && formData.description.length < 10) {
            errors.description = 'Описание должно содержать минимум 10 символов';
        }
        if (formData.description && formData.description.length > 1000) {
            errors.description = 'Описание не должно превышать 1000 символов';
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post(`/client/accidents/${selectedPolicy.id}`, {
                accident_date: formData.accident_date,
                damage_amount: formData.damage_amount ? parseFloat(formData.damage_amount) : null,
                description: formData.description || null,
                is_client_fault: false 
            });

            setSuccess('Страховой случай успешно зарегистрирован!');
            
            setTimeout(() => {
                setStep(1);
                setSelectedVehicle(null);
                setSelectedPolicy(null);
                setSuccess(null);
                setValidationErrors({});
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при регистрации страхового случая');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedVehicle(null);
            setPolicies([]);
            setSelectedPolicy(null);
        } else if (step === 3) {
            setStep(2);
            setSelectedPolicy(null);
        }
        setError(null);
        setValidationErrors({});
    };

    return {
        step,
        myVehicles,
        selectedVehicle,
        policies,
        selectedPolicy,
        isSubmitting,
        error,
        success,
        validationErrors,
        formData,
        handleSelectVehicle,
        handleSelectPolicy,
        handleInputChange,
        handleSubmit,
        handleBack,
        setError
    };
};