import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/client';
import { clientValidationSchema } from '../../../shared/lib/validations/panelsValidations';

export const useAgentClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        birth_date: ''
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

    const loadClients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/clients');
            setClients(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки клиентов');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const addClient = async (e) => {
        e.preventDefault();
        try {
            await clientValidationSchema.validate({ ...formData, password: formData.password }, { abortEarly: false });
        } catch (err) {
            const errors = {};
            err.inner.forEach(error => { errors[error.path] = error.message; });
            setValidationErrors(errors);
            return;
        }
        try {
            await api.post('/agent/clients', formData);
            setShowModal(false);
            setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' });
            setValidationErrors({});
            await loadClients();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка добавления клиента');
        }
    };

    const updateClient = async (e) => {
        e.preventDefault();
        try {
            await clientValidationSchema.omit(['password']).validate(formData, { abortEarly: false });
        } catch (err) {
            const errors = {};
            err.inner.forEach(error => { errors[error.path] = error.message; });
            setValidationErrors(errors);
            return;
        }
        try {
            await api.put(`/agent/clients/${selectedItem.id}`, formData);
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            setValidationErrors({});
            await loadClients();
        } catch (error) {
            setError('Ошибка обновления клиента');
        }
    };

    const deleteClient = async (id) => {
        if (window.confirm('Удалить клиента?')) {
            try {
                await api.delete(`/agent/clients/${id}`);
                await loadClients();
            } catch (error) {
                setError(error.response?.data?.message || 'Ошибка удаления клиента');
            }
        }
    };

    const handleEditClient = (client) => {
        setSelectedItem(client);
        setFormData({
            email: client.email,
            phone: client.phone,
            last_name: client.client_profile?.last_name || '',
            first_name: client.client_profile?.first_name || '',
            middle_name: client.client_profile?.middle_name || '',
            birth_date: client.client_profile?.birth_date?.split('T')[0] || client.client_profile?.birth_date || ''
        });
        setValidationErrors({});
        setShowModal(true);
    };

    const filteredClients = clients.filter(client => 
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.client_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        clients,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        showModal,
        setShowModal,
        selectedItem,
        validationErrors,
        formData,
        setFormData,
        formatDate,
        getFullName,
        loadClients,
        addClient,
        updateClient,
        deleteClient,
        handleEditClient,
        filteredClients
    };
};