import styles from './MainPanelLineStyle.module.css'
export const MainPanelLine =(props)=>{
    const {MainPanelLineH1, MainPanelLineText} = props
    return <div className={styles.MainPanelLine}>
        <h1 className={styles.MainPanelLineH1}>{MainPanelLineH1}</h1>
        <p className={styles.MainPanelLineText}>{MainPanelLineText}</p>     
    </div>
}