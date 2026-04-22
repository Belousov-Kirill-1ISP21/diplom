import styles from './VehiclesPanel.module.css';
import { useVehiclesPanel } from '../../../../shared/hooks/profile/useVehiclesPanel';

export const VehiclesPanel = () => {
    const {
        vehicles,
        loading,
        showModal,
        modalError,
        globalError,
        formData,
        vehicleCategories,
        parkingOptions,
        handleInputChange,
        handleSubmit,
        handleDelete,
        openModal,
        closeModal,
        setFormData,
        formatYear
    } = useVehiclesPanel();

    if (loading) {
        return <div className={styles.vehiclesPanel}>Загрузка...</div>;
    }

    return (
        <div className={styles.vehiclesPanel}>
            <div className={styles.header}>
                <h1 className={styles.title}>Мои автомобили</h1>
                <button onClick={openModal} className={styles.addButton}>
                    + Добавить автомобиль
                </button>
            </div>

            {globalError && <div className={styles.error}>{globalError}</div>}

            <div className={styles.vehiclesContainer}>
                {vehicles.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас пока нет добавленных автомобилей</p>
                        <button onClick={openModal} className={styles.addFirstButton}>
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
                                <p><strong>Год выпуска:</strong> {formatYear(vehicle.manufacture_year)}</p>
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
                <div className={styles.modalOverlay} onClick={closeModal}>
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
                                <button type="button" onClick={closeModal}>
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