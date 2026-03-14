import FacebookImg from "../../assets/Footer/Facebook.png";
import InstagramImg from "../../assets/Footer/Instagram.png";
import TwitterImg from "../../assets/Footer/Twitter.png";
import VKImg from "../../assets/Footer/VK.png";
import styles from './FooterStyle.module.css';
import { Link } from 'react-router-dom';
import { scrollToElement } from "../utils/scrollToElement";

export const Footer =(props)=>{

    return <div className={styles.Footer}> 

        <div className={styles.FooterImgContainer}>
            <img  src={FacebookImg} className={styles.FooterImg}/>
            <img src={InstagramImg} className={styles.FooterImg}/>
            <img src={TwitterImg} className={styles.FooterImg}/> 
            <img src={VKImg} className={styles.FooterImg}/>
        </div>

        <div className={styles.FooterButtonContainer}>
            <button className={styles.FooterButton}>
                <Link to="/AboutUs" className={styles.FooterButtonContainerLink}>О компании</Link>
            </button>

            <button className={styles.FooterButton}>Страховой случай</button>
            <button className={styles.FooterButton} onClick={() => scrollToElement("Header")}>Контакты</button>
        </div>

        <p className={styles.FooterText}>©2026 Страхование онлаин</p>

    </div>
        
}