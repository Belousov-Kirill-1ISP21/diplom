import TitleBlockImg from "../../../assets/Home/TitleBlock.png";
import ArrowImg from "../../../assets/Home/Arrow.png";
import styles from './TitleBlockStyle.module.css';
import { Link } from 'react-router-dom';

export const TitleBlock =(props)=>{
    return <div className={styles.TitleBlock}>
    
        <img src={TitleBlockImg} className={styles.TitleBlockImg}/> 
        <div className={styles.TitleBlockContainer}>

            <h1 className={styles.TitleBlockH1}>Страхование и защита вашего автомобиля</h1>
            <p className={styles.TitleBlockText}>ОСАГО и КАСКО — полная страховка на любой случай</p>
            
            <Link to="/Calculator" className={styles.TitleBlockLink}>
                <button className={styles.TitleBlockButton}>
                    
                    <p className={styles.TitleBlockButtonText}>Застраховать</p>
                    <img src={ArrowImg} className={styles.TitleBlockButtonImg}/>
                    
                </button>
            </Link>
            

        </div>

    </div>
}