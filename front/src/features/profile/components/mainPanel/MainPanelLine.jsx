import styles from './MainPanelLineStyle.module.css'

export const MainPanelLine = (props) => {
    const {label, value, isEditing, isPassword, type, onChange} = props

    const handleChange = (e) => {
        onChange(label, e.target.value)
    }

    const getMaskedPassword = () => {
        if (!value) return ''
        return '•'.repeat(value.length)
    }

    return <div className={styles.MainPanelLine}>
        <h1 className={styles.MainPanelLineH1}>{label}</h1>
        {isEditing ? (
            <input 
                type={isPassword ? "password" : (type || "text")}
                value={value}
                onChange={handleChange}
                className={styles.editInput}
                placeholder={isPassword ? 'Введите новый пароль' : ''}
            />
        ) : (
            <p className={styles.MainPanelLineText}>
                {isPassword ? getMaskedPassword() : value}
            </p>
        )}     
    </div>
}