import styles from './MainPanelLineStyle.module.css'

export const MainPanelLine = (props) => {
    const {label, value, isEditing, onChange} = props

    const handleChange = (e) => {
        onChange(label, e.target.value)
    }

    return <div className={styles.MainPanelLine}>
        <h1 className={styles.MainPanelLineH1}>{label}</h1>
        {isEditing ? (
            <input 
                type="text" 
                value={value} 
                onChange={handleChange}
                className={styles.editInput}
            />
        ) : (
            <p className={styles.MainPanelLineText}>{value}</p>
        )}     
    </div>
}