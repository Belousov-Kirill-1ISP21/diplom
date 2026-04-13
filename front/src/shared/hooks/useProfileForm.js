import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

export const useProfileForm = () => {
    const { fullUserData, updateUserData, updateUserPassword } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordError, setPasswordError] = useState('');
    const [pendingChanges, setPendingChanges] = useState(null);

    useEffect(() => {
        if (fullUserData) {
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
                licenseCategory: fullUserData.licenseCategory || '',
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
        setPendingChanges(formData);
        setShowPasswordModal(true);
    };

    const confirmSave = async (enteredPassword, onSuccess) => {
        try {
            // Отправляем данные профиля (без пароля)
            const profileData = { ...pendingChanges };
            delete profileData.password;
            
            await updateUserData(profileData);
            
            // Если пароль был изменен
            if (pendingChanges.password && pendingChanges.password.trim() !== '') {
                await updateUserPassword(enteredPassword, pendingChanges.password);
            }
            
            setShowPasswordModal(false);
            setIsEditing(false);
            setPendingChanges(null);
            setPasswordError('');
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
            licenseCategory: fullUserData?.licenseCategory || '',
            password: '',
        });
        setPendingChanges(null);
    };

    const handleModalClose = () => {
        setShowPasswordModal(false);
        setPasswordError('');
        setPendingChanges(null);
    };

    return {
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
    };
};