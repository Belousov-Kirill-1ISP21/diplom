import styles from './AboutMainBlockStyle.module.css';
import { AboutBlock } from './AboutBlock'
import AboutBlock1Img from "../../../../assets/AboutUs/AboutBlock1.png";
import AboutBlock2Img from "../../../../assets/AboutUs/AboutBlock2.png";
import AboutBlock3Img from "../../../../assets/AboutUs/AboutBlock3.png";

const AboutBlockProps = [
    {id:0, AboutBlockH1:'Надёжность', AboutBlockText: 'Нашу надежность и финансовую устойчивость подтверждают рейтинги ведущих рейтинговых агентств: ruАAA по шкале «Эксперт РА», ААА |ru| по шкале «Национального Рейтингового Агентства» и AAA.ru по шкале «Национальные Кредитные Рейтинги» (НКР).',
    AboutBlockImg: AboutBlock1Img, isImgLeft: false},
    {id:1, AboutBlockH1:'Забота о клиентах', AboutBlockText: 'Наша работа – ежедневная забота о вас, наших клиентах! Развиваем дистанционные каналы, чтобы вам было удобнее с нами. Работаем над тем, чтобы наши продукты создавали для вас чувство уверенности. Оперативно отвечаем во всех каналах коммуникации.',
    AboutBlockImg: AboutBlock2Img, isImgLeft: true},
    {id:2, AboutBlockH1:'Лицензии', AboutBlockText: 'В соответствии с Лицензиями, выданными Банком России 25.05.2015 без ограничения срока их действия, СИ № 1307, СЛ №1307, ОС №1307-03, ОС №1307-04, ОС №1307-05, ПС №1307, Компания имеет разрешение на осуществление практически всех видов страхования и перестрахования, разрешенные законодательством РФ',
    AboutBlockImg: AboutBlock3Img, isImgLeft: false},
];

export const AboutMainBlock =(props)=>{
    
    return <div className={styles.AboutMainBlock}>

        <div className={styles.AboutMainBlockH1Container}>
            <h1 className={styles.AboutMainBlockH1}>О нашей компании</h1>
        </div>

        <div className={styles.AboutMainBlockBlockContainer}>
            {AboutBlockProps.map((AboutBlockInfo,key)=><AboutBlock 
                                                key={key}
                                                AboutBlockH1={AboutBlockInfo.AboutBlockH1} 
                                                AboutBlockText={AboutBlockInfo.AboutBlockText}
                                                AboutBlockImg={AboutBlockInfo.AboutBlockImg} 
                                                isImgLeft={AboutBlockInfo.isImgLeft}
                                            />)}
        </div>

    </div>
}