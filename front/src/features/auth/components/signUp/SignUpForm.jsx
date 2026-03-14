import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './SignUpFormStyle.module.css';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../../../shared/components/TextInput.jsx';

// Схема для первого шага
const step1Schema = yup.object().shape({
    surname: yup.string().required('Фамилия обязательна'),
    name: yup.string().required('Имя обязательно'),
    patronymic: yup.string().required('Отчество обязательно'),
    phone: yup.string()
        .matches(/^\+7\d{3}\d{3}\d{4}$/, 'Телефон должен быть в формате +70000000000')
        .required('Телефон обязателен'),
    email: yup.string().email('Неверный формат Email').required('Email обязателен'),
    password: yup.string().min(6, 'Пароль должен содержать минимум 6 символов').required('Пароль обязателен'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
        .required('Подтверждение пароля обязательно'),
});

// Схема для второго шага
const step2Schema = yup.object().shape({
    documentType: yup.string().required('Тип документа обязателен'),
    passportSeries: yup.string().required('Серия паспорта обязательна').matches(/^\d{4}$/, 'Серия должна содержать 4 цифры'),
    passportNumber: yup.string().required('Номер паспорта обязателен').matches(/^\d{6}$/, 'Номер должен содержать 6 цифр'),
    issuedBy: yup.string().required('Кем выдан обязательно'),
    issueDate: yup.string().required('Дата выдачи обязательна').matches(/^\d{2}\.\d{2}\.\d{4}$/, 'Формат: дд.мм.гггг'),
});

// Схема для третьего шага
const step3Schema = yup.object().shape({
    licenseSeries: yup.string().required('Серия ВУ обязательна'),
    licenseNumber: yup.string().required('Номер ВУ обязателен'),
    licenseIssuedBy: yup.string().required('Кем выдано ВУ обязательно'),
    licenseIssueDate: yup.string().required('Дата выдачи ВУ обязательна').matches(/^\d{2}\.\d{2}\.\d{4}$/, 'Формат: дд.мм.гггг'),
    licenseExpiryDate: yup.string().required('Дата окончания ВУ обязательна').matches(/^\d{2}\.\d{2}\.\d{4}$/, 'Формат: дд.мм.гггг'),
    licenseCategory: yup.string().required('Категория обязательна'),
});

export const SignUpForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Объединяем все данные формы
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
        navigate('/SignIn');
    };

    // Поля для первого шага
    const step1Fields = [
        {id:0, placeholder: "Фамилия", type: "text", name: 'surname'},
        {id:1, placeholder: "Имя", type: "text", name: 'name'},
        {id:2, placeholder: "Отчество", type: "text", name: 'patronymic'},
        {id:3, placeholder: "+70000000000", type: "phone", name: 'phone'},
        {id:4, placeholder: "Email", type: "email", name: 'email'},
        {id:5, placeholder: "Пароль", type: "password", name: 'password'},
        {id:6, placeholder: "Повторите пароль", type: "password", name: 'confirmPassword'},
    ];

    // Поля для второго шага
    const step2Fields = [
        {id:0, placeholder: "Тип документа (паспорт)", type: "text", name: 'documentType'},
        {id:1, placeholder: "Серия паспорта (4 цифры)", type: "text", name: 'passportSeries'},
        {id:2, placeholder: "Номер паспорта (6 цифр)", type: "text", name: 'passportNumber'},
        {id:3, placeholder: "Кем выдан", type: "text", name: 'issuedBy'},
        {id:4, placeholder: "Дата выдачи (дд.мм.гггг)", type: "text", name: 'issueDate'},
    ];

    // Поля для третьего шага
    const step3Fields = [
        {id:0, placeholder: "Серия ВУ", type: "text", name: 'licenseSeries'},
        {id:1, placeholder: "Номер ВУ", type: "text", name: 'licenseNumber'},
        {id:2, placeholder: "Кем выдано ВУ", type: "text", name: 'licenseIssuedBy'},
        {id:3, placeholder: "Дата выдачи ВУ (дд.мм.гггг)", type: "text", name: 'licenseIssueDate'},
        {id:4, placeholder: "Срок действия ВУ (дд.мм.гггг)", type: "text", name: 'licenseExpiryDate'},
        {id:5, placeholder: "Категория (A, B, C, D)", type: "text", name: 'licenseCategory'},
    ];

    const getCurrentFields = () => {
        if (step === 1) return step1Fields;
        if (step === 2) return step2Fields;
        return step3Fields;
    };

    return (
        <div className={styles.SignUpForm}>
            <div className={styles.stepIndicator}>
                Шаг {step} из 3
            </div>

            <form className={styles.SignUpFormForm} onSubmit={handleSubmit(onSubmit)}>
                <h1 className={styles.SignInFormH1}>
                    {step === 1 && 'Личные данные'}
                    {step === 2 && 'Паспортные данные'}
                    {step === 3 && 'Водительское удостоверение'}
                </h1>

                {getCurrentFields().map((field) => (
                    <TextInput 
                        key={field.id}
                        className={styles.SignUpFormFormInput}
                        placeholder={field.placeholder}
                        type={field.type}
                        register={register(field.name)}
                        error={errors[field.name]}
                        errorClassName={styles.errorMessage}
                    />
                ))}

                <div className={styles.buttonContainer}>
                    {step > 1 && (
                        <button 
                            type="button" 
                            onClick={prevStep}
                            className={styles.secondaryButton}
                        >
                            Назад
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button 
                            type="button" 
                            onClick={nextStep}
                            className={styles.primaryButton}
                        >
                            Следующий шаг
                        </button>
                    ) : (
                        <button 
                            type="submit" 
                            className={styles.primaryButton}
                        >
                            Зарегистрироваться
                        </button>
                    )}
                </div>

                <p className={styles.SignUpFormFormText}>
                    By Creating an Account, it means you agree to our Privacy Policy and Terms of Service
                </p>
            </form>
        </div>
    );
};