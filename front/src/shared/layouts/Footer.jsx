import ZenImg from "../../assets/Footer/Zen.webp";
import MaxmImg from "../../assets/Footer/Max.webp";
import OKImg from "../../assets/Footer/OK.webp";
import VKImg from "../../assets/Footer/VK.webp";
import styles from './FooterStyle.module.css';
import { Link } from 'react-router-dom';
import { scrollToElement } from "../utils/scrollToElement";

export const Footer =(props)=>{

    return <div className={styles.Footer}> 

        <div className={styles.FooterImgContainer}>
            <img  src={MaxmImg} className={styles.FooterImg}/>
            <img src={OKImg} className={styles.FooterImg}/>
            <img src={ZenImg} className={styles.FooterImg}/> 
            <img src={VKImg} className={styles.FooterImg}/>
        </div>

        <div className={styles.FooterButtonContainer}>
            <button className={styles.FooterButton}>
                <Link to="/AboutUs" className={styles.FooterButtonContainerLink}>О компании</Link>
            </button>
            <button className={styles.FooterButton}>
                <Link to="/Accident" className={styles.FooterButtonContainerLink}>Страховой случай</Link>
            </button>
            <button className={styles.FooterButton} onClick={() => scrollToElement("Header")}>Контакты</button>
        </div>

        <p className={styles.FooterText}>©2026 Страхование онлаин</p>

    </div>
        
}