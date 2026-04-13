import { useState } from 'react';
import { useCalculator } from '../context/сalculatorContext';
import { validateDates } from '../lib/validations/calculatorValidations';

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

    const validateStep2 = () => {
        const data = getCurrentData();
        const validationErrors = validateDates(data.startDate, data.endDate);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 2 && !validateStep2()) return;
        
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
        // Сохраняем текущий шаг для текущего типа
        if (policyType === 'osago') {
            setOsagoStep(step);
        } else {
            setKaskoStep(step);
        }
        
        setPolicyType(type);
        
        // Восстанавливаем шаг для нового типа
        if (type === 'osago') {
            setStep(osagoStep);
        } else {
            setStep(kaskoStep);
        }
        setErrors({});
    };

    const getMaxSteps = () => {
        return 3; // У КАСКО тоже 3 шага (авто -> срок -> результат)
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