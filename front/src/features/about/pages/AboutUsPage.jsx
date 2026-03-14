import styles from './aboutUsStyle.module.css'
import { Header } from '../../../shared/layouts/Header'
import { AboutTitleBlock } from '../components/AboutTitleBlock'
import { AboutMainBlock } from '../components/aboutMainBlock/AboutMainBlock'
import { Footer } from '../../../shared/layouts/Footer'

export const AboutUsPage = (props)=>{

    return <div className={styles.wrapper}>

        <Header/>
        <AboutTitleBlock/>
        <AboutMainBlock/>
        <Footer/>

    </div>
}