import styles from './PasswordModal.module.css'

export const PasswordModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Подтверждение</h2>
                <p>Введите пароль для сохранения изменений</p>
                <input 
                    type="password" 
                    placeholder="Пароль"
                    className={styles.modalInput}
                />
                <div className={styles.modalButtons}>
                    <button onClick={onClose}>Отмена</button>
                    <button onClick={onConfirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    )
}