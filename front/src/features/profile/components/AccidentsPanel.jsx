import { useState, useEffect } from 'react';
import styles from './AccidentsPanel.module.css';
import api from '../../../api/client';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return dateString.split('T')[0];
};

export const AccidentsPanel = () => {
    const navigate = useNavigate();
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccident, setSelectedAccident] = useState(null);

    const loadAccidents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/client/accidents');
            setAccidents(response.data);
        } catch (error) {
            setError('Ошибка загрузки страховых случаев');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccidents();
    }, []);

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'На рассмотрении',
            'approved': 'Одобрено',
            'rejected': 'Отклонено',
            'paid': 'Выплачено'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'pending': styles.statusPending,
            'approved': styles.statusApproved,
            'rejected': styles.statusRejected,
            'paid': styles.statusPaid
        };
        return classMap[status] || styles.statusDefault;
    };

    if (loading) {
        return <div className={styles.accidentsPanel}>Загрузка...</div>;
    }

    return (
        <div className={styles.accidentsPanel}>
            <div className={styles.header}>
                <h1 className={styles.title}>Страховые случаи</h1>
                <button className={styles.reportButton} onClick={() => navigate('/Accident')}>
                    + Заявить о страховом случае
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.accidentsContainer}>
                {accidents.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас нет зарегистрированных страховых случаев</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата ДТП</th>
                                <th>Полис</th>
                                <th>Сумма ущерба</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accidents.map((accident, index) => (
                                <tr key={accident.id}>
                                    <td>{index + 1}</td>
                                    <td>{formatDate(accident.accident_date)}</td>
                                    <td>{accident.policy?.policy_number || '—'}</td>
                                    <td>{accident.damage_amount?.toLocaleString()} ₽</td>
                                    <td>
                                        <span className={`${styles.status} ${getStatusClass(accident.status)}`}>
                                            {getStatusText(accident.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className={styles.viewButton}
                                            onClick={() => setSelectedAccident(accident)}
                                        >
                                            Подробнее
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Модальное окно с деталями */}
            {selectedAccident && (
                <div className={styles.modalOverlay} onClick={() => setSelectedAccident(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Детали страхового случая</h2>
                        <div className={styles.details}>
                            <div className={styles.detailRow}>
                                <strong>Полис:</strong> {selectedAccident.policy?.policy_number || '—'}
                            </div>
                            <div className={styles.detailRow}>
                                <strong>Дата ДТП:</strong> {formatDate(selectedAccident.accident_date)}
                            </div>
                            <div className={styles.detailRow}>
                                <strong>Сумма ущерба:</strong> {selectedAccident.damage_amount?.toLocaleString()} ₽
                            </div>
                            <div className={styles.detailRow}>
                                <strong>Статус:</strong>{' '}
                                <span className={`${styles.status} ${getStatusClass(selectedAccident.status)}`}>
                                    {getStatusText(selectedAccident.status)}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <strong>Описание:</strong> {selectedAccident.description || '—'}
                            </div>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={() => setSelectedAccident(null)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};