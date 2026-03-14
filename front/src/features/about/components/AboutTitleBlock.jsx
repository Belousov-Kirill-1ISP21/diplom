import styles from './AboutTitleBlockStyle.module.css';
import AboutTitle from '../../../assets/AboutUs/AboutTitle.png'
export const AboutTitleBlock =(props)=>{
    return <div className={styles.AboutTitleBlock}>

        <img src={AboutTitle} className={styles.AboutTitleBlockImg}/> 
  
    </div>
}