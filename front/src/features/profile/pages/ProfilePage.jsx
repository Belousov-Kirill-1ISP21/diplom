import styles from  './profileStyle.module.css'
import { SidePanel } from '../components/sidePanel/SidePanel'
import { MainPanel } from '../components/mainPanel/MainPanel'
import { HistoryPanel } from '../components/HistoryPanel'
import { NotificationsPanel } from '../components/NotificationsPanel'
import { useState } from 'react'

const SidePanelProps = [
    {id:0, SidePanelHeadH1:'Фамилия имя', SidePanelHeadText: 'yourname@gmail.com'},
];

export const ProfilePage = (props)=>{
    const [activeTab, setActiveTab] = useState('profile')

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

    return <div className={styles.wrapper}>
        <div className={styles.panelsContainer}>
            <div className={styles.SidePanelContainer}>
                <SidePanel 
                    SidePanelHeadH1="Фамилия имя" 
                    SidePanelHeadText="yourname@gmail.com"
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