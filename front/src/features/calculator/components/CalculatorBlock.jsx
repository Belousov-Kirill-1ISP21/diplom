import { useState, useEffect } from 'react';
import styles from './CalculatorBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import { useCalculatorForm } from '../../../shared/hooks/useCalculatorForm';
import { createPolicy, calculatePolicy } from '../../../api/policies';
import api from '../../../api/client';
import { useNavigate } from 'react-router-dom';

export const CalculatorBlock = () => {
    const { isAuthenticated, addPolicy, refreshPolicies, profileData } = useAuth();
    const navigate = useNavigate();
    const form = useCalculatorForm();
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

    const saveSteps = (type, currentStep, oStep, kStep) => {
        localStorage.setItem('pendingCalculatorState', JSON.stringify({
            policyType: type,
            step: currentStep,
            osagoStep: oStep,
            kaskoStep: kStep
        }));
    };

    const loadMyVehicles = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/client/vehicles');
            setMyVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadMyVehicles();
        }
    }, [isAuthenticated]);

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
        const isLastStep = form.step === 3;
        
        if (isLastStep && !currentData.calculatedPrice) {
            const mockPrice = form.policyType === 'osago' ? 2890 : 15000;
            form.updateCurrentData({ ...currentData, calculatedPrice: mockPrice });
        }
        
        saveSteps(form.policyType, form.step, form.osagoStep, form.kaskoStep);
    }, [form.step, form.policyType]);

    const handleNewVehicleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewVehicleData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddNewVehicle = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/client/vehicles', {
                state_number: newVehicleData.state_number,
                brand: newVehicleData.brand,
                model: newVehicleData.model,
                manufacture_year: parseInt(newVehicleData.manufacture_year),
                power_hp: parseInt(newVehicleData.power_hp),
                category: newVehicleData.category,
                vin: newVehicleData.vin,
                purchase_price: newVehicleData.purchase_price ? parseFloat(newVehicleData.purchase_price) : null,
                has_tracker: newVehicleData.has_tracker,
                parking_type: newVehicleData.parking_type
            });
            
            const newVehicle = response.data.vehicle;
            setMyVehicles(prev => [...prev, newVehicle]);
            setSelectedVehicle(newVehicle);
            
            form.updateCurrentData({
                ...form.getCurrentData(),
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

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        form.updateCurrentData({
            ...form.getCurrentData(),
            stateNumber: vehicle.state_number,
            brand: vehicle.brand,
            model: vehicle.model,
            manufactureYear: vehicle.manufacture_year,
            powerHp: vehicle.power_hp,
            category: vehicle.category,
            vin: vehicle.vin,
            purchasePrice: vehicle.purchase_price,
            hasTracker: vehicle.has_tracker,
            parkingType: vehicle.parking_type,
            vehicleId: vehicle.id
        });
        // Очищаем ошибки валидации
        form.setErrors({});
    };

    const calculatePrice = async () => {
        setIsCalculating(true);
        setError(null);
        
        try {
            const currentData = form.getCurrentData();
            
            let vehicleId = currentData.vehicleId;
            
            if (!vehicleId && isAuthenticated) {
                // Проверяем, существует ли такой автомобиль
                const existingVehicle = myVehicles.find(v => 
                    v.state_number === currentData.stateNumber || 
                    v.vin === currentData.vin
                );
                
                if (existingVehicle) {
                    vehicleId = existingVehicle.id;
                    form.updateCurrentData({ ...currentData, vehicleId: vehicleId });
                } else if (currentData.stateNumber && currentData.vin) {
                    // Создаем новый
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
                    
                    vehicleId = vehicleResponse.data.vehicle.id;
                    form.updateCurrentData({ ...currentData, vehicleId: vehicleId });
                    await loadMyVehicles();
                }
            }
            
            if (!vehicleId) {
                throw new Error('Автомобиль не найден. Заполните все поля или выберите авто из списка');
            }
            
            const policyTypeId = form.policyType === 'osago' ? 1 : 2;
            const tariffsResponse = await api.get('/tariffs/public', {
                params: { policy_type_id: policyTypeId }
            });
            
            const categoryCode = typeof currentData.category === 'object' 
                ? currentData.category?.code 
                : currentData.category;
            
            const tariff = tariffsResponse.data.find(t => t.vehicle_category?.code === categoryCode);
            
            if (!tariff) {
                throw new Error('Тариф не найден для категории ' + currentData.category);
            }
            
            const response = await api.post('/client/policies/calculate', {
                policy_type_id: policyTypeId,
                vehicle_id: vehicleId,
                tariff_id: tariff.id,
                start_date: currentData.startDate,
                end_date: currentData.endDate
            });
            
            const calculatedPrice = response.data.calculated_price;
            
            form.updateCurrentData({
                ...currentData,
                tariffId: tariff.id,
                calculatedPrice: calculatedPrice
            });
            
            form.nextStep();
            
        } catch (error) {
            console.error('Error in calculatePrice:', error);
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
            localStorage.setItem('pendingCalculatorData', JSON.stringify({
                osago: form.calculatorData.osago,
                kasko: form.calculatorData.kasko,
                policyType: form.policyType,
                step: form.step,
                osagoStep: form.osagoStep,
                kaskoStep: form.kaskoStep
            }));
            window.location.href = '/SignUp';
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
            
            navigate(`/Payment/${response.data.policy.id}`);
        } catch (error) {
            console.error('Error:', error.response?.data);
            setError(error.response?.data?.message || 'Ошибка при оформлении полиса');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleNextStep = () => {
        // Валидация через хук
        form.nextStep();
        setError(null);
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
                <div 
                    className={`${styles.step} ${form.step >= 3 ? styles.active : ''} ${form.step > 3 ? styles.clickable : ''}`}
                    onClick={() => form.goToStep(3)}
                >
                    3. Результат
                </div>
            </div>

            <div className={styles.content}>
                {/* Шаг 1: Данные об автомобиле */}
                {form.step === 1 && (
                    <div className={styles.stepContent}>
                        <h2>Данные об автомобиле</h2>
                        
                        {isAuthenticated && myVehicles.length > 0 ? (
                            <>
                                <div className={styles.vehicleSelector}>
                                    <label>Выберите ваш автомобиль из списка</label>
                                    <div className={styles.vehicleList}>
                                        {myVehicles.map(vehicle => (
                                            <div 
                                                key={vehicle.id}
                                                className={`${styles.vehicleCard} ${selectedVehicle?.id === vehicle.id ? styles.selected : ''}`}
                                                onClick={() => handleSelectVehicle(vehicle)}
                                            >
                                                <h4>{vehicle.brand} {vehicle.model}</h4>
                                                <p>Госномер: {vehicle.state_number}</p>
                                                <p>VIN: {vehicle.vin}</p>
                                                <p>Год: {vehicle.manufacture_year} | {vehicle.power_hp} л.с.</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowVehicleModal(true)} className={styles.addVehicleButton}>
                                        + Добавить новый автомобиль
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Государственный номер</label>
                                    <input
                                        type="text"
                                        name="stateNumber"
                                        value={form.getCurrentData().stateNumber || ''}
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
                                            value={form.getCurrentData().brand || ''}
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
                                            value={form.getCurrentData().model || ''}
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
                                            value={form.getCurrentData().manufactureYear || ''}
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
                                            value={form.getCurrentData().powerHp || ''}
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
                                        value={form.getCurrentData().category || 'B'}
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
                                        value={form.getCurrentData().vin || ''}
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
                                            value={form.getCurrentData().purchasePrice || ''}
                                            onChange={form.handleInputChange}
                                            placeholder="2000000"
                                            className={form.errors.purchasePrice ? styles.error : ''}
                                        />
                                        {form.errors.purchasePrice && <span className={styles.errorMessage}>{form.errors.purchasePrice}</span>}
                                    </div>
                                )}

                                {isAuthenticated && myVehicles.length === 0 && (
                                    <button onClick={() => setShowVehicleModal(true)} className={styles.addVehicleButton}>
                                        + Добавить автомобиль в профиль
                                    </button>
                                )}
                            </>
                        )}
                        
                        <button onClick={handleNextStep} className={styles.nextButton}>
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
                                    value={form.getCurrentData().startDate || ''}
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
                                    value={form.getCurrentData().endDate || ''}
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
                            <button onClick={calculatePrice} disabled={isCalculating} className={styles.calculateButton}>
                                {isCalculating ? 'Расчет...' : 'Рассчитать'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Шаг 3: Результат */}
                {form.step === 3 && (
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
                                        {isCalculating ? 'Оформление...' : 'Перейти к оплате'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно добавления автомобиля */}
            {showVehicleModal && (
                <div className={styles.modalOverlay} onClick={() => setShowVehicleModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Добавить автомобиль</h2>
                        <form onSubmit={handleAddNewVehicle}>
                            <div className={styles.formGroup}>
                                <label>Государственный номер *</label>
                                <input
                                    type="text"
                                    name="state_number"
                                    value={newVehicleData.state_number}
                                    onChange={handleNewVehicleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Марка *</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={newVehicleData.brand}
                                        onChange={handleNewVehicleInputChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Модель *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={newVehicleData.model}
                                        onChange={handleNewVehicleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Год выпуска</label>
                                    <input
                                        type="number"
                                        name="manufacture_year"
                                        value={newVehicleData.manufacture_year}
                                        onChange={handleNewVehicleInputChange}
                                        placeholder="2020"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Мощность (л.с.)</label>
                                    <input
                                        type="number"
                                        name="power_hp"
                                        value={newVehicleData.power_hp}
                                        onChange={handleNewVehicleInputChange}
                                        placeholder="150"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Категория ТС</label>
                                <select
                                    name="category"
                                    value={newVehicleData.category}
                                    onChange={handleNewVehicleInputChange}
                                >
                                    {vehicleCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>VIN *</label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={newVehicleData.vin}
                                    onChange={handleNewVehicleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Стоимость автомобиля (₽)</label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={newVehicleData.purchase_price}
                                    onChange={handleNewVehicleInputChange}
                                    placeholder="2000000"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Способ парковки</label>
                                <select
                                    name="parking_type"
                                    value={newVehicleData.parking_type}
                                    onChange={handleNewVehicleInputChange}
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
                                        name="has_tracker"
                                        checked={newVehicleData.has_tracker}
                                        onChange={handleNewVehicleInputChange}
                                    />
                                    Наличие спутниковой сигнализации
                                </label>
                            </div>

                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => setShowVehicleModal(false)}>
                                    Отмена
                                </button>
                                <button type="submit">
                                    Добавить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};