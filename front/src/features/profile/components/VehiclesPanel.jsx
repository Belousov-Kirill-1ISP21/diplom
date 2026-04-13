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
    const [error, setError] = useState(null);

    const vehicleCategories = ['A', 'B', 'C', 'D', 'E'];
    const parkingOptions = [
        { value: 'garage', label: 'Гараж' },
        { value: 'street', label: 'Улица' },
        { value: 'parking_lot', label: 'Охраняемая парковка' },
        { value: 'other', label: 'Другое' }
    ];

    const loadVehicles = async () => {
        try {
            const response = await getMyVehicles();
            setVehicles(response.data);
        } catch (error) {
            console.error('Error loading vehicles:', error);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            await createVehicle({
                state_number: formData.state_number,
                brand: formData.brand,
                model: formData.model,
                manufacture_year: parseInt(formData.manufacture_year),
                power_hp: parseInt(formData.power_hp),
                category: formData.category,
                vin: formData.vin,
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
                has_tracker: formData.has_tracker,
                parking_type: formData.parking_type
            });
            
            setShowModal(false);
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
            setError(error.response?.data?.message || 'Ошибка при добавлении автомобиля');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                await deleteVehicle(id);
                await loadVehicles();
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Ошибка при удалении';
                if (errorMessage.includes('foreign key') || errorMessage.includes('policies')) {
                    setError('Невозможно удалить автомобиль, на который оформлены полисы');
                } else {
                    setError(errorMessage);
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
                <button onClick={() => setShowModal(true)} className={styles.addButton}>
                    + Добавить автомобиль
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.vehiclesContainer}>
                {vehicles.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас пока нет добавленных автомобилей</p>
                        <button onClick={() => setShowModal(true)} className={styles.addFirstButton}>
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
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Добавить автомобиль</h2>
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
                                <button type="button" onClick={() => setShowModal(false)}>
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