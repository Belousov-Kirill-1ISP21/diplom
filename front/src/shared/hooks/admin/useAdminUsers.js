import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { userTypeSchema } from '../../../shared/lib/validations/panelsValidations';

export const useAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return dateString.split('T')[0];
    };

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data || []);
        } catch (error) {
            setError('Ошибка загрузки пользователей: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const changeUserType = async (userId, newType) => {
        try {
            await userTypeSchema.validate({ user_type: newType }, { abortEarly: false });
            await api.put(`/admin/users/${userId}`, { user_type: newType });
            await loadUsers();
        } catch (err) {
            if (err.name === 'ValidationError') {
                setError(err.errors[0]);
            } else {
                setError('Ошибка смены типа пользователя');
            }
        }
    };

    const getFullName = (user) => {
        const profile = user.client_profile;
        if (!profile) return '—';
        const parts = [profile.last_name, profile.first_name, profile.middle_name].filter(p => p);
        return parts.length ? parts.join(' ') : '—';
    };

    const getUserTypeName = (user) => {
        const type = user.user_type?.name;
        if (type === 'admin') return 'Админ';
        if (type === 'agent') return 'Агент';
        if (type === 'client') return 'Клиент';
        return '—';
    };

    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.client_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.client_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        users,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        loadUsers,
        changeUserType,
        getFullName,
        getUserTypeName,
        filteredUsers,
        formatDate
    };
};