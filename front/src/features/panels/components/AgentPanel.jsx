import React, { useState } from 'react';
import styles from './Panels.module.css';
import { useAuth } from '../../../shared/context/authContext';
import clientsIcon from '../../../assets/Panels/Profile.webp';
import policiesIcon from '../../../assets/Panels/Policies.webp';
import accidentsIcon from '../../../assets/Panels/Accident.webp';
import notificationsIcon from '../../../assets/Panels/Notification.webp';
import editIcon from '../../../assets/Panels/Settings.webp';
import deleteIcon from '../../../assets/Panels/Delete.webp';
import exitIcon from '../../../assets/Panels/Exit.webp';
import { useNavigate } from 'react-router-dom';
import { useAgentClients } from '../../../shared/hooks/agent/useAgentClients';
import { useAgentPolicies } from '../../../shared/hooks/agent/useAgentPolicies';
import { useAgentAccidents } from '../../../shared/hooks/agent/useAgentAccidents';
import { useAgentNotifications } from '../../../shared/hooks/agent/useAgentNotifications';

export const AgentPanel = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clients');
    const [expandedRow, setExpandedRow] = useState(null);

    const clientsHook = useAgentClients();
    const policiesHook = useAgentPolicies();
    const accidentsHook = useAgentAccidents();
    const notificationsHook = useAgentNotifications();

    const renderClientsTab = () => (
        <div>
            <div className={styles.searchBar}>
                <input type="text" placeholder="Поиск по email, телефону, ФИО..." value={clientsHook.searchTerm} onChange={(e) => clientsHook.setSearchTerm(e.target.value)} className={styles.searchInput} />
                <button className={styles.addButton} onClick={() => { clientsHook.setSelectedItem(null); clientsHook.setFormData({ email: '', phone: '', password: '', last_name: '', first_name: '', middle_name: '', birth_date: '' }); clientsHook.setValidationErrors({}); clientsHook.setShowModal(true); }}>+ Добавить клиента</button>
            </div>
            {clientsHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Email</th><th>Телефон</th><th>ФИО</th><th>Дата рождения</th><th>Действия</th></tr></thead>
                    <tbody>
                        {clientsHook.filteredClients.map(client => (
                            <React.Fragment key={client.id}>
                                <tr onClick={() => setExpandedRow(expandedRow === client.id ? null : client.id)} style={{ cursor: 'pointer' }}>
                                    <td>{client.id}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phone}</td>
                                    <td>{clientsHook.getFullName(client)}</td>
                                    <td>{clientsHook.formatDate(client.client_profile?.birth_date)}</td>
                                    <td>
                                        <button className={styles.editButton} onClick={(e) => { e.stopPropagation(); clientsHook.handleEditClient(client); }}><img src={editIcon} alt="Редактировать" className={styles.actionIcon} /></button>
                                        <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); clientsHook.deleteClient(client.id); }}><img src={deleteIcon} alt="Удалить" className={styles.actionIcon} /></button>
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
    );

    const renderPoliciesTab = () => (
        <div>
            <div className={styles.filterBar}>
                <select value={policiesHook.statusFilter} onChange={(e) => policiesHook.setStatusFilter(e.target.value)} className={styles.filterSelect}>
                    <option value="">Все статусы</option>
                    <option value="draft">Черновик</option>
                    <option value="active">Активен</option>
                    <option value="expired">Просрочен</option>
                    <option value="cancelled">Отменён</option>
                </select>
            </div>
            {policiesHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>№ полиса</th><th>Клиент</th><th>Автомобиль</th><th>Тип</th><th>Сумма</th><th>Скидка (%)</th><th>Действует до</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        {policiesHook.filteredPolicies.map(policy => {
                            const discountValue = policy.discount_amount ? Math.round(parseFloat(policy.discount_amount)) : 0;
                            return (
                                <tr key={policy.id}>
                                    <td>{policy.policy_number}</td>
                                    <td>{policy.client?.last_name} {policy.client?.first_name}</td>
                                    <td>{policy.vehicle?.brand} {policy.vehicle?.model}</td>
                                    <td>{policy.policy_type?.name}</td>
                                    <td>{policy.final_price?.toLocaleString()} ₽</td>
                                    <td>
                                        <input type="text" value={discountValue} onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val === '') val = '0';
                                            let num = parseInt(val);
                                            if (num > 100) num = 100;
                                            policiesHook.updatePolicyDiscount(policy.id, num);
                                        }} className={styles.discountInput} />
                                    </td>
                                    <td>{policiesHook.formatDate(policy.end_date)}</td>
                                    <td><span className={`${styles.status} ${styles[policy.status]}`}>{policiesHook.getStatusText(policy.status)}</span></td>
                                    <td>
                                        {policy.status === 'draft' && (<button className={styles.editButton} onClick={() => policiesHook.activatePolicy(policy.id)}>Активировать</button>)}
                                        {policy.status === 'active' && (<><button className={styles.editButton} onClick={() => policiesHook.renewPolicy(policy.id)}>Продлить</button><button className={styles.deleteButton} onClick={() => policiesHook.cancelPolicy(policy.id)}>Отменить</button></>)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderAccidentsTab = () => (
        <div>
            {accidentsHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Клиент</th><th>Полис</th><th>Дата</th><th>Ущерб</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        {accidentsHook.accidents.map(accident => (
                            <tr key={accident.id}>
                                <td>{accident.id}</td>
                                <td>{accident.client?.last_name} {accident.client?.first_name}</td>
                                <td>{accident.policy?.policy_number}</td>
                                <td>{accidentsHook.formatDate(accident.accident_date)}</td>
                                <td>{accident.damage_amount?.toLocaleString()} ₽</td>
                                <td>
                                    <select value={accident.status || 'pending'} onChange={(e) => accidentsHook.updateAccidentStatus(accident.id, e.target.value)} className={styles.statusSelect}>
                                        <option value="pending">На рассмотрении</option>
                                        <option value="approved">Одобрено</option>
                                        <option value="paid">Выплачено</option>
                                        <option value="rejected">Отклонено</option>
                                    </select>
                                </td>
                                <td><button className={styles.viewButton} onClick={() => accidentsHook.openModal(accident)}>Просмотр</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderNotificationsTab = () => (
        <div>
            {notificationsHook.loading ? <div className={styles.loading}>Загрузка...</div> : notificationsHook.notifications.length === 0 ? (
                <div className={styles.emptyMessage}><p>Нет отправленных уведомлений</p></div>
            ) : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Клиент</th><th>Сообщение</th><th>Дата отправки</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        {notificationsHook.notifications.map(notification => (
                            <tr key={notification.id}>
                                <td>{notification.id}</td>
                                <td>{notificationsHook.getFullName(notification.user)}</td>
                                <td>{notification.message}</td>
                                <td>{notificationsHook.formatDate(notification.created_at)}</td>
                                <td><span className={`${styles.status} ${styles[notification.is_read ? 'read' : 'unread']}`}>{notification.is_read ? 'Прочитано' : 'Не прочитано'}</span></td>
                                <td><button className={styles.deleteButton} onClick={() => notificationsHook.deleteNotification(notification.id)}><img src={deleteIcon} alt="Удалить" className={styles.actionIcon} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className={styles.adminPanel}>
            <div className={styles.sidebar}>
                <div className={styles.logo}><h2>Панель агента</h2></div>
                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${activeTab === 'clients' ? styles.active : ''}`} onClick={() => setActiveTab('clients')}><img src={clientsIcon} alt="Клиенты" className={styles.navIcon} /> Клиенты</button>
                    <button className={`${styles.navItem} ${activeTab === 'policies' ? styles.active : ''}`} onClick={() => setActiveTab('policies')}><img src={policiesIcon} alt="Полисы" className={styles.navIcon} /> Полисы</button>
                    <button className={`${styles.navItem} ${activeTab === 'accidents' ? styles.active : ''}`} onClick={() => setActiveTab('accidents')}><img src={accidentsIcon} alt="Страховые случаи" className={styles.navIcon} /> Страховые случаи</button>
                    <button className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`} onClick={() => setActiveTab('notifications')}><img src={notificationsIcon} alt="Уведомления" className={styles.navIcon} /> Уведомления</button>
                    <button className={styles.navItem} onClick={() => { logout(); navigate('/'); }}><img src={exitIcon} alt="Выход" className={styles.navIcon} /> Выход</button>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>{activeTab === 'clients' && 'Клиенты'}{activeTab === 'policies' && 'Полисы'}{activeTab === 'accidents' && 'Страховые случаи'}{activeTab === 'notifications' && 'Уведомления'}</h1>
                    {activeTab === 'notifications' && (<button className={styles.headerButton} onClick={() => notificationsHook.setShowNotificationModal(true)}>+ Отправить уведомление</button>)}
                </div>
                {(clientsHook.error || policiesHook.error || accidentsHook.error || notificationsHook.error) && <div className={styles.error}>{clientsHook.error || policiesHook.error || accidentsHook.error || notificationsHook.error}</div>}
                <div className={styles.content}>
                    {activeTab === 'clients' && renderClientsTab()}
                    {activeTab === 'policies' && renderPoliciesTab()}
                    {activeTab === 'accidents' && renderAccidentsTab()}
                    {activeTab === 'notifications' && renderNotificationsTab()}
                </div>
            </div>

            {/* Модальное окно для клиента */}
            {clientsHook.showModal && activeTab === 'clients' && (
                <div className={styles.modalOverlay} onClick={() => clientsHook.setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{clientsHook.selectedItem ? 'Редактировать клиента' : 'Новый клиент'}</h2>
                        <form onSubmit={clientsHook.selectedItem ? clientsHook.updateClient : clientsHook.addClient}>
                            <div className={styles.formGroup}><label>Email *</label><input type="email" value={clientsHook.formData.email} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, email: e.target.value})} className={clientsHook.validationErrors.email ? styles.errorInput : ''} />{clientsHook.validationErrors.email && <span className={styles.fieldError}>{clientsHook.validationErrors.email}</span>}</div>
                            <div className={styles.formGroup}><label>Телефон *</label><input type="tel" value={clientsHook.formData.phone} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, phone: e.target.value})} className={clientsHook.validationErrors.phone ? styles.errorInput : ''} />{clientsHook.validationErrors.phone && <span className={styles.fieldError}>{clientsHook.validationErrors.phone}</span>}</div>
                            {!clientsHook.selectedItem && (<div className={styles.formGroup}><label>Пароль *</label><input type="password" value={clientsHook.formData.password} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, password: e.target.value})} className={clientsHook.validationErrors.password ? styles.errorInput : ''} />{clientsHook.validationErrors.password && <span className={styles.fieldError}>{clientsHook.validationErrors.password}</span>}</div>)}
                            <div className={styles.formGroup}><label>Фамилия</label><input type="text" value={clientsHook.formData.last_name} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, last_name: e.target.value})} className={clientsHook.validationErrors.last_name ? styles.errorInput : ''} />{clientsHook.validationErrors.last_name && <span className={styles.fieldError}>{clientsHook.validationErrors.last_name}</span>}</div>
                            <div className={styles.formGroup}><label>Имя</label><input type="text" value={clientsHook.formData.first_name} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, first_name: e.target.value})} className={clientsHook.validationErrors.first_name ? styles.errorInput : ''} />{clientsHook.validationErrors.first_name && <span className={styles.fieldError}>{clientsHook.validationErrors.first_name}</span>}</div>
                            <div className={styles.formGroup}><label>Отчество</label><input type="text" value={clientsHook.formData.middle_name} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, middle_name: e.target.value})} className={clientsHook.validationErrors.middle_name ? styles.errorInput : ''} />{clientsHook.validationErrors.middle_name && <span className={styles.fieldError}>{clientsHook.validationErrors.middle_name}</span>}</div>
                            <div className={styles.formGroup}><label>Дата рождения</label><input type="date" value={clientsHook.formData.birth_date} onChange={(e) => clientsHook.setFormData({...clientsHook.formData, birth_date: e.target.value})} className={clientsHook.validationErrors.birth_date ? styles.errorInput : ''} />{clientsHook.validationErrors.birth_date && <span className={styles.fieldError}>{clientsHook.validationErrors.birth_date}</span>}</div>
                            <div className={styles.modalButtons}><button type="button" onClick={() => clientsHook.setShowModal(false)}>Отмена</button><button type="submit">Сохранить</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно для страхового случая */}
            {accidentsHook.showModal && activeTab === 'accidents' && accidentsHook.selectedItem && (
                <div className={styles.modalOverlay} onClick={accidentsHook.closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Детали страхового случая</h2>
                        <div className={styles.details}>
                            <p><strong>Клиент:</strong> {accidentsHook.selectedItem.client?.last_name} {accidentsHook.selectedItem.client?.first_name}</p>
                            <p><strong>Полис:</strong> {accidentsHook.selectedItem.policy?.policy_number}</p>
                            <p><strong>Дата происшествия:</strong> {accidentsHook.formatDate(accidentsHook.selectedItem.accident_date)}</p>
                            <p><strong>Сумма ущерба:</strong> {accidentsHook.selectedItem.damage_amount?.toLocaleString()} ₽</p>
                            <p><strong>Статус:</strong> {accidentsHook.getStatusText(accidentsHook.selectedItem.status)}</p>
                            <p><strong>Описание:</strong> {accidentsHook.selectedItem.description || '—'}</p>
                        </div>
                        <div className={styles.modalButtons}><button onClick={accidentsHook.closeModal}>Закрыть</button></div>
                    </div>
                </div>
            )}

            {/* Модальное окно для отправки уведомления */}
            {notificationsHook.showNotificationModal && (
                <div className={styles.modalOverlay} onClick={() => notificationsHook.setShowNotificationModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Отправить уведомление</h2>
                        <form onSubmit={notificationsHook.sendNotification}>
                            <div className={styles.formGroup}>
                                <label>Клиент *</label>
                                <select value={notificationsHook.notificationData.client_id} onChange={(e) => notificationsHook.setNotificationData({...notificationsHook.notificationData, client_id: e.target.value})} required>
                                    <option value="">Выберите клиента</option>
                                    {clientsHook.clients.map(client => (<option key={client.id} value={client.id}>{clientsHook.getFullName(client)} ({client.email})</option>))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Сообщение *</label>
                                <textarea value={notificationsHook.notificationData.message} onChange={(e) => notificationsHook.setNotificationData({...notificationsHook.notificationData, message: e.target.value})} rows="5" placeholder="Введите текст уведомления..." required />
                            </div>
                            <div className={styles.modalButtons}>
                                <button type="button" onClick={() => notificationsHook.setShowNotificationModal(false)}>Отмена</button>
                                <button type="submit">Отправить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};