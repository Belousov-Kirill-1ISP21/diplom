import styles from './VehiclesPanel.module.css';
import { useVehiclesPanel } from '../../../../shared/hooks/profile/useVehiclesPanel';
import { NEW_VEHICLE_FIELDS, VEHICLE_CATEGORIES, PARKING_OPTIONS } from '../../../../shared/config/fields';

export const VehiclesPanel = () => {
    const {
        vehicles,
        loading,
        showModal,
        modalError,
        globalError,
        formData,
        handleInputChange,
        handleSubmit,
        handleDelete,
        openModal,
        closeModal,
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
                            {NEW_VEHICLE_FIELDS.map(field => {
                                if (field.type === 'select') {
                                    const options = field.options || VEHICLE_CATEGORIES;
                                    return (
                                        <div key={field.name} className={styles.formGroup}>
                                            <label>{field.label}</label>
                                            <select 
                                                name={field.name} 
                                                value={formData[field.name]} 
                                                onChange={handleInputChange}
                                                required={field.required}
                                            >
                                                {options.map(opt => typeof opt === 'object' 
                                                    ? <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    : <option key={opt} value={opt}>{opt}</option>
                                                )}
                                            </select>
                                        </div>
                                    );
                                }
                                if (field.type === 'checkbox') {
                                    return (
                                        <div key={field.name} className={styles.checkboxGroup}>
                                            <label>
                                                <input 
                                                    type="checkbox" 
                                                    name={field.name} 
                                                    checked={formData[field.name]} 
                                                    onChange={handleInputChange}
                                                />
                                                {field.label}
                                            </label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={field.name} className={styles.formGroup}>
                                        <label>{field.label}</label>
                                        <input 
                                            type={field.type} 
                                            name={field.name} 
                                            value={formData[field.name]} 
                                            onChange={handleInputChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            min={field.min}
                                            max={field.max}
                                            step={field.step}
                                        />
                                    </div>
                                );
                            })}
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