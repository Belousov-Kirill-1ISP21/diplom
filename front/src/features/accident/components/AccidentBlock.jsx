import styles from './AccidentBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import { useAccidentForm } from '../../../shared/hooks/useAccidentForm';
import { ACCIDENT_FIELDS } from '../../../shared/config/fields';

const renderField = (field, formData, handleInputChange, validationErrors) => {
    if (field.type === 'textarea') {
        return (
            <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                rows={field.rows}
                className={validationErrors[field.name] ? 'inputError' : ''}
            />
        );
    }
    
    if (field.type === 'checkbox') {
        return (
            <label className="checkboxLabel">
                <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name]}
                    onChange={handleInputChange}
                />
                {field.label}
            </label>
        );
    }
    
    if (field.type === 'date') {
        return (
            <input
                type="date"
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={validationErrors[field.name] ? 'inputError' : ''}
            />
        );
    }
    
    return (
        <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            min="0"
            step="0.01"
            className={validationErrors[field.name] ? 'inputError' : ''}
        />
    );
};

export const AccidentBlock = () => {
    const { isAuthenticated } = useAuth();
    const {
        step,
        myVehicles,
        selectedVehicle,
        policies,
        selectedPolicy,
        isSubmitting,
        error,
        success,
        validationErrors,
        formData,
        handleSelectVehicle,
        handleSelectPolicy,
        handleInputChange,
        handleSubmit,
        handleBack
    } = useAccidentForm(isAuthenticated);

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

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.progress}>
                <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. Выбор автомобиля</div>
                <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. Выбор полиса</div>
                <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. Данные о происшествии</div>
            </div>

            <div className={styles.content}>
                {step === 1 && (
                    <div className={styles.stepContent}>
                        <h2>Выберите автомобиль</h2>
                        {myVehicles.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                <p>У вас нет добавленных автомобилей</p>
                                <button onClick={() => window.location.href = '/Profile?tab=vehicles'} className={styles.addVehicleButton}>
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

                {step === 2 && (
                    <div className={styles.stepContent}>
                        <h2>Выберите активный полис</h2>
                        {policies.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                <p>У выбранного автомобиля нет активных полисов</p>
                                <button onClick={handleBack} className={styles.backButton}>Выбрать другой автомобиль</button>
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
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleBack} className={styles.backButton}>Назад</button>
                            </>
                        )}
                    </div>
                )}

                {step === 3 && selectedPolicy && (
                    <div className={styles.stepContent}>
                        <h2>Данные о происшествии</h2>
                        <form onSubmit={handleSubmit}>
                            {ACCIDENT_FIELDS.map(field => (
                                <div key={field.name} className={styles.formGroup}>
                                    <label>{field.label}</label>
                                    {renderField(field, formData, handleInputChange, validationErrors)}
                                    {validationErrors[field.name] && <span className={styles.fieldError}>{validationErrors[field.name]}</span>}
                                    {field.name === 'description' && (
                                        <span className={styles.charCounter}>{formData.description?.length || 0}/1000 символов</span>
                                    )}
                                    {field.name === 'is_client_fault' && (
                                        <p className={styles.hint}>
                                            {formData.is_client_fault 
                                                ? '⚠️ Признание вины повлияет на ваш бонус-малус класс' 
                                                : 'Если вы не признаёте вину, будет проведена экспертиза'}
                                        </p>
                                    )}
                                </div>
                            ))}

                            <div className={styles.infoBlock}>
                                <h4>Информация о полисе</h4>
                                <p><strong>Полис:</strong> {selectedPolicy.policy_number}</p>
                                <p><strong>Автомобиль:</strong> {selectedVehicle?.brand} {selectedVehicle?.model}</p>
                            </div>

                            <div className={styles.buttons}>
                                <button type="button" onClick={handleBack} className={styles.backButton}>Назад</button>
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