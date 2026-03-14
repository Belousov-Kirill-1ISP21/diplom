import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

export const useProfileForm = () => {
    const { userData, updateUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState(userData || {});
    const [passwordError, setPasswordError] = useState('');
    const [tempPassword, setTempPassword] = useState(''); 

    useEffect(() => {
        if (userData) {
            setFormData(userData);
        }
    }, [userData]);

    const handleInputChange = (label, value, fieldMap) => {
        const key = fieldMap[label];
        setFormData(prev => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        setPasswordError('');
        setTempPassword(''); 
        setShowPasswordModal(true);
    };

    const confirmSave = (enteredPassword, onSuccess) => {
        if (enteredPassword === userData?.password) {
            updateUserData(formData);
            setShowPasswordModal(false);
            setIsEditing(false);
            setPasswordError('');
            if (onSuccess) onSuccess();
        } else {
            setPasswordError('Неверный пароль');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(userData || {});
    };

    const handleModalClose = () => {
        setShowPasswordModal(false);
        setPasswordError('');
        setTempPassword('');
    };

    return {
        isEditing,
        setIsEditing,
        showPasswordModal,
        formData,
        passwordError,
        tempPassword,
        setTempPassword,
        handleInputChange,
        handleSave,
        confirmSave,
        handleCancel,
        handleModalClose
    };
};