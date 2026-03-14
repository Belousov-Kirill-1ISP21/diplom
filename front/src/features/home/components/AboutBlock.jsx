import AboutBlockImg from "../../../assets/Home/AboutBlock.png";
import styles from './AboutBlockStyle.module.css';
import { Link } from 'react-router-dom';

export const AboutBlock =(props)=>{
    return <div className={styles.AboutBlock}>

        <div className={styles.AboutBlockContainer}>
                
            <h1 className={styles.AboutBlockH1}>Будьте уверенными в завтрашнем дне</h1>

            <p className={styles.AboutBlockText}>Юристы компании «Юридическое Бюро 812» уже долгие годы ведут успешную практику в предоставлении услуг 
            физическим и юридическим лицам в различных правовых сферах, решая вопросы любой сложности. </p>

            <Link to="/AboutUs" className={styles.AboutBlockLink}>
                <button className={styles.AboutBlockButton}>Подробнее</button>
            </Link>

        </div>

        <img src={AboutBlockImg} className={styles.AboutBlockImg}/>

    </div>
}