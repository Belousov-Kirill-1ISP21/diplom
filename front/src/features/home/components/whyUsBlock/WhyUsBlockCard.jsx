import ProcentImg from "../../../../assets/Home/Procent.png";
import styles from './WhyUsBlockCardStyle.module.css';

export const WhyUsBlockCard =(props)=>{
    const {WhyUsBlockCardH1, WhyUsBlockCardText} = props
    return <div className={styles.WhyUsBlockCard}>

        <img src={ProcentImg} className={styles.WhyUsBlockCardImg}/> 
        <h1 className={styles.WhyUsBlockCardH1}>{WhyUsBlockCardH1}</h1>
        <p className={styles.WhyUsBlockCardText}>{WhyUsBlockCardText}</p>

    </div>
}