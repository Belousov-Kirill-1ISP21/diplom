import styles from './forgotPasswordStyle.module.css';
import { ForgotPasswordForm } from '../components/forgotPassword/ForgotPasswordForm';
import { AuthHeader } from '../../../shared/layouts/auth/AuthHeader'
import { SideBackground } from '../../../shared/layouts/SideBackground'

export const ForgotPasswordPage = () => {
    return <div className={styles.wrapper}>

        <div className={styles.main}>
            <AuthHeader isSignUp={false}/>
            <ForgotPasswordForm />
        </div>
        <div className={styles.SideBackgroundContainer}>
            <SideBackground isDark={true}/>
        </div>

    </div>
};

