import styles from './WhyUsBlockStyle.module.css';
import { WhyUsBlockCard } from './WhyUsBlockCard'

const WhyUsBlockCardProps = [
    {id:0, WhyUsBlockCardH1:'Помощь при ДТП', WhyUsBlockCardText: 'Если у вас случилось ДТП - просто позвоните нам и мы подскажем порядок действий'},
    {id:1, WhyUsBlockCardH1:'Юридическое сопровождение', WhyUsBlockCardText: 'Представительство в суде, юридические консультации даже по сымым сложным вопросам'},
    {id:2, WhyUsBlockCardH1:'Скидки постоянным клиентам', WhyUsBlockCardText: 'Накопительная система скидок. Получите выгоду до 80%'},
    {id:3, WhyUsBlockCardH1:'Доставка полиса на дом', WhyUsBlockCardText: 'Доставим полис на дом в любое удобное для вас время'}
];

export const WhyUsBlock =(props)=>{
    return  <div className={styles.WhyUsBlock}>
        
        <div className={styles.WhyUsBlockHeader}>
            <h1 className={styles.WhyUsBlockHeaderH1}>Почему доверяют</h1>
            <p className={styles.WhyUsBlockHeaderText}>Более</p> 
            <p className={styles.WhyUsBlockHeaderTextInText}>10 000</p> 
            <p className={styles.WhyUsBlockHeaderText}>клиентов доверили нашему агентству страхование транспортных средств</p>
        </div>

        <div className={styles.WhyUsBlockContainer}>

            {WhyUsBlockCardProps.map((WhyUsBlockCardInfo,key)=><WhyUsBlockCard 
                                                    key={key}
                                                    WhyUsBlockCardH1={WhyUsBlockCardInfo.WhyUsBlockCardH1} 
                                                    WhyUsBlockCardText={WhyUsBlockCardInfo.WhyUsBlockCardText}
                                                />)}

        </div>
    </div>

}