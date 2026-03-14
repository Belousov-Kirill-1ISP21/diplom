import styles from './MainPanelStyle.module.css';
import { MainPanelLine } from './MainPanelLine';
import { PasswordModal } from '../PasswordModal';
import { PROFILE_FIELDS, PROFILE_FIELD_MAP } from '../../../../shared/config/fields';
import { useProfileForm } from '../../../../shared/hooks/useProfileForm';

export const MainPanel = (props) => {
    const {
        isEditing,
        setIsEditing,
        showPasswordModal,
        formData,
        passwordError,
        handleInputChange,
        handleSave,
        confirmSave,
        handleCancel,
        handleModalClose
    } = useProfileForm();

    return (
        <>
            <div className={styles.MainPanel}>
                <div className={styles.MainPanelHead}>
                    <h1 className={styles.MainPanelHeadH1}>Личная информация</h1>
                    <p className={styles.MainPanelHeadText}>Редактирование профиля</p>
                </div>

                <div className={styles.MainPanelContainer}>
                    {PROFILE_FIELDS.map((item) => (
                        <MainPanelLine 
                            key={item.id}
                            label={item.label}
                            value={formData[item.key] || ''}
                            isEditing={isEditing}
                            isPassword={item.isPassword}
                            type={item.type}
                            onChange={(label, value) => handleInputChange(label, value, PROFILE_FIELD_MAP)}
                        />
                    ))}
                </div>

                <div className={styles.MainPanelButtonContainer}>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                            Редактировать
                        </button>
                    ) : (
                        <>
                            <button onClick={handleCancel} className={styles.cancelButton}>
                                Отмена
                            </button>
                            <button onClick={handleSave} className={styles.saveButton}>
                                Сохранить изменения
                            </button>
                        </>
                    )}
                </div>
            </div>

            <PasswordModal 
                isOpen={showPasswordModal}
                onClose={handleModalClose}
                onConfirm={(password) => confirmSave(password, handleModalClose)}
                error={passwordError}
            />
        </>
    );
};