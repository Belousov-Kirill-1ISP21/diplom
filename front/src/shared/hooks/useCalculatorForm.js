import { useState } from 'react';
import { useCalculator } from '../context/сalculatorContext';
import { validateDates, validateVehicleData } from '../lib/validations/calculatorValidations';

export const useCalculatorForm = () => {
    const { calculatorData, updateOsagoData, updateKaskoData } = useCalculator();
    const [policyType, setPolicyType] = useState('osago');
    const [step, setStep] = useState(1);
    const [osagoStep, setOsagoStep] = useState(1);
    const [kaskoStep, setKaskoStep] = useState(1);
    const [errors, setErrors] = useState({});

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

    const validateStep1 = () => {
        const data = getCurrentData();
        
        // Если есть vehicleId, считаем что данные валидны (авто выбрано из списка)
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
        const validationErrors = validateDates(data.startDate, data.endDate);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const nextStep = () => {
        console.log('nextStep called, current step:', step);
        
        if (step === 1 && !validateStep1()) {
            console.log('Step 1 validation failed');
            return;
        }
        if (step === 2 && !validateStep2()) {
            console.log('Step 2 validation failed');
            return;
        }
        
        const newStep = step + 1;
        console.log('Moving to step:', newStep);
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

    const getMaxSteps = () => {
        return 3;
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
        calculatorData,
        updateOsagoData,
        updateKaskoData,
        getCurrentData,
        updateCurrentData,
        handleInputChange,
        nextStep,
        prevStep,
        goToStep,
        handlePolicyTypeChange,
        getMaxSteps,
        setPolicyType,
        setStep,
        setOsagoStep,
        setKaskoStep,
        setErrors,
        resetToStep1
    };
};