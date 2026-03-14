import styles from  './profileStyle.module.css'
import { SidePanel } from '../components/sidePanel/SidePanel'
import { MainPanel } from '../components/mainPanel/MainPanel'

const SidePanelProps = [
    {id:0, SidePanelHeadH1:'Фамилия имя', SidePanelHeadText: 'yourname@gmail.com'},
];

const MainPanelProps = [
    {id:0, MainPanelHeadH1:'Фамилия имя', MainPanelHeadText: 'yourname@gmail.com'},
];

export const ProfilePage = (props)=>{

    return <div className={styles.wrapper}>

        <div className={styles.panelsContainer}>

            <div className={styles.SidePanelContainer}>
                {SidePanelProps.map((SidePanelInfo,key)=><SidePanel 
                                                    key={key}
                                                    SidePanelHeadH1={SidePanelInfo.SidePanelHeadH1} 
                                                    SidePanelHeadText={SidePanelInfo.SidePanelHeadText}
                                                />)}
            </div>

            <div className={styles.MainPanelContainer}>
                {MainPanelProps.map((MainPanelInfo,key)=><MainPanel 
                                                    key={key}
                                                    MainPanelHeadH1={MainPanelInfo.MainPanelHeadH1} 
                                                    MainPanelHeadText={MainPanelInfo.MainPanelHeadText}
                                                />)}
            </div>

        </div>  

    </div>
}