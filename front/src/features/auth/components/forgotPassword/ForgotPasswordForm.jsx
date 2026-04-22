import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './ForgotPasswordForm.module.css';
import { Link } from 'react-router-dom';
import { TextInput } from '../../../../shared/components/TextInput.jsx';
import { useForgotPassword } from '../../../../shared/hooks/auth/useForgotPassword.js';

const emailSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email обязателен')
        .email('Введите корректный email')
});

const codeSchema = yup.object().shape({
    code: yup
        .string()
        .required('Введите код подтверждения')
        .length(4, 'Код должен состоять из 4 цифр')
        .matches(/^\d+$/, 'Код должен содержать только цифры')
});

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
    const {
        step,
        email,
        error,
        success,
        loading,
        onSendCode,
        onVerifyCode,
        onResetPassword,
        goBack
    } = useForgotPassword();

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
                                onClick={goBack}
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