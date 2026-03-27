import React, { createContext, useState, useContext, useEffect } from 'react';

const CalculatorContext = createContext();

export const CalculatorProvider = ({ children }) => {
    const [calculatorData, setCalculatorData] = useState({
        osago: {
            stateNumber: '',
            brand: '',
            model: '',
            manufactureYear: '',
            powerHp: '',
            category: 'B',
            vin: '',
            startDate: '',
            endDate: '',
            calculatedPrice: null
        },
        kasko: {
            stateNumber: '',
            brand: '',
            model: '',
            manufactureYear: '',
            powerHp: '',
            category: 'B',
            vin: '',
            purchasePrice: '',
            hasTracker: false,
            parkingType: 'garage',
            startDate: '',
            endDate: '',
            calculatedPrice: null
        }
    });

    // Загрузка при монтировании
    useEffect(() => {
        const saved = localStorage.getItem('calculatorData');
        if (saved) {
            setCalculatorData(JSON.parse(saved));
        }
    }, []);

    // Сохранение при изменении
    useEffect(() => {
        localStorage.setItem('calculatorData', JSON.stringify(calculatorData));
    }, [calculatorData]);

    const updateOsagoData = (data) => {
        setCalculatorData(prev => ({
            ...prev,
            osago: { ...prev.osago, ...data }
        }));
    };

    const updateKaskoData = (data) => {
        setCalculatorData(prev => ({
            ...prev,
            kasko: { ...prev.kasko, ...data }
        }));
    };

    const updateBothData = (osagoData, kaskoData) => {
        setCalculatorData(prev => ({
            osago: { ...prev.osago, ...osagoData },
            kasko: { ...prev.kasko, ...kaskoData }
        }));
    };

    const resetCalculator = () => {
        const emptyData = {
            osago: {
                stateNumber: '',
                brand: '',
                model: '',
                manufactureYear: '',
                powerHp: '',
                category: 'B',
                vin: '',
                startDate: '',
                endDate: '',
                calculatedPrice: null
            },
            kasko: {
                stateNumber: '',
                brand: '',
                model: '',
                manufactureYear: '',
                powerHp: '',
                category: 'B',
                vin: '',
                purchasePrice: '',
                hasTracker: false,
                parkingType: 'garage',
                startDate: '',
                endDate: '',
                calculatedPrice: null
            }
        };
        setCalculatorData(emptyData);
        localStorage.removeItem('calculatorData');
    };

    return (
        <CalculatorContext.Provider value={{
            calculatorData,
            updateOsagoData,
            updateKaskoData,
            updateBothData,
            resetCalculator
        }}>
            {children}
        </CalculatorContext.Provider>
    );
};

export const useCalculator = () => {
    const context = useContext(CalculatorContext);
    if (!context) {
        throw new Error('useCalculator must be used within a CalculatorProvider');
    }
    return context;
};