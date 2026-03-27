import { useState } from 'react';
import { useCalculator } from '../context/сalculatorContext';
import { validateVehicleData, validateDates } from '../lib/validations/calculatorValidations';

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
        if (step === 1 && !validateStep1()) return;
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
            const currentData = getCurrentData();
            updateCurrentData(currentData);
            setStep(targetStep);
            if (policyType === 'osago') {
                setOsagoStep(targetStep);
            } else {
                setKaskoStep(targetStep);
            }
            setErrors({});
        }
    };

    const calculatePrice = () => {
        const currentData = getCurrentData();
        const mockPrice = policyType === 'osago' ? 2890 : 15000;
        
        updateCurrentData({
            ...currentData,
            calculatedPrice: mockPrice
        });
        
        if (policyType === 'osago') {
            setOsagoStep(3);
            setStep(3);
        } else {
            setKaskoStep(4);
            setStep(4);
        }
    };

    const handlePolicyTypeChange = (type) => {
        const currentData = getCurrentData();
        updateCurrentData(currentData);
        
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
        return policyType === 'osago' ? 3 : 4;
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
        calculatePrice,
        handlePolicyTypeChange,
        getMaxSteps,
        setPolicyType,
        setStep,
        setOsagoStep,
        setKaskoStep,
        setErrors
    };
};