import React, { useState, useEffect } from 'react';
import styles from './Panels.module.css';
import { useAuth } from '../../../shared/context/authContext';
import api from '../../../api/client';
import clientsIcon from '../../../assets/Panels/Profile.webp';
import policiesIcon from '../../../assets/Panels/Policies.webp';
import accidentsIcon from '../../../assets/Panels/Accident.webp';
import notificationsIcon from '../../../assets/Panels/Notification.webp';
import editIcon from '../../../assets/Panels/Settings.webp';
import deleteIcon from '../../../assets/Panels/Delete.webp';
import exitIcon from '../../../assets/Panels/Exit.webp';
import { useNavigate } from 'react-router-dom';
import { clientValidationSchema, policyDiscountSchema, policyRenewSchema } from '../../../shared/lib/validations/panelsValidations';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    return dateString.split('T')[0];
};

export const AgentPanel = () => {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState('clients');
    const [clients, setClients] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [accidents, setAccidents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [notificationData, setNotificationData] = useState({
        client_id: '',
        message: ''
    });
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        birth_date: ''
    });

    const loadClients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/clients');
            setClients(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки клиентов');
        } finally {
            setLoading(false);
        }
    };

    const loadPolicies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/policies');
            setPolicies(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки полисов');
        } finally {
            setLoading(false);
        }
    };

    const loadAccidents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/accidents');
            setAccidents(response.data.data);
        } catch (error) {
            setError('Ошибка загрузки страховых случаев');
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/agent/notifications/all');
            // Сортировка по ID по возрастанию (сначала старые)
            const sortedData = [...response.data].sort((a, b) => a.id - b.id);
            setNotifications(sortedData);
        } catch (error) {
            setError('Ошибка загрузки уведомлений');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'clients') loadClients();
        if (activeTab === 'policies') loadPolicies();
        if (activeTab === 'accidents') loadAccidents();
        if (activeTab === 'notifications') loadNotifications();
    }, [activeTab]);

    const addClient = async (e) => {
        e.preventDefault();
        
        try {
            await clientValidationSchema.validate(
                { ...formData, password: formData.password },
                { abortEarly: false }
            );
        } catch (err) {
            const errors = {};
            err.inner.forEach(error => {
                errors[error.path] = error.message;
            });
            setValidationErrors(errors);
            return;
        }
        
        try {
            await api.post('/agent/clients', formData);
            setShowModal(false);
            setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' });
            setValidationErrors({});
            loadClients();
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
            err.inner.forEach(error => {
                errors[error.path] = error.message;
            });
            setValidationErrors(errors);
            return;
        }
        
        try {
            await api.put(`/agent/clients/${selectedItem.id}`, formData);
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            setValidationErrors({});
            loadClients();
        } catch (error) {
            setError('Ошибка обновления клиента');
        }
    };

    const deleteClient = async (id) => {
        if (window.confirm('Удалить клиента?')) {
            try {
                await api.delete(`/agent/clients/${id}`);
                loadClients();
            } catch (error) {
                setError(error.response?.data?.message || 'Ошибка удаления клиента');
            }
        }
    };

    const cancelPolicy = async (id) => {
        if (window.confirm('Отменить полис?')) {
            try {
                await api.post(`/agent/policies/${id}/cancel`);
                loadPolicies();
            } catch (error) {
                setError('Ошибка отмены полиса');
            }
        }
    };

    const activatePolicy = async (id) => {
        try {
            await api.post(`/agent/policies/${id}/activate`);
            loadPolicies();
        } catch (error) {
            setError('Ошибка активации полиса');
        }
    };

    const renewPolicy = async (id) => {
        const days = prompt('На сколько дней продлить полис? (1-365)', '365');
        if (days) {
            try {
                await policyRenewSchema.validate({ days: parseInt(days) }, { abortEarly: false });
                await api.post(`/agent/policies/${id}/renew`, { days: parseInt(days) });
                loadPolicies();
            } catch (err) {
                if (err.name === 'ValidationError') {
                    setError(err.errors[0]);
                } else {
                    setError('Ошибка продления полиса');
                }
            }
        }
    };

    const updatePolicyDiscount = async (id, discount) => {
        try {
            await policyDiscountSchema.validate({ discount_amount: discount }, { abortEarly: false });
            await api.put(`/agent/policies/${id}`, { discount_amount: discount });
            await loadPolicies();
        } catch (err) {
            if (err.name === 'ValidationError') {
                setError(err.errors[0]);
            } else {
                console.error('Error:', err.response?.data);
                setError('Ошибка обновления скидки');
            }
        }
    };

    const updateAccidentStatus = async (id, status) => {
        try {
            await api.put(`/agent/accidents/${id}`, { status });
            loadAccidents();
        } catch (error) {
            setError('Ошибка обновления статуса');
        }
    };

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
            
            if (activeTab === 'notifications') {
                loadNotifications();
            }
            
            alert('Уведомление успешно отправлено');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка отправки уведомления');
        }
    };

    const deleteNotification = async (id) => {
        if (window.confirm('Удалить уведомление?')) {
            try {
                await api.delete(`/notifications/${id}`);
                loadNotifications();
            } catch (error) {
                setError('Ошибка удаления уведомления');
            }
        }
    };

    const getFullName = (obj) => {
        if (!obj) return '—';
        
        // Если это пользователь (User) — берём данные из client_profile
        if (obj.client_profile) {
            const parts = [
                obj.client_profile.last_name,
                obj.client_profile.first_name,
                obj.client_profile.middle_name
            ].filter(p => p);
            return parts.length ? parts.join(' ') : '—';
        }
        
        // Если это уже client_profile напрямую
        if (obj.last_name || obj.first_name) {
            const parts = [obj.last_name, obj.first_name, obj.middle_name].filter(p => p);
            return parts.length ? parts.join(' ') : '—';
        }
        
        return '—';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'draft': 'Черновик', 'active': 'Активен', 'expired': 'Просрочен', 'cancelled': 'Отменён',
            'pending': 'На рассмотрении', 'approved': 'Одобрено', 'paid': 'Выплачено', 'rejected': 'Отклонено'
        };
        return statusMap[status] || status;
    };

    const filteredClients = clients.filter(client => 
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.client_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPolicies = policies.filter(policy => !statusFilter || policy.status === statusFilter);

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

    return (
        <div className={styles.adminPanel}>
            <div className={styles.sidebar}>
                <div className={styles.logo}><h2>Панель агента</h2></div>
                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${activeTab === 'clients' ? styles.active : ''}`} onClick={() => setActiveTab('clients')}>
                        <img src={clientsIcon} alt="Клиенты" className={styles.navIcon} /> Клиенты
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'policies' ? styles.active : ''}`} onClick={() => setActiveTab('policies')}>
                        <img src={policiesIcon} alt="Полисы" className={styles.navIcon} /> Полисы
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'accidents' ? styles.active : ''}`} onClick={() => setActiveTab('accidents')}>
                        <img src={accidentsIcon} alt="Страховые случаи" className={styles.navIcon} /> Страховые случаи
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}>
                        <img src={notificationsIcon} alt="Уведомления" className={styles.navIcon} /> Уведомления
                    </button>
                    <button className={styles.navItem} onClick={() => { logout(); navigate('/'); }}>
                        <img src={exitIcon} alt="Выход" className={styles.navIcon} /> Выход
                    </button>
                </nav>
            </div>

            <div className={styles.main}>
            <div className={styles.header}>
                <h1>
                    {activeTab === 'clients' && 'Клиенты'}
                    {activeTab === 'policies' && 'Полисы'}
                    {activeTab === 'accidents' && 'Страховые случаи'}
                    {activeTab === 'notifications' && 'Уведомления'}
                </h1>
                {activeTab === 'notifications' && (
                    <button className={styles.headerButton} onClick={() => setShowNotificationModal(true)}>
                        + Отправить уведомление
                    </button>
                )}
            </div>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.content}>
                    {/* КЛИЕНТЫ */}
                    {activeTab === 'clients' && (
                        <div>
                            <div className={styles.searchBar}>
                                <input type="text" placeholder="Поиск по email, телефону, ФИО..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
                                <button className={styles.addButton} onClick={() => { setSelectedItem(null); setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' }); setValidationErrors({}); setShowModal(true); }}>+ Добавить клиента</button>
                            </div>
                            {loading ? <div className={styles.loading}>Загрузка...</div> : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Email</th><th>Телефон</th><th>ФИО</th><th>Дата рождения</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClients.map(client => (
                                            <React.Fragment key={client.id}>
                                                <tr onClick={() => setExpandedRow(expandedRow === client.id ? null : client.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{client.id}</td>
                                                    <td>{client.email}</td>
                                                    <td>{client.phone}</td>
                                                    <td>{getFullName(client)}</td>
                                                    <td>{formatDate(client.client_profile?.birth_date)}</td>
                                                    <td>
                                                        <button className={styles.editButton} onClick={(e) => { e.stopPropagation(); handleEditClient(client); }}><img src={editIcon} alt="Редактировать" className={styles.actionIcon} /></button>
                                                        <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}><img src={deleteIcon} alt="Удалить" className={styles.actionIcon} /></button>
                                                    </td>
                                                </tr>
                                                {expandedRow === client.id && client.client_profile && (
                                                    <tr className={styles.expandedRow}>
                                                        <td colSpan="6">
                                                            <div className={styles.expandedContent}>
                                                                <h4>Дополнительная информация</h4>
                                                                <div className={styles.expandedGrid}>
                                                                    <div><strong>Паспорт:</strong> {client.client_profile.passport_series || ''} {client.client_profile.passport_number || '—'}</div>
                                                                    <div><strong>ВУ:</strong> {client.client_profile.driver_license_series || ''} {client.client_profile.driver_license_number || '—'}</div>
                                                                    <div><strong>Категории прав:</strong> {client.client_profile.driver_categories?.map(cat => cat.code).join(', ') || '—'}</div>
                                                                    <div><strong>Стаж:</strong> {client.client_profile.driver_experience_years || 0} лет</div>
                                                                    <div><strong>Бонус-малус:</strong> {client.client_profile.bonus_malus_class || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ПОЛИСЫ */}
                    {activeTab === 'policies' && (
                        <div>
                            <div className={styles.filterBar}>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                                    <option value="">Все статусы</option>
                                    <option value="draft">Черновик</option>
                                    <option value="active">Активен</option>
                                    <option value="expired">Просрочен</option>
                                    <option value="cancelled">Отменён</option>
                                </select>
                            </div>
                            {loading ? <div className={styles.loading}>Загрузка...</div> : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>№ полиса</th><th>Клиент</th><th>Автомобиль</th><th>Тип</th><th>Сумма</th><th>Скидка (%)</th><th>Действует до</th><th>Статус</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPolicies.map(policy => {
                                            const discountValue = policy.discount_amount ? Math.round(parseFloat(policy.discount_amount)) : 0;
                                            return (
                                                <tr key={policy.id}>
                                                    <td>{policy.policy_number}</td>
                                                    <td>{policy.client?.last_name} {policy.client?.first_name}</td>
                                                    <td>{policy.vehicle?.brand} {policy.vehicle?.model}</td>
                                                    <td>{policy.policy_type?.name}</td>
                                                    <td>{policy.final_price?.toLocaleString()} ₽</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={discountValue}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/[^0-9]/g, '');
                                                                if (val === '') val = '0';
                                                                let num = parseInt(val);
                                                                if (num > 100) num = 100;
                                                                updatePolicyDiscount(policy.id, num);
                                                            }}
                                                            className={styles.discountInput}
                                                        />
                                                    </td>
                                                    <td>{formatDate(policy.end_date)}</td>
                                                    <td><span className={`${styles.status} ${styles[policy.status]}`}>{getStatusText(policy.status)}</span></td>
                                                    <td>
                                                        {policy.status === 'draft' && (<button className={styles.editButton} onClick={() => activatePolicy(policy.id)}>Активировать</button>)}
                                                        {policy.status === 'active' && (<><button className={styles.editButton} onClick={() => renewPolicy(policy.id)}>Продлить</button><button className={styles.deleteButton} onClick={() => cancelPolicy(policy.id)}>Отменить</button></>)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* СТРАХОВЫЕ СЛУЧАИ */}
                    {activeTab === 'accidents' && (
                        <div>
                            {loading ? <div className={styles.loading}>Загрузка...</div> : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Клиент</th><th>Полис</th><th>Дата</th><th>Ущерб</th><th>Статус</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accidents.map(accident => (
                                            <tr key={accident.id}>
                                                <td>{accident.id}</td>
                                                <td>{accident.client?.last_name} {accident.client?.first_name}</td>
                                                <td>{accident.policy?.policy_number}</td>
                                                <td>{formatDate(accident.accident_date)}</td>
                                                <td>{accident.damage_amount?.toLocaleString()} ₽</td>
                                                <td>
                                                    <select value={accident.status || 'pending'} onChange={(e) => updateAccidentStatus(accident.id, e.target.value)} className={styles.statusSelect}>
                                                        <option value="pending">На рассмотрении</option>
                                                        <option value="approved">Одобрено</option>
                                                        <option value="paid">Выплачено</option>
                                                        <option value="rejected">Отклонено</option>
                                                    </select>
                                                </td>
                                                <td><button className={styles.viewButton} onClick={() => { setSelectedItem(accident); setShowModal(true); }}>Просмотр</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* УВЕДОМЛЕНИЯ */}
                    {activeTab === 'notifications' && (
                        <div>
                            {loading ? <div className={styles.loading}>Загрузка...</div> : notifications.length === 0 ? (
                                <div className={styles.emptyMessage}>
                                    <p>Нет отправленных уведомлений</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Клиент</th><th>Сообщение</th><th>Дата отправки</th><th>Статус</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map(notification => (
                                            <tr key={notification.id}>
                                                <td>{notification.id}</td>
                                                <td>{getFullName(notification.user)}</td>
                                                <td>{notification.message}</td>
                                                <td>{formatDate(notification.created_at)}</td>
                                                <td>
                                                    <span className={`${styles.status} ${styles[notification.is_read ? 'read' : 'unread']}`}>
                                                        {notification.is_read ? 'Прочитано' : 'Не прочитано'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className={styles.deleteButton} onClick={() => deleteNotification(notification.id)}>
                                                        <img src={deleteIcon} alt="Удалить" className={styles.actionIcon} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно для клиента */}
            {showModal && activeTab === 'clients' && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedItem ? 'Редактировать клиента' : 'Новый клиент'}</h2>
                        <form onSubmit={selectedItem ? updateClient : addClient}>
                            <div className={styles.formGroup}>
                                <label>Email *</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={validationErrors.email ? styles.errorInput : ''} />
                                {validationErrors.email && <span className={styles.fieldError}>{validationErrors.email}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Телефон *</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={validationErrors.phone ? styles.errorInput : ''} />
                                {validationErrors.phone && <span className={styles.fieldError}>{validationErrors.phone}</span>}
                            </div>
                            {!selectedItem && (
                                <div className={styles.formGroup}>
                                    <label>Пароль *</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={validationErrors.password ? styles.errorInput : ''} />
                                    {validationErrors.password && <span className={styles.fieldError}>{validationErrors.password}</span>}
                                </div>
                            )}
                            <div className={styles.formGroup}>
                                <label>Фамилия</label>
                                <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className={validationErrors.last_name ? styles.errorInput : ''} />
                                {validationErrors.last_name && <span className={styles.fieldError}>{validationErrors.last_name}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Имя</label>
                                <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className={validationErrors.first_name ? styles.errorInput : ''} />
                                {validationErrors.first_name && <span className={styles.fieldError}>{validationErrors.first_name}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Отчество</label>
                                <input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} className={validationErrors.middle_name ? styles.errorInput : ''} />
                                {validationErrors.middle_name && <span className={styles.fieldError}>{validationErrors.middle_name}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Дата рождения</label>
                                <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className={validationErrors.birth_date ? styles.errorInput : ''} />
                                {validationErrors.birth_date && <span className={styles.fieldError}>{validationErrors.birth_date}</span>}
                            </div>
                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => setShowModal(false)}>Отмена</button>
                                <button type="submit">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно для страхового случая */}
            {showModal && activeTab === 'accidents' && selectedItem && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Детали страхового случая</h2>
                        <div className={styles.details}>
                            <p><strong>Клиент:</strong> {selectedItem.client?.last_name} {selectedItem.client?.first_name}</p>
                            <p><strong>Полис:</strong> {selectedItem.policy?.policy_number}</p>
                            <p><strong>Дата происшествия:</strong> {formatDate(selectedItem.accident_date)}</p>
                            <p><strong>Сумма ущерба:</strong> {selectedItem.damage_amount?.toLocaleString()} ₽</p>
                            <p><strong>Статус:</strong> {getStatusText(selectedItem.status)}</p>
                            <p><strong>Описание:</strong> {selectedItem.description || '—'}</p>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={() => setShowModal(false)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для отправки уведомления */}
            {showNotificationModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNotificationModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Отправить уведомление</h2>
                        <form onSubmit={sendNotification}>
                            <div className={styles.formGroup}>
                                <label>Клиент *</label>
                                <select
                                    value={notificationData.client_id}
                                    onChange={(e) => setNotificationData({...notificationData, client_id: e.target.value})}
                                    required
                                >
                                    <option value="">Выберите клиента</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {getFullName(client)} ({client.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label>Сообщение *</label>
                                <textarea
                                    value={notificationData.message}
                                    onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                                    rows="5"
                                    placeholder="Введите текст уведомления..."
                                    required
                                />
                            </div>
                            
                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => setShowNotificationModal(false)}>Отмена</button>
                                <button type="submit">Отправить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};