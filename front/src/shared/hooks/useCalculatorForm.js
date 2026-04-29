import { useState, useEffect, useCallback } from 'react';
import { useCalculator } from '../context/calculatorContext';
import { normalizeLicensePlate, validateLicensePlate, validateVehicleData, validateDates } from '../lib/validations/calculatorValidations';
import api from '../../api/client';
import { createPolicy } from '../../api/policies';
import { useNavigate } from 'react-router-dom';

export const useCalculatorForm = (isAuthenticated, profileData, addPolicy, refreshPolicies) => {
    const navigate = useNavigate();
    const { calculatorData, updateOsagoData, updateKaskoData } = useCalculator();
    const [policyType, setPolicyType] = useState('osago');
    const [step, setStep] = useState(1);
    const [osagoStep, setOsagoStep] = useState(1);
    const [kaskoStep, setKaskoStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);
    const [myVehicles, setMyVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [newVehicleData, setNewVehicleData] = useState({
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

    const loadMyVehicles = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/client/vehicles');
            setMyVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) loadMyVehicles();
    }, [isAuthenticated, loadMyVehicles]);

    useEffect(() => {
        const saved = localStorage.getItem('pendingCalculatorData');
        if (saved) {
            const { osago, kasko, policyType: savedType, step: savedStep, osagoStep: savedOsagoStep, kaskoStep: savedKaskoStep } = JSON.parse(saved);
            updateOsagoData(osago);
            updateKaskoData(kasko);
            setPolicyType(savedType);
            setStep(savedStep);
            setOsagoStep(savedOsagoStep);
            setKaskoStep(savedKaskoStep);
            localStorage.removeItem('pendingCalculatorData');
        }
    }, []);

    const saveSteps = useCallback(() => {
        localStorage.setItem('pendingCalculatorState', JSON.stringify({
            policyType,
            step,
            osagoStep,
            kaskoStep
        }));
    }, [policyType, step, osagoStep, kaskoStep]);

    useEffect(() => {
        saveSteps();
    }, [step, policyType, saveSteps]);

    const getCurrentData = () => {
        return policyType === 'osago' ? calculatorData.osago : calculatorData.kasko;
    };

    const updateCurrentData = (data) => {
        if (policyType === 'osago') {
            updateOsagoData(data);
        } else {
            updateKaskoData(data);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const currentData = getCurrentData();
        updateCurrentData({
            ...currentData,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        
        let categoryValue = vehicle.category;
        if (typeof categoryValue === 'object' && categoryValue !== null) {
            categoryValue = categoryValue.value || categoryValue.code || 'B';
        }
        
        updateCurrentData({
            ...getCurrentData(),
            stateNumber: vehicle.state_number,
            brand: vehicle.brand,
            model: vehicle.model,
            manufactureYear: vehicle.manufacture_year,
            powerHp: vehicle.power_hp,
            category: categoryValue, 
            vin: vehicle.vin,
            purchasePrice: vehicle.purchase_price,
            hasTracker: vehicle.has_tracker,
            parkingType: vehicle.parking_type,
            vehicleId: vehicle.id
        });
        setErrors({});
    };

    const handleAddNewVehicle = async (e) => {
        e.preventDefault();
        
        // Валидация госномера
        const plateError = validateLicensePlate(newVehicleData.state_number);
        if (plateError) {
            setError(plateError);
            return;
        }
        
        // Нормализуем госномер перед сохранением
        const normalizedPlate = normalizeLicensePlate(newVehicleData.state_number);
        
        const vehicleToAdd = {
            state_number: normalizedPlate,
            brand: newVehicleData.brand,
            model: newVehicleData.model,
            manufacture_year: parseInt(newVehicleData.manufacture_year),
            power_hp: parseInt(newVehicleData.power_hp),
            category: newVehicleData.category,
            vin: newVehicleData.vin,
            purchase_price: newVehicleData.purchase_price ? parseFloat(newVehicleData.purchase_price) : null,
            has_tracker: newVehicleData.has_tracker,
            parking_type: newVehicleData.parking_type
        };

        if (!isAuthenticated) {
            const newVehicle = { id: Date.now(), ...vehicleToAdd };
            setMyVehicles(prev => [...prev, newVehicle]);
            setSelectedVehicle(newVehicle);
            updateCurrentData({
                ...getCurrentData(),
                stateNumber: newVehicle.state_number,
                brand: newVehicle.brand,
                model: newVehicle.model,
                manufactureYear: newVehicle.manufacture_year,
                powerHp: newVehicle.power_hp,
                category: newVehicle.category,
                vin: newVehicle.vin,
                purchasePrice: newVehicle.purchase_price,
                hasTracker: newVehicle.has_tracker,
                parkingType: newVehicle.parking_type,
                vehicleId: newVehicle.id
            });
            setShowVehicleModal(false);
            setNewVehicleData({
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
            return;
        }

        try {
            const response = await api.post('/client/vehicles', vehicleToAdd);
            const newVehicle = response.data.vehicle;
            setMyVehicles(prev => [...prev, newVehicle]);
            setSelectedVehicle(newVehicle);
            updateCurrentData({
                ...getCurrentData(),
                stateNumber: newVehicle.state_number,
                brand: newVehicle.brand,
                model: newVehicle.model,
                manufactureYear: newVehicle.manufacture_year,
                powerHp: newVehicle.power_hp,
                category: newVehicle.category,
                vin: newVehicle.vin,
                purchasePrice: newVehicle.purchase_price,
                hasTracker: newVehicle.has_tracker,
                parkingType: newVehicle.parking_type,
                vehicleId: newVehicle.id
            });
            setShowVehicleModal(false);
            setNewVehicleData({
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
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при добавлении автомобиля');
        }
    };

    const validateStep1 = () => {
        const data = getCurrentData();
        if (data.vehicleId) {
            setErrors({});
            return true;
        }
        const validationErrors = validateVehicleData(data, policyType);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const validateStep2 = () => {
        const data = getCurrentData();
        const errorsList = {};
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!data.startDate) {
            errorsList.startDate = 'Укажите дату начала';
        } else {
            const startDate = new Date(data.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                errorsList.startDate = 'Дата начала не может быть раньше сегодняшнего дня';
            }
        }
        
        if (!data.endDate) {
            errorsList.endDate = 'Укажите дату окончания';
        } else if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            
            if (endDate <= startDate) {
                errorsList.endDate = 'Дата окончания должна быть позже даты начала';
            }
        }
        
        setErrors(errorsList);
        return Object.keys(errorsList).length === 0;
    };

    const calculatePrice = async () => {
        setIsCalculating(true);
        setError(null);
        
        try {
            const currentData = getCurrentData();
            let vehicleId = currentData.vehicleId;
            
            if (!isAuthenticated && !vehicleId) {
                vehicleId = Date.now();
                updateCurrentData({ ...currentData, vehicleId });
            }
    
            if (isAuthenticated && !vehicleId && currentData.stateNumber && currentData.vin) {
                try {
                    let categoryValue = currentData.category;
                    if (typeof categoryValue === 'object' && categoryValue !== null) {
                        categoryValue = categoryValue.value || categoryValue.code || 'B';
                    }
                    
                    const vehicleResponse = await api.post('/client/vehicles', {
                        state_number: currentData.stateNumber,
                        brand: currentData.brand,
                        model: currentData.model,
                        manufacture_year: parseInt(currentData.manufactureYear),
                        power_hp: parseInt(currentData.powerHp),
                        category: categoryValue, 
                        vin: currentData.vin,
                        purchase_price: currentData.purchasePrice ? parseFloat(currentData.purchasePrice) : null,
                        has_tracker: currentData.hasTracker || false,
                        parking_type: currentData.parkingType || 'garage'
                    });
                    vehicleId = vehicleResponse.data.vehicle.id;
                    updateCurrentData({ ...currentData, vehicleId });
                    await loadMyVehicles();
                } catch (err) {
                    console.error('Error creating vehicle:', err);
                    throw new Error('Не удалось создать автомобиль');
                }
            }
            
            if (!vehicleId) throw new Error('Автомобиль не найден');
            
            const policyTypeId = policyType === 'osago' ? 1 : 2;
            const tariffsResponse = await api.get('/tariffs/public', { params: { policy_type_id: policyTypeId } });
            
            let categoryForTariff = currentData.category;
            if (typeof categoryForTariff === 'object' && categoryForTariff !== null) {
                categoryForTariff = categoryForTariff.value || categoryForTariff.code || 'B';
            }
            
            console.log('Looking for tariff with category:', categoryForTariff);
            console.log('Available tariffs:', tariffsResponse.data);
            
            const tariff = tariffsResponse.data.find(t => {
                const tariffCategory = t.vehicle_category?.code || t.vehicle_category;
                return tariffCategory === categoryForTariff;
            });
            
            if (!tariff) {
                throw new Error('Тариф не найден для категории ' + categoryForTariff);
            }
            
            const response = await api.post('/policies/calculate', {
                policy_type_id: policyTypeId,
                vehicle_id: vehicleId,
                tariff_id: tariff.id,
                start_date: currentData.startDate,
                end_date: currentData.endDate,
                power_hp: currentData.powerHp,
                manufacture_year: currentData.manufactureYear
            });
            
            updateCurrentData({ ...currentData, tariffId: tariff.id, calculatedPrice: response.data.calculated_price });
            setStep(3);
            if (policyType === 'osago') {
                setOsagoStep(3);
            } else {
                setKaskoStep(3);
            }
        } catch (error) {
            console.error('Calculate price error:', error);
            
            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                const errorMessages = [];
                
                Object.keys(validationErrors).forEach(key => {
                    errorMessages.push(...validationErrors[key]);
                });
                
                setError(errorMessages[0] || 'Ошибка при расчете');
                
                const fieldErrors = {};
                if (validationErrors.start_date) {
                    fieldErrors.startDate = validationErrors.start_date[0];
                }
                if (validationErrors.end_date) {
                    fieldErrors.endDate = validationErrors.end_date[0];
                }
                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(fieldErrors);
                }
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError(error.message || 'Ошибка при расчете');
            }
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSubmitOrder = async () => {
        if (!isAuthenticated) {
            const currentData = getCurrentData();
            
            const vehicleData = {
                state_number: currentData.stateNumber,
                brand: currentData.brand,
                model: currentData.model,
                manufacture_year: currentData.manufactureYear,
                power_hp: currentData.powerHp,
                category: currentData.category,
                vin: currentData.vin,
                purchase_price: currentData.purchasePrice,
                has_tracker: currentData.hasTracker || false,
                parking_type: currentData.parkingType || 'garage'
            };
            
            const policyData = {
                policy_type_id: policyType === 'osago' ? 1 : 2,
                tariffId: currentData.tariffId,
                calculatedPrice: currentData.calculatedPrice,
                startDate: currentData.startDate,
                endDate: currentData.endDate
            };
            
            console.log('=== handleSubmitOrder for non-authenticated ===');
            console.log('currentData:', currentData);
            console.log('vehicleData to save:', vehicleData);
            console.log('policyData to save:', policyData);
            
            localStorage.setItem('pendingVehicle', JSON.stringify(vehicleData));
            localStorage.setItem('pendingPolicy', JSON.stringify(policyData));
            
            console.log('After save - pendingVehicle:', localStorage.getItem('pendingVehicle'));
            console.log('After save - pendingPolicy:', localStorage.getItem('pendingPolicy'));
            
            window.location.href = '/SignUp';
            return;
        }
        
        setIsCalculating(true);
        try {
            const currentData = getCurrentData();
            const response = await createPolicy({
                policy_type_id: policyType === 'osago' ? 1 : 2,
                client_id: profileData?.id,
                vehicle_id: currentData.vehicleId,
                tariff_id: currentData.tariffId,
                base_price: currentData.calculatedPrice,
                final_price: currentData.calculatedPrice,
                start_date: currentData.startDate,
                end_date: currentData.endDate,
                franchise_amount: 0,
                coverage_amount: null
            });
            addPolicy(response.data.policy);
            await refreshPolicies();
            navigate(`/Payment/${response.data.policy.id}`);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при оформлении полиса');
        } finally {
            setIsCalculating(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2) {
            if (validateStep2()) {
                calculatePrice();
            }
            return;
        }
        const newStep = step + 1;
        setStep(newStep);
        if (policyType === 'osago') {
            setOsagoStep(newStep);
        } else {
            setKaskoStep(newStep);
        }
        setErrors({});
    };

    const prevStep = () => {
        const newStep = step - 1;
        setStep(newStep);
        if (policyType === 'osago') {
            setOsagoStep(newStep);
        } else {
            setKaskoStep(newStep);
        }
        setErrors({});
    };

    const goToStep = (targetStep) => {
        if (targetStep < step) {
            setStep(targetStep);
            if (policyType === 'osago') {
                setOsagoStep(targetStep);
            } else {
                setKaskoStep(targetStep);
            }
            setErrors({});
        }
    };

    const handlePolicyTypeChange = (type) => {
        if (policyType === 'osago') {
            setOsagoStep(step);
        } else {
            setKaskoStep(step);
        }
        setPolicyType(type);
        if (type === 'osago') {
            setStep(osagoStep);
        } else {
            setStep(kaskoStep);
        }
        setErrors({});
    };

    const resetToStep1 = () => {
        setStep(1);
        if (policyType === 'osago') {
            setOsagoStep(1);
        } else {
            setKaskoStep(1);
        }
    };

    return {
        policyType,
        step,
        osagoStep,
        kaskoStep,
        errors,
        error,
        isCalculating,
        myVehicles,
        selectedVehicle,
        showVehicleModal,
        newVehicleData,
        calculatorData,
        getCurrentData,
        updateCurrentData,
        handleInputChange,
        handleSelectVehicle,
        handleAddNewVehicle,
        setShowVehicleModal,
        setNewVehicleData,
        nextStep,
        prevStep,
        goToStep,
        handlePolicyTypeChange,
        resetToStep1,
        handleSubmitOrder
    };
};