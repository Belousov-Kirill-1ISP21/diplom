import { useEffect } from 'react'
import styles from './NotificationsPanel.module.css'
import { useNotifications } from '../../../shared/context/notificationsContext'

export const NotificationsPanel = () => {
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, reloadNotifications } = useNotifications()

    // Перезагружаем уведомления при монтировании компонента
    useEffect(() => {
        reloadNotifications()
    }, []) // Пустой массив - загружает при каждом открытии вкладки

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className={styles.notificationsPanel}>Загрузка...</div>;
    }

    return (
        <div className={styles.notificationsPanel}>
            <div className={styles.notificationsHeader}>
                <h1 className={styles.notificationsTitle}>Уведомления</h1>
                {unreadCount > 0 && (
                    <span className={styles.headerBadge}>{unreadCount}</span>
                )}
            </div>
            
            <div className={styles.notificationsContainer}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyMessage}>
                        <p>У вас нет уведомлений</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`${styles.notificationCard} ${notification.is_read ? styles.read : styles.unread}`}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                            <div className={styles.notificationContent}>
                                <p>{notification.message}</p>
                                <span className={styles.notificationDate}>
                                    {formatDate(notification.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {unreadCount > 0 && (
                <button onClick={markAllAsRead} className={styles.markAllButton}>
                    Пометить всё как прочитанное
                </button>
            )}
        </div>
    )
}