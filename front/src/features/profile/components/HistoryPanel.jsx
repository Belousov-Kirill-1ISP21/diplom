import styles from './HistoryPanel.module.css'
import { useAuth } from '../../../shared/context/authContext'
import { useNavigate } from 'react-router-dom'

export const HistoryPanel = () => {
    const { userPolicies } = useAuth();
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    return (
        <div className={styles.historyPanel}>
            <div className={styles.historyHeader}>
                <h1 className={styles.historyTitle}>История полисов</h1>
            </div>
            <div className={styles.historyContainer}>
                {userPolicies.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас пока нет оформленных полисов</p>
                        <button 
                            onClick={() => navigate('/Calculator')} 
                            className={styles.goToCalculatorButton}
                        >
                            Перейти в калькулятор
                        </button>
                    </div>
                ) : (
                    userPolicies.map(policy => (
                        <div key={policy.id} className={styles.policyCard}>
                            <div className={styles.policyHeader}>
                                <span className={styles.policyNumber}>Полис №{policy.policyNumber}</span>
                                <span className={`${styles.policyStatus} ${styles[policy.status.toLowerCase()]}`}>
                                    {policy.status}
                                </span>
                            </div>
                            <div className={styles.policyInfo}>
                                <p><strong>Авто:</strong> {policy.brand} {policy.model} ({policy.stateNumber})</p>
                                <p><strong>Дата начала:</strong> {formatDate(policy.startDate)}</p>
                                <p><strong>Дата окончания:</strong> {formatDate(policy.endDate)}</p>
                                <p><strong>Стоимость:</strong> {policy.calculatedPrice?.toLocaleString()} ₽</p>
                                <p><strong>Тип:</strong> {policy.type}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}