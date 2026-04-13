import { useState, useEffect } from 'react';
import styles from './CalculatorBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import { useCalculatorForm } from '../../../shared/hooks/useCalculatorForm';
import { createPolicy, calculatePolicy } from '../../../api/policies';
import api from '../../../api/client';

export const CalculatorBlock = () => {
    const { isAuthenticated, addPolicy, refreshPolicies, profileData } = useAuth();
    const form = useCalculatorForm();
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState(null);

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

    const calculatePrice = async () => {
        console.log('=== НАЧАЛО calculatePrice ===');
        setIsCalculating(true);
        setError(null);
        
        try {
            const currentData = form.getCurrentData();
            console.log('currentData:', currentData);
            
            // Проверяем обязательные поля
            if (!currentData.stateNumber) {
                throw new Error('Госномер обязателен');
            }
            if (!currentData.vin) {
                throw new Error('VIN обязателен');
            }
            if (!currentData.category) {
                throw new Error('Категория обязательна');
            }
            if (!currentData.startDate) {
                throw new Error('Дата начала обязательна');
            }
            if (!currentData.endDate) {
                throw new Error('Дата окончания обязательна');
            }
            if (!currentData.brand) {
                throw new Error('Марка обязательна');
            }
            if (!currentData.model) {
                throw new Error('Модель обязательна');
            }
            if (!currentData.manufactureYear) {
                throw new Error('Год выпуска обязателен');
            }
            if (!currentData.powerHp) {
                throw new Error('Мощность обязательна');
            }
            
            console.log('Валидация пройдена');
            
            // 1. Сначала проверяем, существует ли уже такой автомобиль у клиента
            let vehicleId = null;
            
            try {
                const myVehiclesResponse = await api.get('/client/vehicles');
                const myVehicles = myVehiclesResponse.data;
                console.log('Мои автомобили:', myVehicles);
                
                const existingVehicle = myVehicles.find(v => 
                    v.state_number === currentData.stateNumber || 
                    v.vin === currentData.vin
                );
                
                if (existingVehicle) {
                    vehicleId = existingVehicle.id;
                    console.log('=== НАЙДЕН СУЩЕСТВУЮЩИЙ АВТОМОБИЛЬ ===', vehicleId);
                }
            } catch (err) {
                console.log('Ошибка при проверке существующих авто:', err);
            }
            
            // 2. Если автомобиль не найден - создаем новый
            if (!vehicleId) {
                console.log('Создаем новый автомобиль...');
                const vehicleResponse = await api.post('/client/vehicles', {
                    state_number: currentData.stateNumber,
                    brand: currentData.brand,
                    model: currentData.model,
                    manufacture_year: parseInt(currentData.manufactureYear),
                    power_hp: parseInt(currentData.powerHp),
                    category: currentData.category,
                    vin: currentData.vin,
                    purchase_price: currentData.purchasePrice ? parseFloat(currentData.purchasePrice) : null,
                    has_tracker: currentData.hasTracker || false,
                    parking_type: currentData.parkingType || 'garage'
                });
                
                console.log('Ответ от сервера при создании авто:', vehicleResponse.data);
                vehicleId = vehicleResponse.data.vehicle.id;
                console.log('=== СОЗДАН НОВЫЙ АВТОМОБИЛЬ ===', vehicleId);
            }
            
            // 3. Сохраняем vehicleId
            form.updateCurrentData({
                ...currentData,
                vehicleId: vehicleId
            });
            
            // 4. Получаем tariff_id
            const policyTypeId = form.policyType === 'osago' ? 1 : 2;
            console.log('policyTypeId:', policyTypeId);
            

            const tariffsResponse = await api.get('/tariffs/public', {
                params: { policy_type_id: policyTypeId }
            });
            console.log('Тарифы:', tariffsResponse.data);
            
            console.log('Тип vehicle_category в тарифах:', tariffsResponse.data.map(t => ({ id: t.id, category: t.vehicle_category, type: typeof t.vehicle_category })));
            console.log('Тип currentData.category:', currentData.category, typeof currentData.category);
            console.log('Сравнение:', tariffsResponse.data[0]?.vehicle_category === currentData.category);
            const tariff = tariffsResponse.data.find(t => t.vehicle_category?.code === currentData.category);
            console.log('Найденный тариф:', tariff);
            
            if (!tariff) {
                throw new Error('Тариф не найден для категории ' + currentData.category);
            }
            
            // 5. Рассчитываем стоимость
            console.log('Отправляем запрос на расчет...');
            const response = await api.post('/client/policies/calculate', {
                policy_type_id: policyTypeId,
                vehicle_id: vehicleId,
                tariff_id: tariff.id,
                start_date: currentData.startDate,
                end_date: currentData.endDate
            });
            
            console.log('Ответ на расчет:', response.data);
            const calculatedPrice = response.data.calculated_price;
            
            form.updateCurrentData({
                ...currentData,
                vehicleId: vehicleId,
                tariffId: tariff.id,
                calculatedPrice: calculatedPrice
            });
            
            if (form.policyType === 'osago') {
                form.setOsagoStep(3);
                form.setStep(3);
            } else {
                form.setKaskoStep(4);
                form.setStep(4);
            }
            
        } catch (error) {
            console.error('=== ОШИБКА В calculatePrice ===');
            console.error('Тип ошибки:', error.name);
            console.error('Сообщение:', error.message);
            console.error('Стек:', error.stack);
            
            if (error.response) {
                console.error('Статус:', error.response.status);
                console.error('Данные ошибки:', error.response.data);
                console.error('Ошибки валидации:', error.response.data?.errors);
            }
            
            let errorMessage = error.message || 'Ошибка при расчете';
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsCalculating(false);
        }
    };
    
    const handleSubmit = async () => {
        if (!isAuthenticated) {
            // ... сохранение в localStorage
            return;
        }
    
        setIsCalculating(true);
        setError(null);
        
        try {
            const currentData = form.getCurrentData();
            const clientId = profileData?.id;
            
            if (!clientId) throw new Error('Client profile not found');
            if (!currentData.vehicleId) throw new Error('Vehicle not created');
            if (!currentData.tariffId) throw new Error('Tariff not found');
            
            const response = await createPolicy({
                policy_type_id: form.policyType === 'osago' ? 1 : 2,
                client_id: clientId,
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
            window.location.href = '/Profile?tab=policies';
        } catch (error) {
            console.error('Error:', error.response?.data);
            setError(error.response?.data?.message || 'Ошибка при оформлении полиса');
        } finally {
            setIsCalculating(false);
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

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

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
                                <button onClick={calculatePrice} disabled={isCalculating} className={styles.calculateButton}>
                                    {isCalculating ? 'Расчет...' : 'Рассчитать'}
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
                            <button onClick={calculatePrice} disabled={isCalculating} className={styles.calculateButton}>
                                {isCalculating ? 'Расчет...' : 'Рассчитать'}
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
                                    <button onClick={handleSubmit} disabled={isCalculating} className={styles.submitButton}>
                                        {isCalculating ? 'Оформление...' : 'Оформить полис'}
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