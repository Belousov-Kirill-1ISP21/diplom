import { useState } from 'react';
import styles from './PaymentForm.module.css';
import { useNavigate } from 'react-router-dom';
import { payPolicy } from '../../../api/policies';

export const PaymentForm = ({ policy }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
        }
        if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
        }
        if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }
        
        setFormData({ ...formData, [name]: formattedValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        setTimeout(async () => {
            try {
                if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
                    throw new Error('Неверный номер карты');
                }
                if (formData.cvv.length !== 3) {
                    throw new Error('Неверный CVV код');
                }
                
                await payPolicy(policy.id);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/profile?tab=policies');
                }, 2000);
            } catch (error) {
                setError(error.response?.data?.message || 'Ошибка при оплате');
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    const formatPrice = (price) => {
        return price?.toLocaleString() || '0';
    };

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
                                <strong>{policy.start_date} — {policy.end_date}</strong>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Сумма к оплате:</span>
                                <strong>{formatPrice(policy.final_price)} ₽</strong>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h2>Данные карты</h2>
                            
                            <div className={styles.formGroup}>
                                <label>Номер карты</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Владелец карты</label>
                                <input
                                    type="text"
                                    name="cardHolder"
                                    value={formData.cardHolder}
                                    onChange={handleInputChange}
                                    placeholder="IVAN IVANOV"
                                    required
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Срок действия</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        maxLength="3"
                                        required
                                    />
                                </div>
                            </div>

                            {error && <div className={styles.error}>{error}</div>}

                            <div className={styles.buttons}>
                                <button 
                                    type="button" 
                                    className={styles.cancelButton}
                                    onClick={() => navigate('/profile')}
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
                        <p>Ваш полис активирован. Перенаправление в личный кабинет...</p>
                    </div>
                )}
            </div>
        </div>
    );
};