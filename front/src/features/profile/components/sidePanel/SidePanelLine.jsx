import styles from './SidePanelLineStyle.module.css'
import { Link } from 'react-router-dom';

export const SidePanelLine = (props) => {
    const {SidePanelLineImg, SidePanelLineButton, isButtonLink, LinkPath, isActive, onClick, badge} = props
    
    return <div 
        className={`${styles.SidePanelLine} ${isActive ? styles.active : ''}`}
        onClick={!isButtonLink ? onClick : undefined}
    >
        <img src={SidePanelLineImg} className={styles.SidePanelLineImg}/>
        
        {isButtonLink ? (
            <Link to={LinkPath} className={styles.SidePanelLineButtonLink}>
                <button className={styles.SidePanelLineButton}>{SidePanelLineButton}</button>
            </Link>
        ) : (
            <div className={styles.buttonContainer}>
                <button className={styles.SidePanelLineButton}>{SidePanelLineButton}</button>
                {badge > 0 && (
                    <span className={styles.badge}>{badge}</span>
                )}
            </div>
        )}
    </div>
}