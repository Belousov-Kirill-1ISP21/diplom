import { useState, useEffect } from 'react';
import styles from './AccidentBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import api from '../../../api/client';

export const AccidentBlock = () => {
    const { isAuthenticated, profileData } = useAuth();
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
        description: '',
        is_client_fault: false
    });

    // Загрузка автомобилей пользователя
    const loadMyVehicles = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/client/vehicles');
            setMyVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    };

    // Загрузка активных полисов для выбранного авто
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
            description: '',
            is_client_fault: false
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        // Очищаем ошибку для этого поля
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Валидация даты
        if (!formData.accident_date) {
            errors.accident_date = 'Укажите дату происшествия';
        } else {
            const accidentDate = new Date(formData.accident_date);
            const policyStartDate = new Date(selectedPolicy.start_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (isNaN(accidentDate.getTime())) {
                errors.accident_date = 'Укажите корректную дату';
            } else if (accidentDate > today) {
                errors.accident_date = 'Дата происшествия не может быть в будущем';
            } else if (accidentDate < policyStartDate) {
                errors.accident_date = `Дата происшествия не может быть раньше начала действия полиса (${new Date(selectedPolicy.start_date).toLocaleDateString('ru-RU')})`;
            }
        }
        
        // Валидация суммы ущерба
        if (formData.damage_amount) {
            const amount = parseFloat(formData.damage_amount);
            if (isNaN(amount) || amount < 0) {
                errors.damage_amount = 'Укажите корректную сумму ущерба';
            } else if (selectedPolicy.coverage_amount && amount > selectedPolicy.coverage_amount) {
                errors.damage_amount = `Сумма ущерба не может превышать страховую сумму (${selectedPolicy.coverage_amount.toLocaleString()} ₽)`;
            } else if (amount === 0) {
                errors.damage_amount = 'Сумма ущерба не может быть равна 0';
            }
        }
        
        // Валидация описания
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
            const response = await api.post(`/client/accidents/${selectedPolicy.id}`, {
                accident_date: formData.accident_date,
                damage_amount: formData.damage_amount ? parseFloat(formData.damage_amount) : null,
                description: formData.description || null,
                is_client_fault: formData.is_client_fault
            });

            setSuccess('Страховой случай успешно зарегистрирован!');
            setFormData({
                accident_date: '',
                damage_amount: '',
                description: '',
                is_client_fault: false
            });
            
            setTimeout(() => {
                setStep(1);
                setSelectedVehicle(null);
                setSelectedPolicy(null);
                setSuccess(null);
                setValidationErrors({});
            }, 3000);
        } catch (error) {
            console.error('Error submitting accident:', error);
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

    if (!isAuthenticated) {
        window.location.href = '/SignIn';
        return null;
    }

    return (
        <div className={styles.accidentForm}>
            <div className={styles.header}>
                <h1 className={styles.title}>Заявление о страховом случае</h1>
                <p className={styles.subtitle}>Заполните форму для регистрации страхового случая</p>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {success && (
                <div className={styles.success}>
                    {success}
                </div>
            )}

            <div className={styles.progress}>
                <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                    1. Выбор автомобиля
                </div>
                <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                    2. Выбор полиса
                </div>
                <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                    3. Данные о происшествии
                </div>
            </div>

            <div className={styles.content}>
                {/* Шаг 1: Выбор автомобиля */}
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h2>Выберите автомобиль</h2>
                        
                        {myVehicles.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                <p>У вас нет добавленных автомобилей</p>
                                <button 
                                    onClick={() => window.location.href = '/Profile?tab=vehicles'}
                                    className={styles.addVehicleButton}
                                >
                                    Добавить автомобиль
                                </button>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}

                {/* Шаг 2: Выбор полиса */}
                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h2>Выберите активный полис</h2>
                        
                        {policies.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                <p>У выбранного автомобиля нет активных полисов</p>
                                <button onClick={handleBack} className={styles.backButton}>
                                    Выбрать другой автомобиль
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.policyList}>
                                    {policies.map(policy => (
                                        <div 
                                            key={policy.id}
                                            className={`${styles.policyCard} ${selectedPolicy?.id === policy.id ? styles.selected : ''}`}
                                            onClick={() => handleSelectPolicy(policy)}
                                        >
                                            <h4>Полис №{policy.policy_number}</h4>
                                            <p>Тип: {policy.policy_type?.name || (policy.policy_type_id === 1 ? 'ОСАГО' : 'КАСКО')}</p>
                                            <p>Действует до: {new Date(policy.end_date).toLocaleDateString('ru-RU')}</p>
                                            <p>Страховая сумма: {policy.coverage_amount?.toLocaleString() || 'не указана'} ₽</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleBack} className={styles.backButton}>
                                    Назад
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Шаг 3: Форма данных о происшествии */}
                {step === 3 && selectedPolicy && (
                    <div className={styles.stepContent}>
                        <h2>Данные о происшествии</h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Дата происшествия *</label>
                                <input
                                    type="date"
                                    name="accident_date"
                                    value={formData.accident_date}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={validationErrors.accident_date ? styles.inputError : ''}
                                />
                                {validationErrors.accident_date && (
                                    <span className={styles.fieldError}>{validationErrors.accident_date}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Сумма ущерба (₽)</label>
                                <input
                                    type="number"
                                    name="damage_amount"
                                    value={formData.damage_amount}
                                    onChange={handleInputChange}
                                    placeholder="Введите сумму ущерба"
                                    min="0"
                                    step="0.01"
                                    className={validationErrors.damage_amount ? styles.inputError : ''}
                                />
                                {validationErrors.damage_amount && (
                                    <span className={styles.fieldError}>{validationErrors.damage_amount}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Описание происшествия</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Опишите обстоятельства происшествия (минимум 10 символов)..."
                                    rows={5}
                                    className={validationErrors.description ? styles.inputError : ''}
                                />
                                {validationErrors.description && (
                                    <span className={styles.fieldError}>{validationErrors.description}</span>
                                )}
                                <span className={styles.charCounter}>
                                    {formData.description?.length || 0}/1000 символов
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="is_client_fault"
                                        checked={formData.is_client_fault}
                                        onChange={handleInputChange}
                                    />
                                    Я признаю свою вину в ДТП
                                </label>
                                <p className={styles.hint}>
                                    {formData.is_client_fault 
                                        ? '⚠️ Признание вины повлияет на ваш бонус-малус класс и стоимость следующего полиса' 
                                        : 'Если вы не признаёте вину, будет проведена экспертиза'}
                                </p>
                            </div>

                            <div className={styles.infoBlock}>
                                <h4>Информация о полисе</h4>
                                <p><strong>Полис:</strong> {selectedPolicy.policy_number}</p>
                                <p><strong>Автомобиль:</strong> {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.state_number})</p>
                                <p><strong>Срок действия:</strong> {new Date(selectedPolicy.start_date).toLocaleDateString('ru-RU')} — {new Date(selectedPolicy.end_date).toLocaleDateString('ru-RU')}</p>
                                <p><strong>Страховая сумма:</strong> {selectedPolicy.coverage_amount?.toLocaleString() || 'не указана'} ₽</p>
                            </div>

                            <div className={styles.buttons}>
                                <button type="button" onClick={handleBack} className={styles.backButton}>
                                    Назад
                                </button>
                                <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                                    {isSubmitting ? 'Отправка...' : 'Отправить заявление'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};