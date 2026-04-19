import React, { useState, useEffect } from 'react';
import styles from './Panels.module.css';
import { useAuth } from '../../../shared/context/authContext';
import api from '../../../api/client';
import clientsIcon from '../../../assets/Profile/Profile.webp';
import policiesIcon from '../../../assets/Profile/History.webp';
import accidentsIcon from '../../../assets/Profile/History.webp';
import editIcon from '../../../assets/Profile/Settings.webp';
import deleteIcon from '../../../assets/Profile/Settings.webp';
import exitIcon from '../../../assets/Profile/Exit.webp';

export const AgentPanel = () => {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState('clients');
    const [clients, setClients] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [accidents, setAccidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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

    useEffect(() => {
        if (activeTab === 'clients') loadClients();
        if (activeTab === 'policies') loadPolicies();
        if (activeTab === 'accidents') loadAccidents();
    }, [activeTab]);

    const addClient = async (e) => {
        e.preventDefault();
        try {
            await api.post('/agent/clients', formData);
            setShowModal(false);
            setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' });
            loadClients();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка добавления клиента');
        }
    };

    const updateClient = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/agent/clients/${selectedItem.id}`, formData);
            setShowModal(false);
            setSelectedItem(null);
            setFormData({});
            loadClients();
        } catch (error) {
            setError('Ошибка обновления клиента');
        }
    };

    const deleteClient = async (id) => {
        if (window.confirm('Удалить клиента? Все его полисы также будут удалены.')) {
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
        const days = prompt('На сколько дней продлить полис?', '365');
        if (days) {
            try {
                await api.post(`/agent/policies/${id}/renew`, { days: parseInt(days) });
                loadPolicies();
            } catch (error) {
                setError('Ошибка продления полиса');
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

    const getFullName = (client) => {
        const profile = client.client_profile;
        if (!profile) return '—';
        const parts = [profile.last_name, profile.first_name, profile.middle_name].filter(p => p);
        return parts.length ? parts.join(' ') : '—';
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
            birth_date: client.client_profile?.birth_date || ''
        });
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
                    <button className={styles.navItem} onClick={() => window.location.href = '/'}>
                        <img src={exitIcon} alt="Выход" className={styles.navIcon} /> Выход
                    </button>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}><h1>{activeTab === 'clients' && 'Клиенты'}{activeTab === 'policies' && 'Полисы'}{activeTab === 'accidents' && 'Страховые случаи'}</h1></div>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.content}>
                    {/* КЛИЕНТЫ */}
                    {activeTab === 'clients' && (
                        <div>
                            <div className={styles.searchBar}>
                                <input type="text" placeholder="Поиск по email, телефону, ФИО..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
                                <button className={styles.addButton} onClick={() => { setSelectedItem(null); setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' }); setShowModal(true); }}>+ Добавить клиента</button>
                            </div>
                            {loading ? <div className={styles.loading}>Загрузка...</div> : (
                                <table className={styles.table}>
                                    <thead><tr><th>ID</th><th>Email</th><th>Телефон</th><th>ФИО</th><th>Дата рождения</th><th>Действия</th></tr></thead>
                                    <tbody>
                                        {filteredClients.map(client => (
                                            <React.Fragment key={client.id}>
                                                <tr onClick={() => setExpandedRow(expandedRow === client.id ? null : client.id)} style={{ cursor: 'pointer' }}>
                                                    <td>{client.id}</td>
                                                    <td>{client.email}</td>
                                                    <td>{client.phone}</td>
                                                    <td>{getFullName(client)}</td>
                                                    <td>{client.client_profile?.birth_date || '—'}</td>
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
                                                                    <div><strong>Категории:</strong> {client.client_profile.driver_categories || '—'}</div>
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
                                    <thead><tr><th>№ полиса</th><th>Клиент</th><th>Автомобиль</th><th>Тип</th><th>Сумма</th><th>Действует до</th><th>Статус</th><th>Действия</th></tr></thead>
                                    <tbody>
                                        {filteredPolicies.map(policy => (
                                            <tr key={policy.id}>
                                                <td>{policy.policy_number}</td>
                                                <td>{policy.client?.last_name} {policy.client?.first_name}</td>
                                                <td>{policy.vehicle?.brand} {policy.vehicle?.model}</td>
                                                <td>{policy.policy_type?.name}</td>
                                                <td>{policy.final_price?.toLocaleString()} ₽</td>
                                                <td>{policy.end_date}</td>
                                                <td><span className={`${styles.status} ${styles[policy.status]}`}>{getStatusText(policy.status)}</span></td>
                                                <td>
                                                    {policy.status === 'draft' && (<button className={styles.editButton} onClick={() => activatePolicy(policy.id)}>Активировать</button>)}
                                                    {policy.status === 'active' && (<><button className={styles.editButton} onClick={() => renewPolicy(policy.id)}>Продлить</button><button className={styles.deleteButton} onClick={() => cancelPolicy(policy.id)}>Отменить</button></>)}
                                                 </td>
                                             </tr>
                                        ))}
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
                                    <thead><tr><th>ID</th><th>Клиент</th><th>Полис</th><th>Дата</th><th>Ущерб</th><th>Статус</th><th>Действия</th></tr></thead>
                                    <tbody>
                                        {accidents.map(accident => (
                                            <tr key={accident.id}>
                                                <td>{accident.id}</td>
                                                <td>{accident.client?.last_name} {accident.client?.first_name}</td>
                                                <td>{accident.policy?.policy_number}</td>
                                                <td>{accident.accident_date}</td>
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
                </div>
            </div>

            {showModal && activeTab === 'clients' && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedItem ? 'Редактировать клиента' : 'Новый клиент'}</h2>
                        <form onSubmit={selectedItem ? updateClient : addClient}>
                            <div className={styles.formGroup}><label>Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                            <div className={styles.formGroup}><label>Телефон *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
                            {!selectedItem && (<div className={styles.formGroup}><label>Пароль *</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required /></div>)}
                            <div className={styles.formGroup}><label>Фамилия</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} /></div>
                            <div className={styles.formGroup}><label>Имя</label><input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} /></div>
                            <div className={styles.formGroup}><label>Отчество</label><input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} /></div>
                            <div className={styles.formGroup}><label>Дата рождения</label><input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} /></div>
                            <div className={styles.modalButtons}><button type="button" onClick={() => setShowModal(false)}>Отмена</button><button type="submit">Сохранить</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && activeTab === 'accidents' && selectedItem && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Детали страхового случая</h2>
                        <div className={styles.details}>
                            <p><strong>Клиент:</strong> {selectedItem.client?.last_name} {selectedItem.client?.first_name}</p>
                            <p><strong>Полис:</strong> {selectedItem.policy?.policy_number}</p>
                            <p><strong>Дата происшествия:</strong> {selectedItem.accident_date}</p>
                            <p><strong>Сумма ущерба:</strong> {selectedItem.damage_amount?.toLocaleString()} ₽</p>
                            <p><strong>Статус:</strong> {getStatusText(selectedItem.status)}</p>
                            <p><strong>Описание:</strong> {selectedItem.description || '—'}</p>
                        </div>
                        <div className={styles.modalButtons}><button onClick={() => setShowModal(false)}>Закрыть</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};