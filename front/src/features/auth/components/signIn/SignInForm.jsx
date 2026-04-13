import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import styles from './SignInFormStyle.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/authContext.js';
import { TextInput } from '../../../../shared/components/TextInput.jsx';
import { AuthCheckBox } from '../../../../shared/components/auth/AuthCheckBox';
import { login as apiLogin } from '../../../../api/auth';

const signInSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email обязателен для заполнения')
    .email('Введите корректный email адрес'),
  password: yup
    .string()
    .required('Пароль обязателен для заполнения')
    .min(8, 'Пароль должен содержать минимум 8 символов'),
  rememberMe: yup.boolean().default(false)
});

export const SignInForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(signInSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        
        try {
            const response = await apiLogin(data.email, data.password);
            const { token, user } = response.data;
            
            login(user, token);
            navigate('/Profile');
        } catch (error) {
            const message = error.response?.data?.message || 'Неверный email или пароль';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const TextInputProps = [
        {
            id: 0, 
            className: styles.SignInFormFormInput, 
            placeholder: "Email", 
            type: "email", 
            register: register('email'), 
            error: errors.email, 
            errorClassName: styles.errorMessage
        },
        {
            id: 1, 
            className: styles.SignInFormFormInput, 
            placeholder: "Пароль", 
            type: "password", 
            register: register('password'), 
            error: errors.password, 
            errorClassName: styles.errorMessage
        },
    ];

    return (
      <div className={styles.SignInForm}>
          <form 
              className={styles.SignInFormForm} 
              onSubmit={handleSubmit(onSubmit)}
          >
              <h1 className={styles.SignInFormH1}>Вход в аккаунт</h1>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              {TextInputProps.map((TextInputInfo, key) => (
                  <TextInput 
                      key={key}
                      className={TextInputInfo.className} 
                      placeholder={TextInputInfo.placeholder} 
                      type={TextInputInfo.type}
                      register={TextInputInfo.register}
                      error={TextInputInfo.error}
                      errorClassName={TextInputInfo.errorClassName}
                  />
              ))}
              
              <div className={styles.SignInFormFormContainer}>
                  <AuthCheckBox 
                      id="RememberMeCheckBox" 
                      register={register('rememberMe')} 
                      labelText='Запомнить меня'
                  />

                  <button 
                      type="button" 
                      className={styles.SignInFormFormForgotPasswordButton}
                  >
                      Забыли пароль?
                  </button>
              </div>
              
              <button 
                  type="submit" 
                  className={styles.SignInFormFormButton}
                  disabled={loading}
              >
                  {loading ? 'Вход...' : 'Войти'}
              </button>
              
          </form>
      </div>
  );
};