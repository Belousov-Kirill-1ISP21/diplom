import styles from './CatalogBlockStyle.module.css';
import { CatalogCard } from './CatalogCard'

const CatalogBlockCardProps = [
    {id:0, CatalogBlockCardH1:'ОСАГО', CatalogBlockCardText: 'Обязательное страхование автогражданской ответственности.\nОбеспечивает возмещение ущерба потерпевшим при ДТП. \nРасчёт стоимости производится с учётом индивидуальных параметров страхователя.\n Полис придёт на электронную почту сразу после оплаты.', CatalogBlockCardPrice: '2890 ₽'},
    {id:1, CatalogBlockCardH1:'КАСКО', CatalogBlockCardText: 'Добровольное страхование транспортного средства от ущерба и угона.\nЗащищает автомобиль при ДТП, пожаре, стихийных бедствиях и действиях третьих лиц.\nРемонт на официальных дилерских СТО за счёт страховой компании.\nПолис придёт на электронную почту сразу после оплаты.', CatalogBlockCardPrice: '2890 ₽'},
];

export const CatalogBlock =(props)=>{
    return <div className={styles.CatalogBlock}>

        <div className={styles.CatalogBlockHead}>
            <h1 className={styles.CatalogBlockHeadH1}>Выберите продукт</h1>
            <p className={styles.CatalogBlockHeadText}>Оформление ОСАГО и КАСКО онлайн — быстро, выгодно, надёжно</p>
        </div>

        <div className={styles.CatalogBlockContainer}>

            {CatalogBlockCardProps.map((CatalogBlockCardInfo,key)=><CatalogCard 
                                                    key={key}
                                                    CatalogBlockCardH1={CatalogBlockCardInfo.CatalogBlockCardH1} 
                                                    CatalogBlockCardText={CatalogBlockCardInfo.CatalogBlockCardText}
                                                    CatalogBlockCardPrice={CatalogBlockCardInfo.CatalogBlockCardPrice}
                                                />)}

        </div>
        
    </div>
}