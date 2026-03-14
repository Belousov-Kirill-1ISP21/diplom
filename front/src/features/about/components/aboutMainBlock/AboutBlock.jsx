import styles from './AboutBlockStyle.module.css';
export const AboutBlock =(props)=>{

    const {AboutBlockH1, AboutBlockText, AboutBlockImg, isImgLeft} = props;
    return <div className={styles.AboutBlock}>

        {(() => {
                if (isImgLeft) {
                    return (
                        <div className={styles.AboutBlockContainer}>
                            <div className={styles.AboutBlockImgContainer}>
                                <img src={AboutBlockImg} className={styles.AboutBlockImg}/> 
                            </div>
                            <div className={styles.AboutBlockRightTextContainer}>
                                <h1 className={styles.AboutBlockRightH1}>{AboutBlockH1}</h1>
                                <p className={styles.AboutBlockRightText}>{AboutBlockText}</p>
                            </div>
                        </div>
                        
                    );
                } 
                else {
                    return (
                        <div className={styles.AboutBlockContainer}>
                            <div className={styles.AboutBlockTextContainer}>
                                <h1 className={styles.AboutBlockH1}>{AboutBlockH1}</h1>
                                <p className={styles.AboutBlockText}>{AboutBlockText}</p>
                            </div>
                            <div className={styles.AboutBlockImgContainer}>
                                <img src={AboutBlockImg} className={styles.AboutBlockImg}/> 
                            </div>
                        </div>
                    );
                }
            })()}
        
    </div>
}