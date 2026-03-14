import { useState } from 'react'
import styles from './PasswordModal.module.css'

export const PasswordModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    error
}) => {
    const [password, setPassword] = useState('')

    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm(password)
        setPassword('')
    }

    const handleClose = () => {
        setPassword('')
        onClose()
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Подтверждение</h2>
                <p>Введите текущий пароль для сохранения изменений</p>
                <input 
                    type="password" 
                    placeholder="Текущий пароль"
                    className={styles.modalInput}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
                
                <div className={styles.modalButtons}>
                    <button onClick={handleClose}>Отмена</button>
                    <button onClick={handleConfirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    )
}