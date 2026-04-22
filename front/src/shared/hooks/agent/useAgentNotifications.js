import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';

export const useAgentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationData, setNotificationData] = useState({
        client_id: '',
        message: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString.split('T')[0];
    };

    const getFullName = (obj) => {
        if (!obj) return '—';
        if (obj.client_profile) {
            const parts = [obj.client_profile.last_name, obj.client_profile.first_name, obj.client_profile.middle_name].filter(p => p);
            return parts.length ? parts.join(' ') : '—';
        }
        if (obj.last_name || obj.first_name) {
            const parts = [obj.last_name, obj.first_name, obj.middle_name].filter(p => p);
            return parts.length ? parts.join(' ') : '—';
        }
        return '—';
    };

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/notifications/all');
            const sortedData = [...response.data].sort((a, b) => a.id - b.id);
            setNotifications(sortedData);
        } catch (error) {
            setError('Ошибка загрузки уведомлений');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const sendNotification = async (e) => {
        e.preventDefault();
        if (!notificationData.client_id) {
            setError('Выберите клиента');
            return;
        }
        if (!notificationData.message.trim()) {
            setError('Введите текст уведомления');
            return;
        }
        try {
            await api.post('/notifications', {
                user_id: notificationData.client_id,
                message: notificationData.message
            });
            setShowNotificationModal(false);
            setNotificationData({ client_id: '', message: '' });
            setError(null);
            await loadNotifications();
            alert('Уведомление успешно отправлено');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка отправки уведомления');
        }
    };

    const deleteNotification = async (id) => {
        if (window.confirm('Удалить уведомление?')) {
            try {
                await api.delete(`/notifications/${id}`);
                await loadNotifications();
            } catch (error) {
                setError('Ошибка удаления уведомления');
            }
        }
    };

    return {
        notifications,
        loading,
        error,
        showNotificationModal,
        setShowNotificationModal,
        notificationData,
        setNotificationData,
        formatDate,
        getFullName,
        loadNotifications,
        sendNotification,
        deleteNotification
    };
};