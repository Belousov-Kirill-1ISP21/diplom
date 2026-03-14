import styles from './AuthHeaderStyle.module.css';
import { Link } from 'react-router-dom';

export const AuthHeader =(props)=>{
    const {isSignUp} = props;

    return <div className={styles.AuthHeader}>

        <div className={styles.AuthHeaderContainer}>   

            <Link to="/" className={styles.AuthHeaderLogoButtonLink}>
                <button className={styles.AuthHeaderLogoButton}>Главная</button>
            </Link>
        
            {(() => {
                if (isSignUp) {
                    return (
                        <Link to="/SignIn" className={styles.AuthHeaderRightLink}>
                            <button className={styles.AuthHeaderRightButton}>Авторизация</button>
                        </Link>
                    );
                } 
                else {
                    return (
                        <>
                            <Link to="/SignUp" className={styles.AuthHeaderRightLink}>
                                <button className={styles.AuthHeaderRightButton}>Регистрация</button>
                            </Link> 
                        </>
                    );
                }
            })()}
            
        </div>
        
    </div>
}