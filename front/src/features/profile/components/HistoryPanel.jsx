import styles from './HistoryPanel.module.css'

const PoliciesData = [
    {
        id: 1,
        policyNumber: '4444',
        car: '5-2-toyota',
        startDate: '04.04.2004',
        endDate: '08.04.2004',
        price: '4444 руб',
        status: 'Активный',
        type: 'ОСАГО'
    },
    {
        id: 2,
        policyNumber: '5555',
        car: '6-3-honda',
        startDate: '05.05.2005',
        endDate: '09.05.2005',
        price: '5555 руб',
        status: 'Завершен',
        type: 'КАСКО'
    },
    {
        id: 3,
        policyNumber: '6666',
        car: '7-4-bmw',
        startDate: '06.06.2006',
        endDate: '10.06.2006',
        price: '6666 руб',
        status: 'Активный',
        type: 'ОСАГО'
    }
]

export const HistoryPanel = () => {
    return (
        <div className={styles.historyPanel}>
            <div className={styles.historyHeader}>
                <h1 className={styles.historyTitle}>История полисов</h1>
            </div>
            <div className={styles.historyContainer}>
                {PoliciesData.map(policy => (
                    <div key={policy.id} className={styles.policyCard}>
                        <div className={styles.policyHeader}>
                            <span className={styles.policyNumber}>Полис №{policy.policyNumber}</span>
                            <span className={`${styles.policyStatus} ${styles[policy.status.toLowerCase()]}`}>
                                {policy.status}
                            </span>
                        </div>
                        <div className={styles.policyInfo}>
                            <p><strong>Авто:</strong> {policy.car}</p>
                            <p><strong>Дата начала:</strong> {policy.startDate}</p>
                            <p><strong>Дата окончания:</strong> {policy.endDate}</p>
                            <p><strong>Стоимость:</strong> {policy.price}</p>
                            <p><strong>Тип:</strong> {policy.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}