import { useEffect } from 'react'
import styles from './NotificationsPanel.module.css'
import { useNotifications } from '../../../shared/context/notificationsContext'

export const NotificationsPanel = () => {
    const { notifications, setNotifications, unreadCount, markAllAsRead } = useNotifications()

    return (
        <div className={styles.notificationsPanel}>
            <div className={styles.notificationsHeader}>
                <h1 className={styles.notificationsTitle}>Уведомления</h1>
                {unreadCount > 0 && (
                    <span className={styles.headerBadge}>{unreadCount}</span>
                )}
            </div>
            
            <div className={styles.notificationsContainer}>
                {notifications.map(notification => (
                    <div key={notification.id} className={`${styles.notificationCard} ${notification.read ? styles.read : styles.unread}`}>
                        <p>{notification.text}</p>
                    </div>
                ))}
            </div>
            
            {unreadCount > 0 && (
                <button onClick={markAllAsRead} className={styles.markAllButton}>
                    Пометить всё как прочитанное
                </button>
            )}
        </div>
    )
}