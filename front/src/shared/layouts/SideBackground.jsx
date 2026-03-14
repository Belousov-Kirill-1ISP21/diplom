import styles from './SideBackgroundStyle.module.css';
import SideBackgroundImg from '../../assets/SideBackground/SideBackground.png'
import SideDarkBackgroundImg from '../../assets/SideBackground/SideDarkBackground.png'

export const SideBackground =(props)=>{
    const {isDark} = props;

    return <div className={styles.SideBackground}>

            {(() => {
                if (isDark) {
                    return (
                        <img className={styles.SideDarkBackgroundImg}/>
                    );
                } 
                else {
                    return (
                        <img className={styles.SideBackgroundImg}/>
                    );
                }
            })()}
        
    </div>
}