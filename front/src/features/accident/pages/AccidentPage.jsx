import styles from './accidentStyle.module.css'
import { Header } from '../../../shared/layouts/Header'
import { AccidentBlock } from '../components/AccidentBlock'
import { Footer } from '../../../shared/layouts/Footer'

export const AccidentPage= (props)=>{

    return <div className={styles.wrapper}>

        <Header/>
        <AccidentBlock />
        <Footer/>

    </div>
}