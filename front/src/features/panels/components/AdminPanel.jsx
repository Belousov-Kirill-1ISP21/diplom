import React, { useState } from 'react';
import styles from './Panels.module.css';
import { useAuth } from '../../../shared/context/authContext';
import usersIcon from '../../../assets/Panels/Profile.webp';
import tariffsIcon from '../../../assets/Panels/Tarif.webp';
import policiesIcon from '../../../assets/Panels/Policies.webp';
import accidentsIcon from '../../../assets/Panels/Accident.webp';
import editIcon from '../../../assets/Panels/Settings.webp';
import deleteIcon from '../../../assets/Panels/Delete.webp';
import exitIcon from '../../../assets/Panels/Exit.webp';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../../../shared/hooks/admin/useAdminUsers';
import { useAdminTariffs } from '../../../shared/hooks/admin/useAdminTariffs';
import { useAdminPolicies } from '../../../shared/hooks/admin/useAdminPolicies';
import { useAdminAccidents } from '../../../shared/hooks/admin/useAdminAccidents';

export const AdminPanel = () => {
    const { userData, isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [expandedRow, setExpandedRow] = useState(null);

    const usersHook = useAdminUsers();
    const tariffsHook = useAdminTariffs();
    const policiesHook = useAdminPolicies();
    const accidentsHook = useAdminAccidents();

    if (authLoading) return <div className={styles.loading}>Загрузка...</div>;
    if (!isAuthenticated) { window.location.href = '/SignIn'; return null; }
    if (userData?.user_type?.name !== 'admin') { window.location.href = '/'; return null; }

    const renderUsersTab = () => (
        <div>
            <div className={styles.searchBar}>
                <input type="text" placeholder="Поиск по email, телефону, ФИО..." value={usersHook.searchTerm} onChange={(e) => usersHook.setSearchTerm(e.target.value)} className={styles.searchInput} />
            </div>
            {usersHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Email</th><th>Телефон</th><th>ФИО</th><th>Тип</th><th>Действия</th></tr></thead>
                    <tbody>
                        {usersHook.filteredUsers.map(user => (
                            <React.Fragment key={user.id}>
                                <tr onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)} style={{ cursor: 'pointer' }}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{usersHook.getFullName(user)}</td>
                                    <td>{usersHook.getUserTypeName(user)}</td>
                                    <td>
                                        <select value={user.user_type?.name || 'client'} onChange={(e) => usersHook.changeUserType(user.id, e.target.value)} onClick={(e) => e.stopPropagation()} className={styles.select}>
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
                                                    <div><strong>Дата рождения:</strong> {usersHook.formatDate(user.client_profile?.birth_date)}</div>
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
    );

    const renderTariffsTab = () => (
        <div>
            <button className={styles.addButton} onClick={() => tariffsHook.openModal()}>+ Добавить тариф</button>
            {tariffsHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Тип полиса</th><th>Категория ТС</th><th>Базовая ставка</th><th>Мин.</th><th>Макс.</th><th>Действия</th></tr></thead>
                    <tbody>
                        {tariffsHook.tariffs.map(tariff => (
                            <tr key={tariff.id}>
                                <td>{tariff.id}</td>
                                <td>{tariff.policy_type?.name}</td>
                                <td>{tariff.vehicle_category?.name || tariff.vehicle_category?.code || tariff.vehicle_category}</td>
                                <td>{Number(tariff.base_rate).toLocaleString()} ₽</td>
                                <td>{Number(tariff.min_rate).toLocaleString()} ₽</td>
                                <td>{Number(tariff.max_rate).toLocaleString()} ₽</td>
                                <td>
                                    <button className={styles.editButton} onClick={() => tariffsHook.openModal(tariff)}><img src={editIcon} alt="Редактировать" className={styles.actionIcon} /></button>
                                    <button className={styles.deleteButton} onClick={() => tariffsHook.deleteTariff(tariff.id)}><img src={deleteIcon} alt="Удалить" className={styles.actionIcon} /></button>
                                </td>
                            </tr>
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
                    <thead><tr><th>№ полиса</th><th>Клиент</th><th>Автомобиль</th><th>Тип</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        {policiesHook.filteredPolicies.map(policy => (
                            <tr key={policy.id}>
                                <td>{policy.policy_number}</td>
                                <td>{policy.client?.last_name} {policy.client?.first_name}</td>
                                <td>{policy.vehicle?.brand} {policy.vehicle?.model}</td>
                                <td>{policy.policy_type?.name}</td>
                                <td>{Number(policy.final_price).toLocaleString()} ₽</td>
                                <td><span className={`${styles.status} ${styles[policy.status]}`}>{policiesHook.getStatusText(policy.status)}</span></td>
                                <td>{policy.status === 'active' && <button className={styles.cancelButton} onClick={() => policiesHook.cancelPolicy(policy.id)}>Отменить</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const renderAccidentsTab = () => (
        <div>
            {accidentsHook.loading ? <div className={styles.loading}>Загрузка...</div> : (
                <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Клиент</th><th>Полис</th><th>Дата</th><th>Ущерб</th><th>Вина клиента</th><th>Статус</th><th>Действия</th></tr></thead>
                    <tbody>
                        {accidentsHook.accidents.map(accident => (
                            <tr key={accident.id}>
                                <td>{accident.id}</td>
                                <td>{accident.client?.last_name} {accident.client?.first_name}</td>
                                <td>{accident.policy?.policy_number}</td>
                                <td>{accidentsHook.formatDate(accident.accident_date)}</td>
                                <td>{Number(accident.damage_amount).toLocaleString()} ₽</td>
                                <td>
                                    <select value={accident.is_client_fault ? 'true' : 'false'} onChange={(e) => accidentsHook.updateAccidentFault(accident.id, e.target.value === 'true')} className={styles.statusSelect}>
                                        <option value="false">Нет</option>
                                        <option value="true">Да</option>
                                    </select>
                                 </td>
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

    return (
        <div className={styles.adminPanel}>
            <div className={styles.sidebar}>
                <div className={styles.logo}><h2>Админ-панель</h2></div>
                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}><img src={usersIcon} alt="Пользователи" className={styles.navIcon} /> Пользователи</button>
                    <button className={`${styles.navItem} ${activeTab === 'tariffs' ? styles.active : ''}`} onClick={() => setActiveTab('tariffs')}><img src={tariffsIcon} alt="Тарифы" className={styles.navIcon} /> Тарифы</button>
                    <button className={`${styles.navItem} ${activeTab === 'policies' ? styles.active : ''}`} onClick={() => setActiveTab('policies')}><img src={policiesIcon} alt="Полисы" className={styles.navIcon} /> Полисы</button>
                    <button className={`${styles.navItem} ${activeTab === 'accidents' ? styles.active : ''}`} onClick={() => setActiveTab('accidents')}><img src={accidentsIcon} alt="Страховые случаи" className={styles.navIcon} /> Страховые случаи</button>
                    <button className={styles.navItem} onClick={() => { logout(); navigate('/'); }}><img src={exitIcon} alt="Выход" className={styles.navIcon} /> Выход</button>
                </nav>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    <h1>{activeTab === 'users' && 'Пользователи'}{activeTab === 'tariffs' && 'Тарифы'}{activeTab === 'policies' && 'Полисы'}{activeTab === 'accidents' && 'Страховые случаи'}</h1>
                </div>
                {(usersHook.error || tariffsHook.error || policiesHook.error || accidentsHook.error) && <div className={styles.error}>{usersHook.error || tariffsHook.error || policiesHook.error || accidentsHook.error}</div>}
                <div className={styles.content}>
                    {activeTab === 'users' && renderUsersTab()}
                    {activeTab === 'tariffs' && renderTariffsTab()}
                    {activeTab === 'policies' && renderPoliciesTab()}
                    {activeTab === 'accidents' && renderAccidentsTab()}
                </div>
            </div>

            {/* Модальное окно для тарифа */}
            {tariffsHook.showModal && activeTab === 'tariffs' && (
                <div className={styles.modalOverlay} onClick={tariffsHook.closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{tariffsHook.selectedItem ? 'Редактировать тариф' : 'Новый тариф'}</h2>
                        <form onSubmit={tariffsHook.saveTariff}>
                            <div className={styles.formGroup}>
                                <label>Тип полиса *</label>
                                <select value={tariffsHook.formData.policy_type_id || ''} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, policy_type_id: e.target.value})} className={tariffsHook.validationErrors.policy_type_id ? styles.errorInput : ''}>
                                    <option value="">Выберите тип</option>
                                    <option value="1">ОСАГО</option>
                                    <option value="2">КАСКО</option>
                                </select>
                                {tariffsHook.validationErrors.policy_type_id && <span className={styles.fieldError}>{tariffsHook.validationErrors.policy_type_id}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Категория ТС *</label>
                                <select value={tariffsHook.formData.vehicle_category || ''} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, vehicle_category: e.target.value})} className={tariffsHook.validationErrors.vehicle_category ? styles.errorInput : ''}>
                                    <option value="">Выберите категорию</option>
                                    <option value="A">A - Мотоциклы</option>
                                    <option value="B">B - Легковые</option>
                                    <option value="C">C - Грузовые</option>
                                    <option value="D">D - Автобусы</option>
                                    <option value="E">E - Прицепы</option>
                                </select>
                                {tariffsHook.validationErrors.vehicle_category && <span className={styles.fieldError}>{tariffsHook.validationErrors.vehicle_category}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Базовая ставка (₽) *</label>
                                <input type="number" value={tariffsHook.formData.base_rate || ''} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, base_rate: e.target.value})} className={tariffsHook.validationErrors.base_rate ? styles.errorInput : ''} />
                                {tariffsHook.validationErrors.base_rate && <span className={styles.fieldError}>{tariffsHook.validationErrors.base_rate}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Минимальная ставка (₽) *</label>
                                <input type="number" value={tariffsHook.formData.min_rate || ''} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, min_rate: e.target.value})} className={tariffsHook.validationErrors.min_rate ? styles.errorInput : ''} />
                                {tariffsHook.validationErrors.min_rate && <span className={styles.fieldError}>{tariffsHook.validationErrors.min_rate}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Максимальная ставка (₽) *</label>
                                <input type="number" value={tariffsHook.formData.max_rate || ''} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, max_rate: e.target.value})} className={tariffsHook.validationErrors.max_rate ? styles.errorInput : ''} />
                                {tariffsHook.validationErrors.max_rate && <span className={styles.fieldError}>{tariffsHook.validationErrors.max_rate}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Метод расчета</label>
                                <select value={tariffsHook.formData.calculation_method || 'basic'} onChange={(e) => tariffsHook.setFormData({...tariffsHook.formData, calculation_method: e.target.value})}>
                                    <option value="basic">Базовый</option>
                                    <option value="coefficient">Коэффициентный</option>
                                </select>
                            </div>
                            <div className={styles.modalButtons}>
                                <button type="button" onClick={tariffsHook.closeModal}>Отмена</button>
                                <button type="submit">Сохранить</button>
                            </div>
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
                            <p><strong>Сумма ущерба:</strong> {Number(accidentsHook.selectedItem.damage_amount).toLocaleString()} ₽</p>
                            <p><strong>Статус:</strong> {accidentsHook.getStatusText(accidentsHook.selectedItem.status)}</p>
                            <p><strong>Описание:</strong> {accidentsHook.selectedItem.description || '—'}</p>
                        </div>
                        <div className={styles.modalButtons}>
                            <button onClick={accidentsHook.closeModal}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};