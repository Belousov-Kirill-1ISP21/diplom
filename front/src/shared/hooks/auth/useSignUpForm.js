import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
    personalInfoSchema, 
    passportSchema, 
    licenseSchema,
    passwordRules 
} from '../../lib/validations/authValidations';

const step1Schema = yup.object().shape({
    ...personalInfoSchema,
    birthDate: yup.string()
        .required('Дата рождения обязательна')
        .test('valid-format', 'Дата должна быть в формате дд.мм.гггг', (value) => {
            return true;
        }),
    password: yup.string()
        .required('Пароль обязателен')
        .min(passwordRules.min, `Пароль должен содержать минимум ${passwordRules.min} символов`)
        .matches(passwordRules.hasUpperCase, 'Пароль должен содержать хотя бы одну заглавную букву')
        .matches(passwordRules.hasLowerCase, 'Пароль должен содержать хотя бы одну строчную букву')
        .matches(passwordRules.hasNumber, 'Пароль должен содержать хотя бы одну цифру')
        .matches(passwordRules.hasSpecial, 'Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)'),
    
    confirmPassword: yup.string()
        .required('Подтверждение пароля обязательно')
        .oneOf([yup.ref('password')], 'Пароли должны совпадать'),
});

const step2Schema = yup.object().shape(passportSchema);
const step3Schema = yup.object().shape(licenseSchema);

export const useSignUpForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const { login } = useAuth();
    
    const { register, handleSubmit, formState: { errors }, trigger } = useForm({
        resolver: yupResolver(
            step === 1 ? step1Schema : 
            step === 2 ? step2Schema : 
            step3Schema
        ),
        mode: 'onChange'
    });

    const nextStep = async () => {
        const isValid = await trigger();
        if (isValid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const onSubmit = (data) => {
        console.log('Все данные регистрации:', data);
        login(data);
        navigate('/Profile');
    };

    return {
        step,
        register,
        handleSubmit,
        errors,
        nextStep,
        prevStep,
        onSubmit
    };
};