import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './ForgotPasswordForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../../../api/auth';
import { TextInput } from '../../../../shared/components/TextInput.jsx';

// Схема для email
const emailSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email обязателен')
        .email('Введите корректный email')
});

// Схема для кода
const codeSchema = yup.object().shape({
    code: yup
        .string()
        .required('Введите код подтверждения')
        .length(4, 'Код должен состоять из 4 цифр')
        .matches(/^\d+$/, 'Код должен содержать только цифры')
});

// Схема для нового пароля
const resetSchema = yup.object().shape({
    password: yup
        .string()
        .required('Пароль обязателен')
        .min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: yup
        .string()
        .required('Подтвердите пароль')
        .oneOf([yup.ref('password')], 'Пароли должны совпадать')
});

export const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm({
        resolver: yupResolver(emailSchema),
        mode: 'onChange'
    });

    const { register: registerCode, handleSubmit: handleSubmitCode, formState: { errors: codeErrors } } = useForm({
        resolver: yupResolver(codeSchema),
        mode: 'onChange'
    });

    const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm({
        resolver: yupResolver(resetSchema),
        mode: 'onChange'
    });

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
            // Проверяем код (для демо - 4444)
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

    return (
        <div className={styles.forgotPasswordForm}>
            <div className={styles.card}>
                <h1 className={styles.title}>
                    {step === 1 && 'Восстановление пароля'}
                    {step === 2 && 'Подтверждение кода'}
                    {step === 3 && 'Новый пароль'}
                </h1>
                
                {step === 1 && (
                    <form onSubmit={handleSubmitEmail(onSendCode)}>
                        <p className={styles.description}>
                            Введите ваш email, и мы отправим код для восстановления пароля
                        </p>
                        
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <TextInput
                                className={styles.input}
                                placeholder="Введите ваш email"
                                type="email"
                                register={registerEmail('email')}
                                error={emailErrors.email}
                                errorClassName={styles.errorMessage}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Отправка...' : 'Отправить код'}
                        </button>

                        <div className={styles.links}>
                            <Link to="/SignIn" className={styles.link}>
                                Вернуться ко входу
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmitCode(onVerifyCode)}>
                        <p className={styles.description}>
                            Введите код, отправленный на {email}
                            <br />
                            <span className={styles.demoHint}>(Для демонстрации используйте код: 4444)</span>
                        </p>
                        
                        <div className={styles.formGroup}>
                            <label>Код подтверждения</label>
                            <TextInput
                                className={styles.input}
                                placeholder="Введите 4-значный код"
                                type="text"
                                register={registerCode('code')}
                                error={codeErrors.code}
                                errorClassName={styles.errorMessage}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Проверка...' : 'Подтвердить код'}
                        </button>

                        <div className={styles.links}>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className={styles.linkButton}
                            >
                                Назад
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmitReset(onResetPassword)}>
                        <p className={styles.description}>
                            Придумайте новый надежный пароль
                        </p>

                        <div className={styles.formGroup}>
                            <label>Новый пароль</label>
                            <TextInput
                                className={styles.input}
                                placeholder="Введите новый пароль"
                                type="password"
                                register={registerReset('password')}
                                error={resetErrors.password}
                                errorClassName={styles.errorMessage}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Подтверждение пароля</label>
                            <TextInput
                                className={styles.input}
                                placeholder="Подтвердите новый пароль"
                                type="password"
                                register={registerReset('confirmPassword')}
                                error={resetErrors.confirmPassword}
                                errorClassName={styles.errorMessage}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {success && <div className={styles.success}>{success}</div>}

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить пароль'}
                        </button>

                        <div className={styles.links}>
                            <Link to="/SignIn" className={styles.link}>
                                Вернуться ко входу
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};