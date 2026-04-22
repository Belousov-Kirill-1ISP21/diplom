import styles from './CalculatorBlock.module.css';
import { useAuth } from '../../../shared/context/authContext';
import { useCalculatorForm } from '../../../shared/hooks/useCalculatorForm';
import { 
    CALCULATOR_VEHICLE_FIELDS, 
    KASKO_EXTRA_FIELDS, 
    CALCULATOR_DATE_FIELDS,
    NEW_VEHICLE_FIELDS,
    VEHICLE_CATEGORIES
} from '../../../shared/config/fields';

export const CalculatorBlock = () => {
    const { isAuthenticated, addPolicy, refreshPolicies, profileData } = useAuth();
    const form = useCalculatorForm(isAuthenticated, profileData, addPolicy, refreshPolicies);

    const renderVehicleField = (field) => {
        const value = form.getCurrentData()[field.name] || '';
        if (field.type === 'select') {
            return (
                <select name={field.name} value={value} onChange={form.handleInputChange}>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        return (
            <input type={field.type} name={field.name} value={value} onChange={form.handleInputChange} placeholder={field.placeholder} className={form.errors[field.name] ? styles.error : ''} />
        );
    };

    const renderDateField = (field) => {
        const value = form.getCurrentData()[field.name] || '';
        return (
            <input type={field.type} name={field.name} value={value} onChange={form.handleInputChange} className={form.errors[field.name] ? styles.error : ''} />
        );
    };

    return (
        <div className={styles.calculator}>
            <div className={styles.header}>
                <h1>Калькулятор страховки</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${form.policyType === 'osago' ? styles.active : ''}`} onClick={() => form.handlePolicyTypeChange('osago')}>ОСАГО</button>
                    <button className={`${styles.tab} ${form.policyType === 'kasko' ? styles.active : ''}`} onClick={() => form.handlePolicyTypeChange('kasko')}>КАСКО</button>
                </div>
            </div>

            {form.error && <div className={styles.errorMessage}>{form.error}</div>}

            <div className={styles.progress}>
                <div className={`${styles.step} ${form.step >= 1 ? styles.active : ''}`} onClick={() => form.goToStep(1)}>1. Автомобиль</div>
                <div className={`${styles.step} ${form.step >= 2 ? styles.active : ''}`} onClick={() => form.goToStep(2)}>2. Срок</div>
                <div className={`${styles.step} ${form.step >= 3 ? styles.active : ''}`} onClick={() => form.goToStep(3)}>3. Результат</div>
            </div>

            <div className={styles.content}>
                {form.step === 1 && (
                    <div className={styles.stepContent}>
                        <h2>Данные об автомобиле</h2>
                        {isAuthenticated && form.myVehicles.length > 0 ? (
                            <div className={styles.vehicleSelector}>
                                <label>Выберите ваш автомобиль из списка</label>
                                <div className={styles.vehicleList}>
                                    {form.myVehicles.map(vehicle => (
                                        <div key={vehicle.id} className={`${styles.vehicleCard} ${form.selectedVehicle?.id === vehicle.id ? styles.selected : ''}`} onClick={() => form.handleSelectVehicle(vehicle)}>
                                            <h4>{vehicle.brand} {vehicle.model}</h4>
                                            <p>Госномер: {vehicle.state_number}</p>
                                            <p>VIN: {vehicle.vin}</p>
                                            <p>Год: {vehicle.manufacture_year} | {vehicle.power_hp} л.с.</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => form.setShowVehicleModal(true)} className={styles.addVehicleButton}>+ Добавить новый автомобиль</button>
                            </div>
                        ) : (
                            <>
                                {CALCULATOR_VEHICLE_FIELDS.map(field => (
                                    <div key={field.name} className={styles.formGroup}>
                                        <label>{field.label}</label>
                                        {renderVehicleField(field)}
                                        {form.errors[field.name] && <span className={styles.errorMessage}>{form.errors[field.name]}</span>}
                                    </div>
                                ))}
                                {form.policyType === 'kasko' && KASKO_EXTRA_FIELDS.map(field => (
                                    <div key={field.name} className={styles.formGroup}>
                                        <label>{field.label}</label>
                                        {renderVehicleField(field)}
                                        {form.errors[field.name] && <span className={styles.errorMessage}>{form.errors[field.name]}</span>}
                                    </div>
                                ))}
                            </>
                        )}
                        <button onClick={form.nextStep} className={styles.nextButton}>Далее</button>
                    </div>
                )}

                {form.step === 2 && (
                    <div className={styles.stepContent}>
                        <h2>Срок страхования</h2>
                        <div className={styles.row}>
                            {CALCULATOR_DATE_FIELDS.map(field => (
                                <div key={field.name} className={styles.formGroup}>
                                    <label>{field.label}</label>
                                    {renderDateField(field)}
                                    {form.errors[field.name] && <span className={styles.errorMessage}>{form.errors[field.name]}</span>}
                                </div>
                            ))}
                        </div>
                        <div className={styles.buttons}>
                            <button onClick={form.prevStep} className={styles.prevButton}>Назад</button>
                            <button onClick={form.nextStep} disabled={form.isCalculating} className={styles.calculateButton}>{form.isCalculating ? 'Расчет...' : 'Рассчитать'}</button>
                        </div>
                    </div>
                )}

                {form.step === 3 && form.getCurrentData().calculatedPrice && (
                    <div className={styles.stepContent}>
                        <h2>Результат расчёта</h2>
                        <div className={styles.result}>
                            <div className={styles.price}>
                                <span>Стоимость полиса:</span>
                                <strong>{form.getCurrentData().calculatedPrice.toLocaleString()} ₽</strong>
                            </div>
                            <div className={styles.info}>
                                <p>В стоимость включено:</p>
                                <ul>
                                    <li>Страхование гражданской ответственности</li>
                                    {form.policyType === 'kasko' && <li>Страхование от угона и ущерба</li>}
                                </ul>
                            </div>
                            <div className={styles.resultButtons}>
                                <button onClick={form.prevStep} className={styles.prevButton}>Назад</button>
                                <button onClick={form.handleSubmitOrder} disabled={form.isCalculating} className={styles.submitButton}>{form.isCalculating ? 'Оформление...' : 'Перейти к оплате'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {form.showVehicleModal && (
                <div className={styles.modalOverlay} onClick={() => form.setShowVehicleModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Добавить автомобиль</h2>
                        <form onSubmit={form.handleAddNewVehicle}>
                            {NEW_VEHICLE_FIELDS.map(field => {
                                if (field.type === 'select') {
                                    const options = field.options || VEHICLE_CATEGORIES;
                                    return (
                                        <div key={field.name} className={styles.formGroup}>
                                            <label>{field.label}</label>
                                            <select name={field.name} value={form.newVehicleData[field.name]} onChange={(e) => form.setNewVehicleData({...form.newVehicleData, [field.name]: e.target.value})} required={field.required}>
                                                {options.map(opt => typeof opt === 'object' ? <option key={opt.value} value={opt.value}>{opt.label}</option> : <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                if (field.type === 'checkbox') {
                                    return (
                                        <div key={field.name} className={styles.checkboxGroup}>
                                            <label><input type="checkbox" name={field.name} checked={form.newVehicleData[field.name]} onChange={(e) => form.setNewVehicleData({...form.newVehicleData, [field.name]: e.target.checked})} /> {field.label}</label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={field.name} className={styles.formGroup}>
                                        <label>{field.label}</label>
                                        <input type={field.type} name={field.name} value={form.newVehicleData[field.name]} onChange={(e) => form.setNewVehicleData({...form.newVehicleData, [field.name]: e.target.value})} placeholder={field.placeholder} required={field.required} />
                                    </div>
                                );
                            })}
                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => form.setShowVehicleModal(false)}>Отмена</button>
                                <button type="submit">Добавить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};