import { useState, useEffect } from 'react'
import styles from './MainPanelStyle.module.css'
import { MainPanelLine } from './MainPanelLine'
import { PasswordModal } from '../PasswordModal'
import { useAuth } from '../../../../shared/context/authContext'

export const MainPanel = (props) => {
    const { userData, updateUserData } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [formData, setFormData] = useState(userData || {})
    const [passwordError, setPasswordError] = useState('')

    useEffect(() => {
        if (userData) {
            setFormData(userData)
        }
    }, [userData])

    const MainPanelLineProps = [
        {id:0, label:'Фамилия', value: formData?.surname || '', key: 'surname'},
        {id:1, label:'Имя', value: formData?.name || '', key: 'name'},
        {id:2, label:'Отчество', value: formData?.patronymic || '', key: 'patronymic'},
        {id:3, label:'Email', value: formData?.email || '', key: 'email'},
        {id:4, label:'Телефон', value: formData?.phone || '', key: 'phone'},
        {id:5, label:'Серия паспорта', value: formData?.passportSeries || '', key: 'passportSeries'},
        {id:6, label:'Номер паспорта', value: formData?.passportNumber || '', key: 'passportNumber'},
        {id:7, label:'Кем выдан', value: formData?.issuedBy || '', key: 'issuedBy'},
        {id:8, label:'Дата выдачи', value: formData?.issueDate || '', key: 'issueDate'},
        {id:9, label:'Серия ВУ', value: formData?.licenseSeries || '', key: 'licenseSeries'},
        {id:10, label:'Номер ВУ', value: formData?.licenseNumber || '', key: 'licenseNumber'},
        {id:11, label:'Кем выдано ВУ', value: formData?.licenseIssuedBy || '', key: 'licenseIssuedBy'},
        {id:12, label:'Дата выдачи ВУ', value: formData?.licenseIssueDate || '', key: 'licenseIssueDate'},
        {id:13, label:'Дата окончания действия ВУ', value: formData?.licenseExpiryDate || '', key: 'licenseExpiryDate'},
        {id:14, label:'Категория', value: formData?.licenseCategory || '', key: 'licenseCategory'},
        {id:15, label:'Пароль', value: formData?.password || '', key: 'password', isPassword: true},
    ]

    const handleInputChange = (label, value) => {
        const fieldMap = {
            'Фамилия': 'surname',
            'Имя': 'name',
            'Отчество': 'patronymic',
            'Email': 'email',
            'Телефон': 'phone',
            'Серия паспорта': 'passportSeries',
            'Номер паспорта': 'passportNumber',
            'Кем выдан': 'issuedBy',
            'Дата выдачи': 'issueDate',
            'Серия ВУ': 'licenseSeries',
            'Номер ВУ': 'licenseNumber',
            'Кем выдано ВУ': 'licenseIssuedBy',
            'Дата выдачи ВУ': 'licenseIssueDate',
            'Дата окончания действия ВУ': 'licenseExpiryDate',
            'Категория': 'licenseCategory',
            'Пароль': 'password'
        }
        
        const key = fieldMap[label]
        setFormData(prev => ({...prev, [key]: value}))
    }

    const handleSave = () => {
        setPasswordError('')
        setShowPasswordModal(true)
    }

    const confirmSave = (enteredPassword) => {
        if (enteredPassword === userData?.password) {
            updateUserData(formData)
            setShowPasswordModal(false)
            setIsEditing(false)
            setPasswordError('')
        } else {
            setPasswordError('Неверный пароль')
        }
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
                            isPassword={item.isPassword}
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
                onClose={() => {
                    setShowPasswordModal(false)
                    setPasswordError('')
                }}
                onConfirm={confirmSave}
                error={passwordError}
            />
        </>
    )
}