import styles from './SidePanelStyle.module.css'
import Profile from '../../../../assets/Profile/Profile.png'
import History from '../../../../assets/Profile/History.webp'
import Notifications from '../../../../assets/Profile/Notifications.png'
import Back from '../../../../assets/Profile/Back.webp'
import Exit from '../../../../assets/Profile/Exit.png'
import { SidePanelLine } from './SidePanelLine'
import { useNotifications } from '../../../../shared/context/notificationsContext'

export const SidePanel = (props) => {
    const {SidePanelHeadH1, SidePanelHeadText, activeTab, setActiveTab} = props
    const { unreadCount } = useNotifications()

    const SidePanelLineProps = [
        {id:0, SidePanelLineImg: Profile, SidePanelLineButton:'Профиль', tabName: 'profile'},
        {id:1, SidePanelLineImg: History, SidePanelLineButton:'История полисов', tabName: 'policies'},
        {id:2, SidePanelLineImg: Notifications, SidePanelLineButton:'Уведомления', tabName: 'notifications', badge: unreadCount},
        {id:3, SidePanelLineImg: Back, SidePanelLineButton:'На главную', isLink: true, LinkPath: "/"},
        {id:4, SidePanelLineImg: Exit, SidePanelLineButton:'Выход', isLink: true, LinkPath: "/SignIn"},
    ];

    return <div className={styles.SidePanel}>
        <div className={styles.SidePanelHead}>
            <h1 className={styles.SidePanelHeadH1}>{SidePanelHeadH1}</h1>
            <p className={styles.SidePanelHeadText}>{SidePanelHeadText}</p>
        </div>

        <div className={styles.SidePanelContainer}>
            {SidePanelLineProps.map((SidePanelInfo, key) => 
                SidePanelInfo.isLink ? (
                    <SidePanelLine 
                        key={key}
                        SidePanelLineImg={SidePanelInfo.SidePanelLineImg} 
                        SidePanelLineButton={SidePanelInfo.SidePanelLineButton}
                        isButtonLink={true}
                        LinkPath={SidePanelInfo.LinkPath}
                    />
                ) : (
                    <SidePanelLine 
                        key={key}
                        SidePanelLineImg={SidePanelInfo.SidePanelLineImg} 
                        SidePanelLineButton={SidePanelInfo.SidePanelLineButton}
                        isActive={activeTab === SidePanelInfo.tabName}
                        onClick={() => setActiveTab(SidePanelInfo.tabName)}
                        badge={SidePanelInfo.badge}
                    />
                )
            )}
        </div>
    </div>
}