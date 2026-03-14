import styles from './MainPanelStyle.module.css'
import { MainPanelLine } from './MainPanelLine'

const MainPanelLineProps = [
    {id:0, MainPanelLineH1:'Фамилия', MainPanelLineText: 'Фамилия'},
    {id:1, MainPanelLineH1:'Имя', MainPanelLineText: 'Имя'},
    {id:2, MainPanelLineH1:'Отчество', MainPanelLineText: 'Отчество'},
    {id:3, MainPanelLineH1:'Email', MainPanelLineText: 'yourname@gmail.com'},
    {id:4, MainPanelLineH1:'Телефон', MainPanelLineText: '+79999994444'},
];

export const MainPanel =(props)=>{
    const {MainPanelHeadH1, MainPanelHeadText} = props
    return <div className={styles.MainPanel}>
        
        <div className={styles.MainPanelHead}>
            <h1 className={styles.MainPanelHeadH1}>{MainPanelHeadH1}</h1>
            <p className={styles.MainPanelHeadText}>{MainPanelHeadText}</p>
        </div>

        <div className={styles.MainPanelContainer}>

            {MainPanelLineProps.map((MainPanelInfo,key)=><MainPanelLine 
                                                    key={key}
                                                    MainPanelLineH1={MainPanelInfo.MainPanelLineH1} 
                                                    MainPanelLineText={MainPanelInfo.MainPanelLineText}
                                                />)}
            
        </div>

        <div className={styles.MainPanelButtonContainer}>
            <button>Сохранить изменения</button>
        </div>
            
    </div>
}