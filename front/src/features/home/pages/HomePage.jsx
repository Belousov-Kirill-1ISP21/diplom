import styles from './homeStyle.module.css'
import { Header } from '../../../shared/layouts/Header'
import { TitleBlock } from '../components/TitleBlock'
import { AboutBlock } from '../components/AboutBlock'
import { CatalogBlock } from '../components/catalogBlock/CatalogBlock'
import { WhyUsBlock } from '../components/whyUsBlock/WhyUsBlock'
import { Footer } from '../../../shared/layouts/Footer'

export const HomePage = (props)=>{

    return <div className={styles.wrapper}>
        
        <Header/>
        <TitleBlock/>
        <AboutBlock/>
        <CatalogBlock/>
        <WhyUsBlock/>
        <Footer/>
  
    </div>
}