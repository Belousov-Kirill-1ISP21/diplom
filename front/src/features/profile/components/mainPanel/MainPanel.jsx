import { useState } from 'react'
import styles from './MainPanelStyle.module.css'
import { MainPanelLine } from './MainPanelLine'
import { PasswordModal } from '../PasswordModal'

// Данные пользователя из регистрации
const userData = {
    surname: 'Иванов',
    name: 'Иван',
    patronymic: 'Иванович',
    email: 'ivan@mail.com',
    phone: '+79991234567',
    passportSeries: '1234',
    passportNumber: '567890',
    issuedBy: 'УФМС',
    issueDate: '01.01.2020',
    licenseSeries: '1234',
    licenseNumber: '567890',
    licenseIssuedBy: 'ГИБДД',
    licenseIssueDate: '01.01.2020',
    licenseExpiryDate: '01.01.2030',
    licenseCategory: 'B'
}

export const MainPanel = (props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [formData, setFormData] = useState(userData)

    const MainPanelLineProps = [
        {id:0, label:'Фамилия', value: formData.surname},
        {id:1, label:'Имя', value: formData.name},
        {id:2, label:'Отчество', value: formData.patronymic},
        {id:3, label:'Email', value: formData.email},
        {id:4, label:'Телефон', value: formData.phone},
        {id:5, label:'Серия паспорта', value: formData.passportSeries},
        {id:6, label:'Номер паспорта', value: formData.passportNumber},
        {id:7, label:'Кем выдан', value: formData.issuedBy},
        {id:8, label:'Дата выдачи', value: formData.issueDate},
        {id:9, label:'Серия ВУ', value: formData.licenseSeries},
        {id:10, label:'Номер ВУ', value: formData.licenseNumber},
        {id:11, label:'Кем выдано ВУ', value: formData.licenseIssuedBy},
        {id:12, label:'Дата выдачи ВУ', value: formData.licenseIssueDate},
        {id:13, label:'Дата окончания действия ВУ', value: formData.licenseExpiryDate},
        {id:14, label:'Категория', value: formData.licenseCategory},
    ]

    const handleInputChange = (label, value) => {
        setFormData(prev => ({...prev, [label]: value}))
    }

    const handleSave = () => {
        setShowPasswordModal(true)
    }

    const confirmSave = () => {
        console.log('Сохраняем данные:', formData)
        setShowPasswordModal(false)
        setIsEditing(false)
    }

    return (
        <>
            <div className={styles.MainPanel}>
                <div className={styles.MainPanelHead}>
                    <h1 className={styles.MainPanelHeadH1}>Личная информация</h1>
                    <p className={styles.MainPanelHeadText}>Редактирование профиля</p>
                </div>

                <div className={styles.MainPanelContainer}>
                    {MainPanelLineProps.map((item, key) => (
                        <MainPanelLine 
                            key={key}
                            label={item.label}
                            value={item.value}
                            isEditing={isEditing}
                            onChange={handleInputChange}
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
                            <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
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
                onClose={() => setShowPasswordModal(false)}
                onConfirm={confirmSave}
            />
        </>
    )
}