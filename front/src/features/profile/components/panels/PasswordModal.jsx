import { useState } from 'react'
import styles from './PasswordModal.module.css'

export const PasswordModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    error,
    newPassword,
    confirmNewPassword,
    onNewPasswordChange,
    onConfirmNewPasswordChange
}) => {
    const [currentPassword, setCurrentPassword] = useState('')

    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm(currentPassword)
        setCurrentPassword('')
    }

    const handleClose = () => {
        setCurrentPassword('')
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
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoFocus
                />
                
                <p className={styles.newPasswordHint}>Если хотите сменить пароль, заполните поля ниже</p>
                
                <input 
                    type="password" 
                    placeholder="Новый пароль (минимум 8 символов)"
                    className={styles.modalInput}
                    value={newPassword}
                    onChange={(e) => onNewPasswordChange(e.target.value)}
                />
                
                <input 
                    type="password" 
                    placeholder="Подтверждение нового пароля"
                    className={styles.modalInput}
                    value={confirmNewPassword}
                    onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
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