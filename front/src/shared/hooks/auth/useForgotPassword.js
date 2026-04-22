import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../../api/auth';

export const useForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const onSendCode = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await forgotPassword(data.email);
            setEmail(data.email);
            setStep(2);
            setSuccess(`Код подтверждения отправлен на ${data.email}`);
        } catch (error) {
            setError(error.response?.data?.message || 'Пользователь с таким email не найден');
        } finally {
            setLoading(false);
        }
    };

    const onVerifyCode = async (data) => {
        setLoading(true);
        setError('');
        
        try {
            if (data.code !== '4444') {
                setError('Неверный код подтверждения');
                setLoading(false);
                return;
            }
            setStep(3);
            setSuccess('Код подтвержден. Введите новый пароль');
        } catch (error) {
            setError('Ошибка проверки кода');
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            await resetPassword(email, '4444', data.password, data.confirmPassword);
            setSuccess('Пароль успешно изменен! Сейчас вы будете перенаправлены на страницу входа');
            setTimeout(() => {
                navigate('/SignIn');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при сбросе пароля');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        setStep(1);
        setError('');
        setSuccess('');
    };

    return {
        step,
        email,
        error,
        success,
        loading,
        onSendCode,
        onVerifyCode,
        onResetPassword,
        goBack
    };
};