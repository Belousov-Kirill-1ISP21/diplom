import styles from './profileStyle.module.css'
import { SidePanel } from '../components/sidePanel/SidePanel'
import { MainPanel } from '../components/mainPanel/MainPanel'
import { HistoryPanel } from '../components/HistoryPanel'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { VehiclesPanel } from '../components/VehiclesPanel';
import { AccidentsPanel } from '../components/AccidentsPanel';
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../shared/context/authContext'
import { useLocation } from 'react-router-dom'

export const ProfilePage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile')
    const { isAuthenticated, loading, refreshUserData, refreshPolicies } = useAuth()
    const [refreshKey, setRefreshKey] = useState(0)
    const hasRefreshed = useRef(false) // Флаг, чтобы обновить только 1 раз

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'policies') {
            setActiveTab('policies');
        }
    }, [location]);

    // ОДИН РАЗ после загрузки страницы обновляем данные
    useEffect(() => {
        if (!loading && !hasRefreshed.current) {
            hasRefreshed.current = true
            const refreshData = async () => {
                await refreshUserData()
                await refreshPolicies()
                setRefreshKey(prev => prev + 1)
            }
            refreshData()
        }
    }, [loading, refreshUserData, refreshPolicies])

    // Функция для обновления данных пользователя при смене вкладок
    const handleTabChange = useCallback(async (tab) => {
        setActiveTab(tab)
        setRefreshKey(prev => prev + 1)
        
        if (tab === 'profile') {
            await refreshUserData()
        }
        
        if (tab === 'policies') {
            await refreshPolicies()
        }
    }, [refreshUserData, refreshPolicies])

    // Функция для рендера с пробросом refreshKey для принудительного обновления
    const renderMainPanel = useCallback(() => {
        switch(activeTab) {
            case 'profile':
                return <MainPanel key={`profile-${refreshKey}`} />
            case 'policies':
                return <HistoryPanel key={`policies-${refreshKey}`} />
            case 'notifications':
                return <NotificationsPanel key={`notifications-${refreshKey}`} />
            case 'vehicles': 
                return <VehiclesPanel key={`vehicles-${refreshKey}`} />
            case 'accidents':
                return <AccidentsPanel key={`accidents-${refreshKey}`} />
            default:
                return <MainPanel key={`profile-${refreshKey}`} />
        }
    }, [activeTab, refreshKey])

    if (loading) {
        return <div className={styles.wrapper}>Загрузка...</div>
    }

    if (!isAuthenticated) {
        window.location.href = '/SignIn'
        return null
    }

    return <div className={styles.wrapper}>
        <div className={styles.panelsContainer}>
            <div className={styles.SidePanelContainer}>
                <SidePanel 
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                />
            </div>
            <div className={styles.MainPanelContainer}>
                {renderMainPanel()}
            </div>
        </div>  
    </div>
}