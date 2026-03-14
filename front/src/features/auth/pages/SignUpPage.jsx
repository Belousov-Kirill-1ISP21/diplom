import styles from './signUpStyle.module.css'
import { AuthHeader } from '../../../shared/layouts/auth/AuthHeader'
import { SignUpForm } from '../components/signUp/SignUpForm'
import { SideBackground } from '../../../shared/layouts/SideBackground'

export const SignUpPage = (props)=>{

    return <div className={styles.wrapper}>
        
        <div className={styles.main}>
            <AuthHeader isSignUp={true}/>
            <SignUpForm/>
        </div>
        <div className={styles.SideBackgroundContainer}>
            <SideBackground isDark={true}/>
        </div>

    </div>
}