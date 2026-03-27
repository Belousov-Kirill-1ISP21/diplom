import { useState, useEffect } from 'react';
import styles from './CalculatorBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import { useCalculatorForm } from '../../../shared/hooks/useCalculatorForm';

export const CalculatorBlock = () => {
    const { isAuthenticated, addPolicy } = useAuth();
    const form = useCalculatorForm();

    const saveSteps = (type, currentStep, oStep, kStep) => {
        localStorage.setItem('pendingCalculatorState', JSON.stringify({
            policyType: type,
            step: currentStep,
            osagoStep: oStep,
            kaskoStep: kStep
        }));
    };

    useEffect(() => {
        const saved = localStorage.getItem('pendingCalculatorData');
        if (saved) {
            const { osago, kasko, policyType: savedType, step: savedStep, osagoStep: savedOsagoStep, kaskoStep: savedKaskoStep } = JSON.parse(saved);
            
            form.updateOsagoData(osago);
            form.updateKaskoData(kasko);
            
            form.setPolicyType(savedType);
            form.setStep(savedStep);
            form.setOsagoStep(savedOsagoStep);
            form.setKaskoStep(savedKaskoStep);
            
            localStorage.removeItem('pendingCalculatorData');
        }
    }, []);

    useEffect(() => {
        const currentData = form.getCurrentData();
        const isLastStep = (form.policyType === 'osago' && form.step === 3) || (form.policyType === 'kasko' && form.step === 4);
        
        if (isLastStep && !currentData.calculatedPrice) {
            const mockPrice = form.policyType === 'osago' ? 2890 : 15000;
            form.updateCurrentData({ ...currentData, calculatedPrice: mockPrice });
        }
        
        saveSteps(form.policyType, form.step, form.osagoStep, form.kaskoStep);
    }, [form.step, form.policyType]);

    const handleSubmit = () => {
        const currentData = form.getCurrentData();
        
        if (isAuthenticated) {
            const newPolicy = {
                id: Date.now(),
                policyNumber: `POL-${Date.now()}`,
                type: form.policyType === 'osago' ? 'ОСАГО' : 'КАСКО',
                ...currentData,
                status: 'Активный',
                createdAt: new Date().toISOString()
            };
            addPolicy(newPolicy);
            window.location.href = '/Profile?tab=policies';
        } else {
            localStorage.setItem('pendingCalculatorData', JSON.stringify({
                osago: form.calculatorData.osago,
                kasko: form.calculatorData.kasko,
                policyType: form.policyType,
                step: form.step,
                osagoStep: form.osagoStep,
                kaskoStep: form.kaskoStep
            }));
            window.location.href = '/SignUp';
        }
    };

    const vehicleCategories = ['A', 'B', 'C', 'D', 'E'];
    const parkingOptions = [
        { value: 'garage', label: 'Гараж' },
        { value: 'street', label: 'Улица' },
        { value: 'parking_lot', label: 'Охраняемая парковка' },
        { value: 'other', label: 'Другое' }
    ];

    return (
        <div className={styles.calculator}>
            <div className={styles.header}>
                <h1>Калькулятор страховки</h1>
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${form.policyType === 'osago' ? styles.active : ''}`}
                        onClick={() => form.handlePolicyTypeChange('osago')}
                    >
                        ОСАГО
                    </button>
                    <button 
                        className={`${styles.tab} ${form.policyType === 'kasko' ? styles.active : ''}`}
                        onClick={() => form.handlePolicyTypeChange('kasko')}
                    >
                        КАСКО
                    </button>
                </div>
            </div>

            <div className={styles.progress}>
                <div 
                    className={`${styles.step} ${form.step >= 1 ? styles.active : ''} ${form.step > 1 ? styles.clickable : ''}`}
                    onClick={() => form.goToStep(1)}
                >
                    1. Автомобиль
                </div>
                <div 
                    className={`${styles.step} ${form.step >= 2 ? styles.active : ''} ${form.step > 2 ? styles.clickable : ''}`}
                    onClick={() => form.goToStep(2)}
                >
                    2. Срок
                </div>
                {form.policyType === 'kasko' && (
                    <div 
                        className={`${styles.step} ${form.step >= 3 ? styles.active : ''} ${form.step > 3 ? styles.clickable : ''}`}
                        onClick={() => form.goToStep(3)}
                    >
                        3. Опции
                    </div>
                )}
                <div 
                    className={`${styles.step} ${form.step >= form.getMaxSteps() ? styles.active : ''} ${form.step > form.getMaxSteps() ? styles.clickable : ''}`}
                    onClick={() => form.goToStep(form.getMaxSteps())}
                >
                    {form.policyType === 'kasko' ? '4. Результат' : '3. Результат'}
                </div>
            </div>

            <div className={styles.content}>
                {/* Шаг 1: Данные об автомобиле */}
                {form.step === 1 && (
                    <div className={styles.stepContent}>
                        <h2>Данные об автомобиле</h2>
                        
                        <div className={styles.formGroup}>
                            <label>Государственный номер</label>
                            <input
                                type="text"
                                name="stateNumber"
                                value={form.getCurrentData().stateNumber}
                                onChange={form.handleInputChange}
                                placeholder="А123ВС777"
                                className={form.errors.stateNumber ? styles.error : ''}
                            />
                            {form.errors.stateNumber && <span className={styles.errorMessage}>{form.errors.stateNumber}</span>}
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Марка</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={form.getCurrentData().brand}
                                    onChange={form.handleInputChange}
                                    placeholder="Toyota"
                                    className={form.errors.brand ? styles.error : ''}
                                />
                                {form.errors.brand && <span className={styles.errorMessage}>{form.errors.brand}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Модель</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={form.getCurrentData().model}
                                    onChange={form.handleInputChange}
                                    placeholder="Camry"
                                    className={form.errors.model ? styles.error : ''}
                                />
                                {form.errors.model && <span className={styles.errorMessage}>{form.errors.model}</span>}
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Год выпуска</label>
                                <input
                                    type="number"
                                    name="manufactureYear"
                                    value={form.getCurrentData().manufactureYear}
                                    onChange={form.handleInputChange}
                                    placeholder="2020"
                                    className={form.errors.manufactureYear ? styles.error : ''}
                                />
                                {form.errors.manufactureYear && <span className={styles.errorMessage}>{form.errors.manufactureYear}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Мощность (л.с.)</label>
                                <input
                                    type="number"
                                    name="powerHp"
                                    value={form.getCurrentData().powerHp}
                                    onChange={form.handleInputChange}
                                    placeholder="150"
                                    className={form.errors.powerHp ? styles.error : ''}
                                />
                                {form.errors.powerHp && <span className={styles.errorMessage}>{form.errors.powerHp}</span>}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Категория ТС</label>
                            <select
                                name="category"
                                value={form.getCurrentData().category}
                                onChange={form.handleInputChange}
                            >
                                {vehicleCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>VIN</label>
                            <input
                                type="text"
                                name="vin"
                                value={form.getCurrentData().vin}
                                onChange={form.handleInputChange}
                                placeholder="JTDBE32KX00123456"
                                className={form.errors.vin ? styles.error : ''}
                            />
                            {form.errors.vin && <span className={styles.errorMessage}>{form.errors.vin}</span>}
                        </div>

                        {form.policyType === 'kasko' && (
                            <div className={styles.formGroup}>
                                <label>Стоимость автомобиля (₽)</label>
                                <input
                                    type="number"
                                    name="purchasePrice"
                                    value={form.getCurrentData().purchasePrice}
                                    onChange={form.handleInputChange}
                                    placeholder="2000000"
                                    className={form.errors.purchasePrice ? styles.error : ''}
                                />
                                {form.errors.purchasePrice && <span className={styles.errorMessage}>{form.errors.purchasePrice}</span>}
                            </div>
                        )}

                        <button onClick={form.nextStep} className={styles.nextButton}>
                            Далее
                        </button>
                    </div>
                )}

                {/* Шаг 2: Срок страхования */}
                {form.step === 2 && (
                    <div className={styles.stepContent}>
                        <h2>Срок страхования</h2>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Дата начала</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.getCurrentData().startDate}
                                    onChange={form.handleInputChange}
                                    className={form.errors.startDate ? styles.error : ''}
                                />
                                {form.errors.startDate && <span className={styles.errorMessage}>{form.errors.startDate}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Дата окончания</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.getCurrentData().endDate}
                                    onChange={form.handleInputChange}
                                    className={form.errors.endDate ? styles.error : ''}
                                />
                                {form.errors.endDate && <span className={styles.errorMessage}>{form.errors.endDate}</span>}
                            </div>
                        </div>

                        <div className={styles.buttons}>
                            <button onClick={form.prevStep} className={styles.prevButton}>
                                Назад
                            </button>
                            {form.policyType === 'kasko' ? (
                                <button onClick={form.nextStep} className={styles.nextButton}>
                                    Далее
                                </button>
                            ) : (
                                <button onClick={form.calculatePrice} className={styles.calculateButton}>
                                    Рассчитать
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Шаг 3: Опции КАСКО */}
                {form.step === 3 && form.policyType === 'kasko' && (
                    <div className={styles.stepContent}>
                        <h2>Дополнительные опции</h2>

                        <div className={styles.formGroup}>
                            <label>Способ парковки</label>
                            <select
                                name="parkingType"
                                value={form.getCurrentData().parkingType}
                                onChange={form.handleInputChange}
                            >
                                {parkingOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label>
                                <input
                                    type="checkbox"
                                    name="hasTracker"
                                    checked={form.getCurrentData().hasTracker}
                                    onChange={form.handleInputChange}
                                />
                                Наличие спутниковой сигнализации
                            </label>
                        </div>

                        <div className={styles.buttons}>
                            <button onClick={form.prevStep} className={styles.prevButton}>
                                Назад
                            </button>
                            <button onClick={form.calculatePrice} className={styles.calculateButton}>
                                Рассчитать
                            </button>
                        </div>
                    </div>
                )}

                {/* Шаг 4: Результат */}
                {((form.policyType === 'osago' && form.step === 3) || (form.policyType === 'kasko' && form.step === 4)) && (
                    <div className={styles.stepContent}>
                        <h2>Результат расчёта</h2>
                        
                        {form.getCurrentData().calculatedPrice && (
                            <div className={styles.result}>
                                <div className={styles.price}>
                                    <span>Стоимость полиса:</span>
                                    <strong>{form.getCurrentData().calculatedPrice.toLocaleString()} ₽</strong>
                                </div>
                                
                                <div className={styles.info}>
                                    <p>В стоимость включено:</p>
                                    <ul>
                                        <li>Страхование гражданской ответственности</li>
                                        {form.policyType === 'kasko' && (
                                            <>
                                                <li>Страхование от угона</li>
                                                <li>Страхование от ущерба</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className={styles.resultButtons}>
                                    <button onClick={form.prevStep} className={styles.prevButton}>
                                        Назад
                                    </button>
                                    <button onClick={handleSubmit} className={styles.submitButton}>
                                        Оформить полис
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};