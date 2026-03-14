import styles from './signInStyle.module.css'
import { AuthHeader } from '../../../shared/layouts/auth/AuthHeader'
import { SignInForm } from '../components/signIn/SignInForm'
import { SideBackground } from '../../../shared/layouts/SideBackground'

export const SignInPage = (props)=>{

    return <div className={styles.wrapper}>

        <div className={styles.main}>
            <AuthHeader isSignUp={false}/>
            <SignInForm/>
        </div>
        <div className={styles.SideBackgroundContainer}>
            <SideBackground isDark={true}/>
        </div>

    </div>
}