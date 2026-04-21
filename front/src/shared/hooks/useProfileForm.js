import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

export const useProfileForm = () => {
    const { fullUserData, updateUserData, updateUserPassword } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordError, setPasswordError] = useState('');
    const [pendingChanges, setPendingChanges] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        if (fullUserData) {
            console.log('=== fullUserData ===');
            console.log('driver_categories:', fullUserData.driver_categories);
            
            setFormData({
                surname: fullUserData.surname || '',
                name: fullUserData.name || '',
                patronymic: fullUserData.patronymic || '',
                birthDate: fullUserData.birthDate || '',
                email: fullUserData.email || '',
                phone: fullUserData.phone || '',
                passportSeries: fullUserData.passportSeries || '',
                passportNumber: fullUserData.passportNumber || '',
                issuedBy: fullUserData.issuedBy || '',
                issueDate: fullUserData.issueDate || '',
                licenseSeries: fullUserData.licenseSeries || '',
                licenseNumber: fullUserData.licenseNumber || '',
                licenseIssuedBy: fullUserData.licenseIssuedBy || '',
                licenseIssueDate: fullUserData.licenseIssueDate || '',
                licenseExpiryDate: fullUserData.licenseExpiryDate || '',
                driverCategories: Array.isArray(fullUserData.driver_categories) 
                    ? fullUserData.driver_categories.map(cat => cat.code).join(', ') 
                    : (fullUserData.driver_categories || ''),
                password: '',
            });
        }
    }, [fullUserData]);

    const handleInputChange = (label, value, fieldMap) => {
        const key = fieldMap[label];
        setFormData(prev => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        setPasswordError('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPendingChanges(formData);
        setShowPasswordModal(true);
    };

    const validateNewPassword = (password) => {
        if (!password || password.trim() === '') {
            return null; // Пароль не меняется
        }
        if (password.length < 8) {
            return 'Новый пароль должен содержать минимум 8 символов';
        }
        if (password.length > 32) {
            return 'Новый пароль должен содержать максимум 32 символа';
        }
        if (!/[A-ZА-Я]/.test(password)) {
            return 'Новый пароль должен содержать хотя бы одну заглавную букву';
        }
        if (!/[a-zа-я]/.test(password)) {
            return 'Новый пароль должен содержать хотя бы одну строчную букву';
        }
        if (!/[0-9]/.test(password)) {
            return 'Новый пароль должен содержать хотя бы одну цифру';
        }
        return null;
    };

    const confirmSave = async (enteredPassword, onSuccess) => {
        // Валидация текущего пароля
        if (!enteredPassword || enteredPassword.trim() === '') {
            setPasswordError('Введите текущий пароль');
            return;
        }
        
        // Валидация нового пароля
        const newPwd = pendingChanges?.password;
        if (newPwd && newPwd.trim() !== '') {
            const validationError = validateNewPassword(newPwd);
            if (validationError) {
                setPasswordError(validationError);
                return;
            }
            if (newPwd === enteredPassword) {
                setPasswordError('Новый пароль должен отличаться от текущего');
                return;
            }
        }
        
        try {
            const profileData = { ...pendingChanges };
            delete profileData.password;
            
            await updateUserData(profileData);
            
            if (newPwd && newPwd.trim() !== '') {
                await updateUserPassword(enteredPassword, newPwd);
            }
            
            setShowPasswordModal(false);
            setIsEditing(false);
            setPendingChanges(null);
            setPasswordError('');
            setNewPassword('');
            setConfirmNewPassword('');
            if (onSuccess) onSuccess();
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Ошибка при сохранении');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            surname: fullUserData?.surname || '',
            name: fullUserData?.name || '',
            patronymic: fullUserData?.patronymic || '',
            birthDate: fullUserData?.birthDate || '',
            email: fullUserData?.email || '',
            phone: fullUserData?.phone || '',
            passportSeries: fullUserData?.passportSeries || '',
            passportNumber: fullUserData?.passportNumber || '',
            issuedBy: fullUserData?.issuedBy || '',
            issueDate: fullUserData?.issueDate || '',
            licenseSeries: fullUserData?.licenseSeries || '',
            licenseNumber: fullUserData?.licenseNumber || '',
            licenseIssuedBy: fullUserData?.licenseIssuedBy || '',
            licenseIssueDate: fullUserData?.licenseIssueDate || '',
            licenseExpiryDate: fullUserData?.licenseExpiryDate || '',
            driverCategories: Array.isArray(fullUserData?.driver_categories) 
                ? fullUserData.driver_categories.map(cat => cat.code).join(', ') 
                : (fullUserData?.driver_categories || ''),
            password: '',
        });
        setPendingChanges(null);
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleModalClose = () => {
        setShowPasswordModal(false);
        setPasswordError('');
        setPendingChanges(null);
        setNewPassword('');
        setConfirmNewPassword('');
    };

    return {
        isEditing,
        setIsEditing,
        showPasswordModal,
        formData,
        passwordError,
        newPassword,
        confirmNewPassword,
        handleInputChange,
        handleSave,
        confirmSave,
        handleCancel,
        handleModalClose,
        setNewPassword,
        setConfirmNewPassword
    };
};