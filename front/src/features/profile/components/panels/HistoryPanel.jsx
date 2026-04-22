import styles from './HistoryPanel.module.css'
import { useAuth } from '../../../../shared/context/authContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export const HistoryPanel = () => {
    const { userPolicies, refreshPolicies } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPolicies = async () => {
            await refreshPolicies();
            setLoading(false);
        };
        loadPolicies();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const getStatusText = (status) => {
        const statusMap = {
            'draft': 'Черновик',
            'active': 'Активен',
            'expired': 'Просрочен',
            'cancelled': 'Отменён'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return <div className={styles.historyPanel}>Загрузка...</div>;
    }

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
                                <span className={styles.policyNumber}>Полис №{policy.policy_number}</span>
                                <span className={`${styles.policyStatus} ${styles[policy.status]}`}>
                                    {getStatusText(policy.status)}
                                </span>
                            </div>
                            <div className={styles.policyInfo}>
                                <p><strong>Авто:</strong> {policy.vehicle?.brand} {policy.vehicle?.model} ({policy.vehicle?.state_number})</p>
                                <p><strong>Дата начала:</strong> {formatDate(policy.start_date)}</p>
                                <p><strong>Дата окончания:</strong> {formatDate(policy.end_date)}</p>
                                <p><strong>Стоимость:</strong> {policy.final_price?.toLocaleString()} ₽</p>
                                <p><strong>Тип:</strong> {policy.policy_type?.name || (policy.policy_type_id === 1 ? 'ОСАГО' : 'КАСКО')}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
};