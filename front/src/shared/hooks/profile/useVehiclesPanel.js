import { useState, useEffect, useCallback } from 'react';
import { getMyVehicles, createVehicle, deleteVehicle } from '../../../api/vehicles';
import { normalizeLicensePlate, validateLicensePlate } from '../../../shared/lib/validations/calculatorValidations';

export const useVehiclesPanel = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [globalError, setGlobalError] = useState(null);
    const [formData, setFormData] = useState({
        state_number: '',
        brand: '',
        model: '',
        manufacture_year: '',
        power_hp: '',
        category: 'B',
        vin: '',
        purchase_price: '',
        has_tracker: false,
        parking_type: 'garage'
    });

    const formatValidationErrors = useCallback((errors) => {
        if (typeof errors === 'object' && errors !== null) {
            const messages = [];
            const fieldNames = {
                state_number: 'Госномер',
                brand: 'Марка',
                model: 'Модель',
                manufacture_year: 'Год выпуска',
                power_hp: 'Мощность',
                category: 'Категория',
                vin: 'VIN',
                purchase_price: 'Стоимость',
                has_tracker: 'Сигнализация',
                parking_type: 'Способ парковки'
            };
            for (const [field, fieldErrors] of Object.entries(errors)) {
                const fieldName = fieldNames[field] || field;
                messages.push(`${fieldName}: ${fieldErrors.join(', ')}`);
            }
            return messages.join('; ');
        }
        return null;
    }, []);

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMyVehicles();
            setVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setGlobalError('Ошибка при загрузке автомобилей');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (modalError) setModalError(null);
    }, [modalError]);

    const resetForm = useCallback(() => {
        setFormData({
            state_number: '',
            brand: '',
            model: '',
            manufacture_year: '',
            power_hp: '',
            category: 'B',
            vin: '',
            purchase_price: '',
            has_tracker: false,
            parking_type: 'garage'
        });
        setModalError(null);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setModalError(null);
        
        const plateError = validateLicensePlate(formData.state_number);
        if (plateError) {
            setModalError(plateError);
            return;
        }
    
        const normalizedPlate = normalizeLicensePlate(formData.state_number);
        
        try {
            await createVehicle({
                state_number: normalizedPlate,
                brand: formData.brand,
                model: formData.model,
                manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
                power_hp: formData.power_hp ? parseInt(formData.power_hp) : null,
                category: formData.category,
                vin: formData.vin,
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
                has_tracker: formData.has_tracker,
                parking_type: formData.parking_type
            });
            
            setShowModal(false);
            resetForm();
            await loadVehicles();
        } catch (error) {
            console.error('Create vehicle error:', error);
            const responseData = error.response?.data || {};
            
            // Обработка ошибки дублирования госномера
            if (error.response?.status === 500 && error.response?.data?.message?.includes('Duplicate entry')) {
                setModalError('Автомобиль с таким государственным номером уже существует');
                return;
            }
            
            // Обработка ошибки дублирования VIN
            if (error.response?.status === 500 && error.response?.data?.message?.includes('vehicles_vin_unique')) {
                setModalError('Автомобиль с таким VIN уже существует');
                return;
            }
            
            if (responseData.errors) {
                const errorMessage = formatValidationErrors(responseData.errors);
                setModalError(errorMessage || 'Пожалуйста, проверьте правильность заполнения полей');
            } else if (responseData.message) {
                setModalError(responseData.message);
            } else {
                setModalError('Ошибка при добавлении автомобиля. Проверьте введенные данные');
            }
        }
    }, [formData, formatValidationErrors, loadVehicles, resetForm]);

    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                await deleteVehicle(id);
                await loadVehicles();
                setGlobalError(null);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Ошибка при удалении';
                if (errorMessage.includes('foreign key') || errorMessage.includes('policies')) {
                    setGlobalError('Невозможно удалить автомобиль, на который оформлены полисы');
                } else {
                    setGlobalError(errorMessage);
                }
            }
        }
    }, [loadVehicles]);

    const openModal = useCallback(() => {
        setModalError(null);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setModalError(null);
    }, []);

    const formatYear = useCallback((year) => {
        return year || 'Не указан';
    }, []);

    return {
        vehicles,
        loading,
        showModal,
        modalError,
        globalError,
        formData,
        vehicleCategories: ['A', 'B', 'C', 'D', 'E'],
        parkingOptions: [
            { value: 'garage', label: 'Гараж' },
            { value: 'street', label: 'Улица' },
            { value: 'parking_lot', label: 'Охраняемая парковка' },
            { value: 'other', label: 'Другое' }
        ],
        handleInputChange,
        handleSubmit,
        handleDelete,
        openModal,
        closeModal,
        resetForm,
        setFormData,
        formatYear
    };
};