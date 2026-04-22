import styles from './profileStyle.module.css';
import { SidePanel } from '../components/sidePanel/SidePanel';
import { MainPanel } from '../components/mainPanel/MainPanel';
import { HistoryPanel } from '../components/panels/HistoryPanel';
import { NotificationsPanel } from '../components/panels/NotificationsPanel';
import { VehiclesPanel } from '../components/panels/VehiclesPanel';
import { AccidentsPanel } from '../components/panels/AccidentsPanel';
import { useProfilePage } from '../../../shared/hooks/profile/useProfilePage';

export const ProfilePage = () => {
    const {
        activeTab,
        loading,
        isAuthenticated,
        handleTabChange,
        getPanelKey
    } = useProfilePage();

    const renderMainPanel = () => {
        switch(activeTab) {
            case 'profile':
                return <MainPanel key={getPanelKey('profile')} />;
            case 'policies':
                return <HistoryPanel key={getPanelKey('policies')} />;
            case 'notifications':
                return <NotificationsPanel key={getPanelKey('notifications')} />;
            case 'vehicles': 
                return <VehiclesPanel key={getPanelKey('vehicles')} />;
            case 'accidents':
                return <AccidentsPanel key={getPanelKey('accidents')} />;
            default:
                return <MainPanel key={getPanelKey('profile')} />;
        }
    };

    if (loading) {
        return <div className={styles.wrapper}>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        window.location.href = '/SignIn';
        return null;
    }

    return (
        <div className={styles.wrapper}>
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
    );
};