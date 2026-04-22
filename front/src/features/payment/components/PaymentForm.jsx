import styles from './PaymentForm.module.css';
import { PAYMENT_FIELDS } from '../../../shared/config/fields';
import { usePaymentForm } from '../../../shared/hooks/usePaymentForm';

export const PaymentForm = ({ policy }) => {
    const {
        loading,
        error,
        success,
        formData,
        handleInputChange,
        handleSubmit,
        handleCancel,
        formatPrice
    } = usePaymentForm(policy);

    const renderField = (field) => (
        <input 
            type={field.type} 
            name={field.name} 
            value={formData[field.name]} 
            onChange={(e) => handleInputChange(e, field)} 
            placeholder={field.placeholder} 
            maxLength={field.maxLength} 
            required 
        />
    );

    return (
        <div className={styles.paymentForm}>
            <div className={styles.container}>
                <h1 className={styles.title}>Оплата страхового полиса</h1>
                {!success ? (
                    <div className={styles.content}>
                        <div className={styles.policyInfo}>
                            <h2>Информация о полисе</h2>
                            <div className={styles.infoRow}>
                                <span>Номер полиса:</span>
                                <strong>{policy.policy_number}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Тип полиса:</span>
                                <strong>{policy.policy_type?.name}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Автомобиль:</span>
                                <strong>{policy.vehicle?.brand} {policy.vehicle?.model}</strong>
                            </div>
                            <div className={styles.infoRow}>
                                <span>Срок действия:</span>
                                <strong>{policy.start_date?.split('T')[0]} — {policy.end_date?.split('T')[0]}</strong>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Сумма к оплате:</span>
                                <strong>{formatPrice(policy.final_price)} ₽</strong>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <h2>Данные карты</h2>
                            {PAYMENT_FIELDS.map(field => (
                                <div key={field.name} className={styles.formGroup}>
                                    <label>{field.label}</label>
                                    {renderField(field)}
                                </div>
                            ))}
                            {error && <div className={styles.error}>{error}</div>}
                            <div className={styles.buttons}>
                                <button 
                                    type="button" 
                                    className={styles.cancelButton} 
                                    onClick={handleCancel}
                                >
                                    Отмена
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.payButton} 
                                    disabled={loading}
                                >
                                    {loading ? 'Обработка...' : `Оплатить ${formatPrice(policy.final_price)} ₽`}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className={styles.successBlock}>
                        <div className={styles.successIcon}>✓</div>
                        <h2>Оплата прошла успешно!</h2>
                        <p>Ваш полис активирован. Перенаправление...</p>
                    </div>
                )}
            </div>
        </div>
    );
};