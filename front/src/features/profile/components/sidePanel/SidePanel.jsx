import styles from './SidePanelStyle.module.css'
import Profile from '../../../../assets/Profile/Profile.webp'
import History from '../../../../assets/Profile/History.webp'
import Notifications from '../../../../assets/Profile/Notifications.webp'
import AccidentsIcon from '../../../../assets/Profile/Accident.webp'
import Back from '../../../../assets/Profile/Back.webp'
import Exit from '../../../../assets/Profile/Exit.webp'
import Car from '../../../../assets/Profile/Car.webp'
import { SidePanelLine } from './SidePanelLine'
import { useNotifications } from '../../../../shared/context/notificationsContext'
import { useAuth } from '../../../../shared/context/authContext'
import { useNavigate } from 'react-router-dom'

export const SidePanel = (props) => {
    const { activeTab, setActiveTab } = props
    const { unreadCount } = useNotifications()
    const { logout, fullUserData } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    // Формируем отображаемое имя из полей surname и name
    const displayName = fullUserData?.surname && fullUserData?.name 
        ? `${fullUserData.surname} ${fullUserData.name}`
        : fullUserData?.email?.split('@')[0] || 'Пользователь'
    const displayEmail = fullUserData?.email || 'email@example.com'

    const SidePanelLineProps = [
        {id:0, SidePanelLineImg: Profile, SidePanelLineButton:'Профиль', tabName: 'profile'},
        {id:1, SidePanelLineImg: History, SidePanelLineButton:'История полисов', tabName: 'policies'},
        {id:2, SidePanelLineImg: Car, SidePanelLineButton:'Мои автомобили', tabName: 'vehicles'},
        {id:3, SidePanelLineImg: AccidentsIcon, SidePanelLineButton:'Страховые случаи', tabName: 'accidents'},
        {id:4, SidePanelLineImg: Notifications, SidePanelLineButton:'Уведомления', tabName: 'notifications', badge: unreadCount},
        {id:5, SidePanelLineImg: Back, SidePanelLineButton:'На главную', isLink: true, LinkPath: "/"},
        {id:6, SidePanelLineImg: Exit, SidePanelLineButton:'Выход', onClick: handleLogout},
    ];

    return <div className={styles.SidePanel}>
        <div className={styles.SidePanelHead}>
            <h1 className={styles.SidePanelHeadH1}>{displayName}</h1>
            <p className={styles.SidePanelHeadText}>{displayEmail}</p>
        </div>

        <div className={styles.SidePanelContainer}>
            {SidePanelLineProps.map((SidePanelInfo, key) => {
                if (SidePanelInfo.onClick) {
                    return (
                        <SidePanelLine 
                            key={key}
                            SidePanelLineImg={SidePanelInfo.SidePanelLineImg} 
                            SidePanelLineButton={SidePanelInfo.SidePanelLineButton}
                            onClick={SidePanelInfo.onClick}
                        />
                    )
                } else if (SidePanelInfo.isLink) {
                    return (
                        <SidePanelLine 
                            key={key}
                            SidePanelLineImg={SidePanelInfo.SidePanelLineImg} 
                            SidePanelLineButton={SidePanelInfo.SidePanelLineButton}
                            isButtonLink={true}
                            LinkPath={SidePanelInfo.LinkPath}
                        />
                    )
                } else {
                    return (
                        <SidePanelLine 
                            key={key}
                            SidePanelLineImg={SidePanelInfo.SidePanelLineImg} 
                            SidePanelLineButton={SidePanelInfo.SidePanelLineButton}
                            isActive={activeTab === SidePanelInfo.tabName}
                            onClick={() => setActiveTab(SidePanelInfo.tabName)}
                            badge={SidePanelInfo.badge}
                        />
                    )
                }
            })}
        </div>
    </div>
}