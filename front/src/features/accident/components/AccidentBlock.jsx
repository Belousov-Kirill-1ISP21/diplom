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
    const [formData, setFormData] = useState({
        accident_date: '',
        damage_amount: '',
        description: ''
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
    };

    const handleSelectPolicy = (policy) => {
        setSelectedPolicy(policy);
        setStep(3);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.post(`/client/accidents/${selectedPolicy.id}`, {
                accident_date: formData.accident_date,
                damage_amount: formData.damage_amount || null,
                description: formData.description || null,
                is_client_fault: false // пока false, позже можно добавить выбор
            });

            setSuccess('Страховой случай успешно зарегистрирован!');
            setFormData({
                accident_date: '',
                damage_amount: '',
                description: ''
            });
            
            // Через 3 секунды сбросить форму
            setTimeout(() => {
                setStep(1);
                setSelectedVehicle(null);
                setSelectedPolicy(null);
                setSuccess(null);
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
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                />
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
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Описание происшествия</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Опишите обстоятельства происшествия..."
                                    rows={5}
                                />
                            </div>

                            <div className={styles.infoBlock}>
                                <h4>Информация о полисе</h4>
                                <p><strong>Полис:</strong> {selectedPolicy.policy_number}</p>
                                <p><strong>Автомобиль:</strong> {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.state_number})</p>
                                <p><strong>Срок действия:</strong> до {new Date(selectedPolicy.end_date).toLocaleDateString('ru-RU')}</p>
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