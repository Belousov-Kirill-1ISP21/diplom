import styles from './calculatorStyle.module.css'
import { Header } from '../../../shared/layouts/Header'
import { CalculatorBlock } from '../components/CalculatorBlock'
import { Footer } from '../../../shared/layouts/Footer'

export const CalculatorPage= (props)=>{

    return <div className={styles.wrapper}>

        <Header/>
        <CalculatorBlock />
        <Footer/>

    </div>
}