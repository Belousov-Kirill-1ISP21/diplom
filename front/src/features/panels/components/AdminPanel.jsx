import React, { useState, useEffect } from 'react';
import styles from './Panels.module.css';
import { useAuth } from '../../../shared/context/authContext';
import api from '../../../api/client';
import usersIcon from '../../../assets/Panels/Profile.webp';
import tariffsIcon from '../../../assets/Panels/Tarif.webp';
import policiesIcon from '../../../assets/Panels/Policies.webp';
import accidentsIcon from '../../../assets/Panels/Accident.webp';
import editIcon from '../../../assets/Panels/Settings.webp';
import deleteIcon from '../../../assets/Panels/Delete.webp';
import exitIcon from '../../../assets/Panels/Exit.webp';
import { useNavigate } from 'react-router-dom';

export const AdminPanel = () => {
    const { userData, isAuthenticated, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [tariffs, setTariffs] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Загрузка пользователей с их профилями
    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            console.log('Users loaded:', response.data);
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Ошибка загрузки пользователей: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка тарифов
    const loadTariffs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/tariffs');
            console.log('Tariffs loaded:', response.data);
            setTariffs(response.data.data || []);
        } catch (error) {
            console.error('Error loading tariffs:', error);
            setError('Ошибка загрузки тарифов: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка полисов
    const loadPolicies = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/policies');
            console.log('Policies loaded:', response.data);
            setPolicies(response.data.data || []);
        } catch (error) {
            console.error('Error loading policies:', error);
            setError('Ошибка загрузки полисов: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка страховых случаев
    const loadAccidents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/accidents');
            console.log('Accidents loaded:', response.data);
            setAccidents(response.data.data || []);
        } catch (error) {
            console.error('Error loading accidents:', error);
            setError('Ошибка загрузки страховых случаев: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'tariffs') loadTariffs();
        if (activeTab === 'policies') loadPolicies();
        if (activeTab === 'accidents') loadAccidents();
    }, [activeTab]);

    // Смена типа пользователя
    const changeUserType = async (userId, newType) => {
        try {
            await api.put(`/admin/users/${userId}`, { user_type: newType });
            loadUsers();
        } catch (error) {
            setError('Ошибка смены типа пользователя');
        }
    };

    // Удаление тарифа
    const deleteTariff = async (id) => {
        if (window.confirm('Удалить тариф?')) {
            try {
                await api.delete(`/admin/tariffs/${id}`);
                loadTariffs();
            } catch (error) {
                setError('Ошибка удаления тарифа');
            }
        }
    };

    // Сохранение тарифа
    const saveTariff = async (e) => {
        e.preventDefault();
        try {
            if (selectedItem) {
                await api.put(`/admin/tariffs/${selectedItem.id}`, formData);
            } else {
                await api.post('/admin/tariffs', formData);
            }
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            loadTariffs();
        } catch (error) {
            setError('Ошибка сохранения тарифа');
        }
    };

    // Отмена полиса
    const cancelPolicy = async (id) => {
        if (window.confirm('Отменить полис?')) {
            try {
                await api.post(`/admin/policies/${id}/cancel`);
                loadPolicies();
            } catch (error) {
                setError('Ошибка отмены полиса');
            }
        }
    };

    const updateAccidentFault = async (id, isClientFault) => {
        try {
            await api.put(`/admin/accidents/${id}`, { is_client_fault: isClientFault });
            loadAccidents();
        } catch (error) {
            setError('Ошибка обновления вины клиента');
        }
    };

    // Обновление статуса страхового случая
    const updateAccidentStatus = async (id, status) => {
        try {
            await api.put(`/admin/accidents/${id}`, { status });
            loadAccidents();
        } catch (error) {
            setError('Ошибка обновления статуса');
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'draft': 'Черновик',
            'active': 'Активен',
            'expired': 'Просрочен',
            'cancelled': 'Отменён',
            'pending': 'На рассмотрении',
            'approved': 'Одобрено',
            'rejected': 'Отклонено',
            'paid': 'Выплачено'
        };
        return statusMap[status] || status;
    };

    // Получение полного ФИО из client_profile
    const getFullName = (user) => {
        const profile = user.client_profile;
        if (!profile) return '—';
        const parts = [profile.last_name, profile.first_name, profile.middle_name].filter(p => p);
        return parts.length ? parts.join(' ') : '—';
    };

    // Получение типа пользователя на русском
    const getUserTypeName = (user) => {
        const type = user.user_type?.name;
        if (type === 'admin') return 'Админ';
        if (type === 'agent') return 'Агент';
        if (type === 'client') return 'Клиент';
        return '—';
    };

    // Фильтрация
    const filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.client_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.client_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPolicies = policies.filter(policy => 
        !statusFilter || policy.status === statusFilter
    );

    // Если еще идет проверка авторизации, показываем загрузку
    if (authLoading) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    // Если не авторизован или не админ
    if (!isAuthenticated) {
        window.location.href = '/SignIn';
        return null;
    }

    if (userData?.user_type?.name !== 'admin') {
        window.location.href = '/';
        return null;
    }

    return (
        <div className={styles.adminPanel}>
            <div className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>Админ-панель</h2>
                </div>
                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}>
                        <img src={usersIcon} alt="Пользователи" className={styles.navIcon} />
                        Пользователи
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'tariffs' ? styles.active : ''}`} onClick={() => setActiveTab('tariffs')}>
                        <img src={tariffsIcon} alt="Тарифы" className={styles.navIcon} />
                        Тарифы
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'policies' ? styles.active : ''}`} onClick={() => setActiveTab('policies')}>
                        <img src={policiesIcon} alt="Полисы" className={styles.navIcon} />
                        Полисы
                    </button>
                    <button className={`${styles.navItem} ${activeTab === 'accidents' ? styles.active : ''}`} onClick={() => setActiveTab('accidents')}>
                        <img src={accidentsIcon} alt="Страховые случаи" className={styles.navIcon} />
                        Страховые случаи
                    </button>
                    <button 
                        className={styles.navItem}
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                    >
                        <img src={exitIcon} alt="Выход" className={styles.navIcon} />
                        Выход
                    </button>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>
                        {activeTab === 'users' && 'Пользователи'}
                        {activeTab === 'tariffs' && 'Тарифы'}
                        {activeTab === 'policies' && 'Полисы'}
                        {activeTab === 'accidents' && 'Страховые случаи'}
                    </h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.content}>
                    {/* ==================== ПОЛЬЗОВАТЕЛИ ==================== */}
                    {activeTab === 'users' && (
                        <div>
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Поиск по email, телефону, ФИО..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            {loading ? (
                                <div className={styles.loading}>Загрузка...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Телефон</th>
                                            <th>ФИО</th>
                                            <th>Тип</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <React.Fragment key={user.id}>
                                                <tr onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{user.id}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.phone}</td>
                                                    <td>{getFullName(user)}</td>
                                                    <td>{getUserTypeName(user)}</td>
                                                    <td>
                                                        <select
                                                            value={user.user_type?.name || 'client'}
                                                            onChange={(e) => changeUserType(user.id, e.target.value)}
                                                            className={styles.select}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <option value="client">Клиент</option>
                                                            <option value="agent">Агент</option>
                                                            <option value="admin">Админ</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                {expandedRow === user.id && (
                                                    <tr className={styles.expandedRow}>
                                                        <td colSpan="6">
                                                            <div className={styles.expandedContent}>
                                                                <h4>Дополнительная информация</h4>
                                                                <div className={styles.expandedGrid}>
                                                                    <div><strong>Дата рождения:</strong> {user.client_profile?.birth_date || '—'}</div>
                                                                    <div><strong>Паспорт:</strong> {user.client_profile?.passport_series || ''} {user.client_profile?.passport_number || '—'}</div>
                                                                    <div><strong>ВУ:</strong> {user.client_profile?.driver_license_series || ''} {user.client_profile?.driver_license_number || '—'}</div>
                                                                    <div><strong>Категории прав:</strong> {user.client_profile?.driver_categories?.map(cat => cat.code).join(', ') || '—'}</div>
                                                                    <div><strong>Стаж:</strong> {user.client_profile?.driver_experience_years || 0} лет</div>
                                                                    <div><strong>Бонус-малус:</strong> {user.client_profile?.bonus_malus_class || '—'}</div>
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

                    {/* ==================== ТАРИФЫ ==================== */}
                    {activeTab === 'tariffs' && (
                        <div>
                            <button className={styles.addButton} onClick={() => { setSelectedItem(null); setFormData({}); setShowModal(true); }}>
                                + Добавить тариф
                            </button>
                            {loading ? (
                                <div className={styles.loading}>Загрузка...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Тип полиса</th>
                                            <th>Категория ТС</th>
                                            <th>Базовая ставка</th>
                                            <th>Мин.</th>
                                            <th>Макс.</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tariffs.map(tariff => (
                                            <tr key={tariff.id}>
                                                <td>{tariff.id}</td>
                                                <td>{tariff.policy_type?.name}</td>
                                                <td>{tariff.vehicle_category?.name || tariff.vehicle_category?.code || tariff.vehicle_category}</td>
                                                <td>{Number(tariff.base_rate).toLocaleString()} ₽</td>
                                                <td>{Number(tariff.min_rate).toLocaleString()} ₽</td>
                                                <td>{Number(tariff.max_rate).toLocaleString()} ₽</td>
                                                <td>
                                                    <button className={styles.editButton} onClick={() => { setSelectedItem(tariff); setFormData(tariff); setShowModal(true); }}>
                                                        <img src={editIcon} alt="Редактировать" className={styles.actionIcon} />
                                                    </button>
                                                    <button className={styles.deleteButton} onClick={() => deleteTariff(tariff.id)}>
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

                    {/* ==================== ПОЛИСЫ ==================== */}
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
                            {loading ? (
                                <div className={styles.loading}>Загрузка...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>№ полиса</th>
                                            <th>Клиент</th>
                                            <th>Автомобиль</th>
                                            <th>Тип</th>
                                            <th>Сумма</th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPolicies.map(policy => (
                                            <tr key={policy.id}>
                                                <td>{policy.policy_number}</td>
                                                <td>{policy.client?.last_name} {policy.client?.first_name}</td>
                                                <td>{policy.vehicle?.brand} {policy.vehicle?.model}</td>
                                                <td>{policy.policy_type?.name}</td>
                                                <td>{Number(policy.final_price).toLocaleString()} ₽</td>
                                                <td>
                                                    <span className={`${styles.status} ${styles[policy.status]}`}>
                                                        {getStatusText(policy.status)}
                                                    </span>
                                                 </td>
                                                <td>
                                                    {policy.status === 'active' && (
                                                        <button className={styles.cancelButton} onClick={() => cancelPolicy(policy.id)}>
                                                            Отменить
                                                        </button>
                                                    )}
                                                 </td>
                                             </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ==================== СТРАХОВЫЕ СЛУЧАИ ==================== */}
                    {activeTab === 'accidents' && (
                        <div>
                            {loading ? (
                                <div className={styles.loading}>Загрузка...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Клиент</th>
                                            <th>Полис</th>
                                            <th>Дата</th>
                                            <th>Ущерб</th>
                                            <th>Вина клиента</th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accidents.map(accident => (
                                            <tr key={accident.id}>
                                                <td>{accident.id}</td>
                                                <td>{accident.client?.last_name} {accident.client?.first_name}</td>
                                                <td>{accident.policy?.policy_number}</td>
                                                <td>{accident.accident_date}</td>
                                                <td>{Number(accident.damage_amount).toLocaleString()} ₽</td>
                                                <td>
                                                    <select
                                                        value={accident.is_client_fault ? 'true' : 'false'}
                                                        onChange={(e) => updateAccidentFault(accident.id, e.target.value === 'true')}
                                                        className={styles.statusSelect}
                                                    >
                                                        <option value="false">Нет</option>
                                                        <option value="true">Да</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        value={accident.status || 'pending'}
                                                        onChange={(e) => updateAccidentStatus(accident.id, e.target.value)}
                                                        className={styles.statusSelect}
                                                    >
                                                        <option value="pending">На рассмотрении</option>
                                                        <option value="approved">Одобрено</option>
                                                        <option value="paid">Выплачено</option>
                                                        <option value="rejected">Отклонено</option>
                                                    </select>
                                                 </td>
                                                <td>
                                                    <button className={styles.viewButton} onClick={() => { setSelectedItem(accident); setShowModal(true); }}>
                                                        Просмотр
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

            {/* Модальное окно для тарифа */}
            {showModal && activeTab === 'tariffs' && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedItem ? 'Редактировать тариф' : 'Новый тариф'}</h2>
                        <form onSubmit={saveTariff}>
                            <div className={styles.formGroup}>
                                <label>Тип полиса</label>
                                <select value={formData.policy_type_id || ''} onChange={(e) => setFormData({...formData, policy_type_id: e.target.value})} required>
                                    <option value="">Выберите тип</option>
                                    <option value="1">ОСАГО</option>
                                    <option value="2">КАСКО</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Категория ТС</label>
                                <select value={formData.vehicle_category || ''} onChange={(e) => setFormData({...formData, vehicle_category: e.target.value})} required>
                                    <option value="">Выберите категорию</option>
                                    <option value="A">A - Мотоциклы</option>
                                    <option value="B">B - Легковые</option>
                                    <option value="C">C - Грузовые</option>
                                    <option value="D">D - Автобусы</option>
                                    <option value="E">E - Прицепы</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Базовая ставка (₽)</label>
                                <input type="number" value={formData.base_rate || ''} onChange={(e) => setFormData({...formData, base_rate: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Минимальная ставка (₽)</label>
                                <input type="number" value={formData.min_rate || ''} onChange={(e) => setFormData({...formData, min_rate: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Максимальная ставка (₽)</label>
                                <input type="number" value={formData.max_rate || ''} onChange={(e) => setFormData({...formData, max_rate: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Метод расчета</label>
                                <select value={formData.calculation_method || 'basic'} onChange={(e) => setFormData({...formData, calculation_method: e.target.value})}>
                                    <option value="basic">Базовый</option>
                                    <option value="coefficient">Коэффициентный</option>
                                </select>
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
                            <p><strong>Дата происшествия:</strong> {selectedItem.accident_date}</p>
                            <p><strong>Сумма ущерба:</strong> {Number(selectedItem.damage_amount).toLocaleString()} ₽</p>
                            <p><strong>Статус:</strong> {getStatusText(selectedItem.status)}</p>
                            <p><strong>Описание:</strong> {selectedItem.description || '—'}</p>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={() => setShowModal(false)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};