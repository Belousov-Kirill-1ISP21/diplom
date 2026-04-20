import styles from './CatalogCardStyle.module.css';
import { Link } from 'react-router-dom';

export const CatalogCard = (props) => {
    const { CatalogBlockCardH1, CatalogBlockCardText, CatalogBlockCardPrice } = props;
    const textLines = CatalogBlockCardText.split('\n').filter(line => line.trim() !== '');
    
    return (
        <div className={styles.CatalogBlockCard}>
            <div className={styles.CatalogBlockCardH1Container}>
                <h1 className={styles.CatalogBlockCardH1}>{CatalogBlockCardH1}</h1>
            </div>
            
            <div className={styles.CatalogBlockCardTextContainer}>
                <ul className={styles.CatalogBlockCardList}>
                    {textLines.map((line, index) => (
                        <li key={index} className={styles.CatalogBlockCardListItem}>
                            {line}
                        </li>
                    ))}
                </ul>
            </div> 
            
            <div className={styles.CatalogBlockCardPriceContainer}>
                <p className={styles.CatalogBlockCardText}>от </p>
                <p className={styles.CatalogBlockCardTextInPrice}>{CatalogBlockCardPrice}</p>
            </div>
            
            <div className={styles.CatalogBlockCardButtonContainer}>
                <Link to="/Catalog" className={styles.CatalogBlockCardContainerLink}>
                    <button className={styles.CatalogBlockCardButton}>Заказать</button>
                </Link>
            </div>
        </div>
    );
};