import styles from './HeaderStyle.module.css';
import React from 'react';
import { Link } from 'react-router-dom';

export const Header =(props)=>{
    const {isAuthenticated} = props;

    return <div className={styles.Header} id = "Header">
        
        <div className={styles.HeaderLeft}>
            
            <button className={styles.HeaderLogoButton}>
                <Link to="/" className={styles.HeaderLeftLink}>Страхование онлаин</Link>
            </button>
            
            <div className={styles.HeaderLeftButtonContainer}>

                <button className={styles.HeaderLeftButton}>
                    <Link to="/AboutUs" className={styles.HeaderLeftButtonContainerLink}>О компании</Link>
                </button>
           
                <button className={styles.HeaderLeftButton}>Страховой случай</button>
                <button className={styles.HeaderLeftContactButton}>
                    <p className={styles.HeaderLeftContactButtonText}>Контакты: </p> <p className={styles.HeaderLeftContactButtonTextInText}>+7 495 123-45-67</p> 
                </button>
            </div>
        </div>

        <div className={styles.HeaderRight}>
            {(() => {
                if (isAuthenticated) {
                    return (
                        <Link to="/Profile" className={styles.HeaderRightLink}>
                            <button className={styles.HeaderRightButton}>Личный кабинет</button>
                        </Link>
                    );
                } 
                else {
                    return (
                        <>
                            <Link to="/SignUp" className={styles.HeaderRightLink}>
                                <button className={styles.HeaderRightButton}>Регистрация</button>
                            </Link>
                            
                            <Link to="/SignIn" className={styles.HeaderRightLink}>
                                <button className={styles.HeaderRightButton}>Авторизация</button>
                            </Link> 
                        </>
                    );
                }
            })()}
            
        </div>
        
    </div>
}