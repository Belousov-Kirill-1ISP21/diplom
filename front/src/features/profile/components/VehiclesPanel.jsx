import { useState, useEffect } from 'react';
import styles from './VehiclesPanel.module.css';
import { getMyVehicles, createVehicle, deleteVehicle } from '../../../api/vehicles';
import { useAuth } from '../../../shared/context/authContext';

export const VehiclesPanel = () => {
    const { userData } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
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
    const [modalError, setModalError] = useState(null); // Ошибка для модального окна
    const [globalError, setGlobalError] = useState(null); // Ошибка для основного интерфейса (при удалении и т.д.)

    const vehicleCategories = ['A', 'B', 'C', 'D', 'E'];
    const parkingOptions = [
        { value: 'garage', label: 'Гараж' },
        { value: 'street', label: 'Улица' },
        { value: 'parking_lot', label: 'Охраняемая парковка' },
        { value: 'other', label: 'Другое' }
    ];

    // Функция для форматирования ошибок валидации
    const formatValidationErrors = (errors) => {
        if (typeof errors === 'object' && errors !== null) {
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(errors)) {
                const fieldName = {
                    state_number: 'Госномер',
                    brand: 'Марка',
                    model: 'Модель',
                    manufacture_year: 'Год выпуска',
                    power_hp: 'Мощность',
                    category: 'Категория',
                    vin: 'VIN',
                    purchase_price: 'Стоимость',
                    has_tracker: 'Сигнализация',
                    parking_type: 'Способ парковки'
                }[field] || field;
                
                messages.push(`${fieldName}: ${fieldErrors.join(', ')}`);
            }
            return messages.join('; ');
        }
        return null;
    };

    const loadVehicles = async () => {
        try {
            const response = await getMyVehicles();
            setVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setGlobalError('Ошибка при загрузке автомобилей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Очищаем ошибку при изменении любого поля
        if (modalError) setModalError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError(null);
        
        try {
            await createVehicle({
                state_number: formData.state_number,
                brand: formData.brand,
                model: formData.model,
                manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
                power_hp: formData.power_hp ? parseInt(formData.power_hp) : null,
                category: formData.category,
                vin: formData.vin,
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
                has_tracker: formData.has_tracker,
                parking_type: formData.parking_type
            });
            
            setShowModal(false);
            setModalError(null);
            setFormData({
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
            await loadVehicles();
        } catch (error) {
            console.error('Create vehicle error:', error);
            
            // Обработка ошибок валидации
            const responseData = error.response?.data || {};
            
            if (responseData.errors) {
                // Валидационные ошибки от Laravel
                const errorMessage = formatValidationErrors(responseData.errors);
                setModalError(errorMessage || 'Пожалуйста, проверьте правильность заполнения полей');
            } else if (responseData.message) {
                setModalError(responseData.message);
            } else {
                setModalError('Ошибка при добавлении автомобиля');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                await deleteVehicle(id);
                await loadVehicles();
                setGlobalError(null);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Ошибка при удалении';
                if (errorMessage.includes('foreign key') || errorMessage.includes('policies')) {
                    setGlobalError('Невозможно удалить автомобиль, на который оформлены полисы');
                } else {
                    setGlobalError(errorMessage);
                }
            }
        }
    };

    const formatDate = (year) => {
        return year || 'Не указан';
    };

    if (loading) {
        return <div className={styles.vehiclesPanel}>Загрузка...</div>;
    }

    return (
        <div className={styles.vehiclesPanel}>
            <div className={styles.header}>
                <h1 className={styles.title}>Мои автомобили</h1>
                <button onClick={() => {
                    setModalError(null);
                    setShowModal(true);
                }} className={styles.addButton}>
                    + Добавить автомобиль
                </button>
            </div>

            {globalError && <div className={styles.error}>{globalError}</div>}

            <div className={styles.vehiclesContainer}>
                {vehicles.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас пока нет добавленных автомобилей</p>
                        <button onClick={() => {
                            setModalError(null);
                            setShowModal(true);
                        }} className={styles.addFirstButton}>
                            Добавить первый автомобиль
                        </button>
                    </div>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} className={styles.vehicleCard}>
                            <div className={styles.vehicleHeader}>
                                <span className={styles.vehicleName}>
                                    {vehicle.brand} {vehicle.model}
                                </span>
                                <button 
                                    onClick={() => handleDelete(vehicle.id)}
                                    className={styles.deleteButton}
                                >
                                    Удалить
                                </button>
                            </div>
                            <div className={styles.vehicleInfo}>
                                <p><strong>Госномер:</strong> {vehicle.state_number}</p>
                                <p><strong>VIN:</strong> {vehicle.vin}</p>
                                <p><strong>Год выпуска:</strong> {formatDate(vehicle.manufacture_year)}</p>
                                <p><strong>Мощность:</strong> {vehicle.power_hp} л.с.</p>
                                <p><strong>Категория:</strong> {vehicle.category?.code || vehicle.category}</p>
                                {vehicle.purchase_price && (
                                    <p><strong>Стоимость:</strong> {vehicle.purchase_price.toLocaleString()} ₽</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => {
                    setShowModal(false);
                    setModalError(null);
                }}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Добавить автомобиль</h2>
                        
                        {modalError && (
                            <div className={styles.modalError}>
                                {modalError}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Государственный номер *</label>
                                <input
                                    type="text"
                                    name="state_number"
                                    value={formData.state_number}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Марка *</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Модель *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
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
                                        value={formData.manufacture_year}
                                        onChange={handleInputChange}
                                        placeholder="2020"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Мощность (л.с.)</label>
                                    <input
                                        type="number"
                                        name="power_hp"
                                        value={formData.power_hp}
                                        onChange={handleInputChange}
                                        placeholder="150"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Категория ТС</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
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
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Стоимость автомобиля (₽)</label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleInputChange}
                                    placeholder="2000000"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Способ парковки</label>
                                <select
                                    name="parking_type"
                                    value={formData.parking_type}
                                    onChange={handleInputChange}
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
                                        checked={formData.has_tracker}
                                        onChange={handleInputChange}
                                    />
                                    Наличие спутниковой сигнализации
                                </label>
                            </div>

                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => {
                                    setShowModal(false);
                                    setModalError(null);
                                }}>
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