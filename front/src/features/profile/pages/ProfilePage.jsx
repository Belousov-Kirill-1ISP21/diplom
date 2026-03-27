import styles from  './profileStyle.module.css'
import { SidePanel } from '../components/sidePanel/SidePanel'
import { MainPanel } from '../components/mainPanel/MainPanel'
import { HistoryPanel } from '../components/HistoryPanel'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../shared/context/authContext'
import { useLocation } from 'react-router-dom'

export const ProfilePage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile')
    const { userData } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'policies') {
            setActiveTab('policies');
        }
    }, [location]);

    const renderMainPanel = () => {
        switch(activeTab) {
            case 'profile':
                return <MainPanel />
            case 'policies':
                return <HistoryPanel />
            case 'notifications':
                return <NotificationsPanel />
            default:
                return <MainPanel />
        }
    }

    if (!userData) return null;

    return <div className={styles.wrapper}>
        <div className={styles.panelsContainer}>
            <div className={styles.SidePanelContainer}>
                <SidePanel 
                    SidePanelHeadH1={`${userData.surname} ${userData.name}`}
                    SidePanelHeadText={userData.email}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
            <div className={styles.MainPanelContainer}>
                {renderMainPanel()}
            </div>
        </div>  
    </div>
}