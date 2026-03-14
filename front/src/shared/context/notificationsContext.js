import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationsContext = createContext();

// Начальные уведомления (вынесены, чтобы использовать в обоих местах)
export const initialNotifications = [
    {
        id: 1,
        text: 'Срок действия полиса под номером 4444 скоро закончится! Не забудьте продлить полис.',
        read: false
    },
    {
        id: 2,
        text: 'Срок действия полиса под номером 5555 скоро закончится! Не забудьте продлить полис.',
        read: false
    },
    {
        id: 3,
        text: 'Срок действия полиса под номером 6666 скоро закончится! Не забудьте продлить полис.',
        read: true
    }
];

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(initialNotifications);
    
    const unreadCount = notifications.filter(n => !n.read).length;

    const updateUnreadCount = (count) => {
        // Этот метод теперь будет обновлять состояние уведомлений
        if (count === 0) {
            const updated = notifications.map(n => ({...n, read: true}));
            setNotifications(updated);
        }
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({...n, read: true}));
        setNotifications(updated);
    };

    return (
        <NotificationsContext.Provider value={{ 
            unreadCount, 
            updateUnreadCount,
            notifications,
            setNotifications,
            markAllAsRead
        }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};