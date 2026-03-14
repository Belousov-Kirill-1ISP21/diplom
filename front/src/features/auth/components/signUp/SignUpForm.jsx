import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './SignUpFormStyle.module.css';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '../../../../shared/components/TextInput.jsx';
import { useAuth } from '../../../../shared/context/authContext.js';

const CURRENT_DATE = new Date(2026, 2, 14);
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 3;
const CURRENT_DAY = 14;

const isValidDate = (dateString) => {
    if (!dateString) return false;
    
    const parts = dateString.split('.');
    if (parts.length !== 3) return false;
    
    const [day, month, year] = parts.map(Number);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > CURRENT_YEAR) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
};

const step1Schema = yup.object().shape({
    surname: yup.string()
        .required('Фамилия обязательна')
        .matches(/^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/, 'Фамилия должна начинаться с заглавной буквы и содержать только русские буквы')
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(50, 'Фамилия должна содержать максимум 50 символов'),
    
    name: yup.string()
        .required('Имя обязательно')
        .matches(/^[А-ЯЁ][а-яё]+$/, 'Имя должно начинаться с заглавной буквы и содержать только русские буквы')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя должно содержать максимум 50 символов'),
    
    patronymic: yup.string()
        .required('Отчество обязательно')
        .matches(/^[А-ЯЁ][а-яё]+$/, 'Отчество должно начинаться с заглавной буквы и содержать только русские буквы')
        .min(2, 'Отчество должно содержать минимум 2 символа')
        .max(50, 'Отчество должно содержать максимум 50 символов'),
    
    birthDate: yup.string()
        .required('Дата рождения обязательна')
        .test('valid-format', 'Дата должна быть в формате дд.мм.гггг', isValidDate)
        .test('not-future', 'Дата рождения не может быть в будущем', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            const birthDate = new Date(year, month - 1, day);
            return birthDate <= CURRENT_DATE;
        })
        .test('min-age', 'Вам должно быть не меньше 18 лет', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            
            let age = CURRENT_YEAR - year;
            if (month > CURRENT_MONTH || (month === CURRENT_MONTH && day > CURRENT_DAY)) {
                age--;
            }
            
            return age >= 18;
        })
        .test('max-age', 'Максимальный возраст - 120 лет', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            
            let age = CURRENT_YEAR - year;
            if (month > CURRENT_MONTH || (month === CURRENT_MONTH && day > CURRENT_DAY)) {
                age--;
            }
            
            return age <= 120;
        }),
    
    phone: yup.string()
        .required('Телефон обязателен')
        .matches(/^\+7\d{10}$/, 'Телефон должен быть в формате +7XXXXXXXXXX (10 цифр после +7)')
        .test('valid-phone', 'Введите корректный номер телефона', (value) => {
            if (!value) return false;
            const digits = value.replace(/\D/g, '');
            return digits.length === 11 && digits.startsWith('7');
        }),
    
    email: yup.string()
        .required('Email обязателен')
        .email('Введите корректный Email адрес (например: name@domain.ru)')
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Неверный формат Email'),
    
    password: yup.string()
        .required('Пароль обязателен')
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .matches(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .matches(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
        .matches(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
        .matches(/[!@#$%^&*]/, 'Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)'),
    
    confirmPassword: yup.string()
        .required('Подтверждение пароля обязательно')
        .oneOf([yup.ref('password')], 'Пароли должны совпадать'),
});

const step2Schema = yup.object().shape({
    documentType: yup.string()
        .required('Тип документа обязателен')
        .oneOf(['паспорт', 'загранпаспорт', 'военный билет'], 'Допустимые типы: паспорт, загранпаспорт, военный билет')
        .default('паспорт'),
    
    passportSeries: yup.string()
        .required('Серия паспорта обязательна')
        .matches(/^\d{4}$/, 'Серия паспорта должна содержать ровно 4 цифры')
        .test('valid-series', 'Серия паспорта должна начинаться с ненулевых цифр', (value) => {
            if (!value) return false;
            return value[0] !== '0' && value[2] !== '0';
        }),
    
    passportNumber: yup.string()
        .required('Номер паспорта обязателен')
        .matches(/^\d{6}$/, 'Номер паспорта должен содержать ровно 6 цифр')
        .test('valid-number', 'Номер паспорта не может состоять из одних нулей', (value) => {
            if (!value) return false;
            return !/^0+$/.test(value);
        }),
    
    issuedBy: yup.string()
        .required('Кем выдан обязательно')
        .min(10, 'Название органа выдачи должно содержать минимум 10 символов')
        .max(200, 'Название органа выдачи должно содержать максимум 200 символов')
        .matches(/^[А-ЯЁа-яё0-9\s\-.,"№]+$/, 'Название может содержать русские буквы, цифры, пробелы и дефисы'),
    
    issueDate: yup.string()
        .required('Дата выдачи обязательна')
        .test('valid-format', 'Дата должна быть в формате дд.мм.гггг', isValidDate)
        .test('not-future', 'Дата выдачи не может быть в будущем', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            const issueDate = new Date(year, month - 1, day);
            return issueDate <= CURRENT_DATE;
        })
        .test('not-too-old', 'Дата выдачи не может быть раньше 1991 года', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            return year >= 1991;
        }),
});

const step3Schema = yup.object().shape({
    licenseSeries: yup.string()
        .required('Серия ВУ обязательна')
        .matches(/^\d{4}$/, 'Серия ВУ должна содержать 4 цифры'),
    
    licenseNumber: yup.string()
        .required('Номер ВУ обязателен')
        .matches(/^\d{6}$/, 'Номер ВУ должен содержать 6 цифр'),
    
    licenseIssuedBy: yup.string()
        .required('Кем выдано ВУ обязательно')
        .min(10, 'Название органа выдачи должно содержать минимум 10 символов')
        .max(200, 'Название органа выдачи должно содержать максимум 200 символов'),
    
    licenseIssueDate: yup.string()
        .required('Дата выдачи ВУ обязательна')
        .test('valid-format', 'Дата должна быть в формате дд.мм.гггг', isValidDate)
        .test('not-future', 'Дата выдачи не может быть в будущем', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            return new Date(year, month - 1, day) <= CURRENT_DATE;
        }),
    
    licenseExpiryDate: yup.string()
        .required('Дата окончания действия ВУ обязательна')
        .test('valid-format', 'Дата должна быть в формате дд.мм.гггг', isValidDate)
        .test('after-issue', 'Дата окончания должна быть позже даты выдачи', function(value) {
            if (!value || !this.parent.licenseIssueDate) return false;
            
            const [issueDay, issueMonth, issueYear] = this.parent.licenseIssueDate.split('.').map(Number);
            const [expiryDay, expiryMonth, expiryYear] = value.split('.').map(Number);
            
            const issueDate = new Date(issueYear, issueMonth - 1, issueDay);
            const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay);
            
            return expiryDate > issueDate;
        })
        .test('max-term', 'Срок действия ВУ не может превышать 10 лет', function(value) {
            if (!value || !this.parent.licenseIssueDate) return false;
            
            const [issueDay, issueMonth, issueYear] = this.parent.licenseIssueDate.split('.').map(Number);
            const [expiryDay, expiryMonth, expiryYear] = value.split('.').map(Number);
            
            const issueDate = new Date(issueYear, issueMonth - 1, issueDay);
            const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay);
            
            const yearsDiff = (expiryDate - issueDate) / (1000 * 60 * 60 * 24 * 365.25);
            return yearsDiff <= 10.1;
        }),
    
    licenseCategory: yup.string()
        .required('Категория обязательна')
        .matches(/^[A-Z, ]+$/, 'Категории должны быть указаны заглавными латинскими буквами через запятую')
        .test('valid-categories', 'Допустимые категории: A, B, C, D, E, M', (value) => {
            if (!value) return false;
            const categories = value.split(',').map(c => c.trim());
            const validCategories = ['A', 'B', 'C', 'D', 'E', 'M'];
            return categories.every(cat => validCategories.includes(cat));
        }),
});

export const SignUpForm = () => {
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

    const step1Fields = [
        {id:0, placeholder: "Фамилия", type: "text", name: 'surname'},
        {id:1, placeholder: "Имя", type: "text", name: 'name'},
        {id:2, placeholder: "Отчество", type: "text", name: 'patronymic'},
        {id:3, placeholder: "Дата рождения (дд.мм.гггг)", type: "text", name: 'birthDate'},
        {id:4, placeholder: "+70000000000", type: "tel", name: 'phone'},
        {id:5, placeholder: "Email", type: "email", name: 'email'},
        {id:6, placeholder: "Пароль", type: "password", name: 'password'},
        {id:7, placeholder: "Повторите пароль", type: "password", name: 'confirmPassword'},
    ];

    const step2Fields = [
        {id:0, placeholder: "Тип документа (паспорт)", type: "text", name: 'documentType'},
        {id:1, placeholder: "Серия паспорта (4 цифры)", type: "text", name: 'passportSeries'},
        {id:2, placeholder: "Номер паспорта (6 цифр)", type: "text", name: 'passportNumber'},
        {id:3, placeholder: "Кем выдан", type: "text", name: 'issuedBy'},
        {id:4, placeholder: "Дата выдачи (дд.мм.гггг)", type: "text", name: 'issueDate'},
    ];

    const step3Fields = [
        {id:0, placeholder: "Серия ВУ (4 цифры)", type: "text", name: 'licenseSeries'},
        {id:1, placeholder: "Номер ВУ (6 цифр)", type: "text", name: 'licenseNumber'},
        {id:2, placeholder: "Кем выдано ВУ", type: "text", name: 'licenseIssuedBy'},
        {id:3, placeholder: "Дата выдачи ВУ (дд.мм.гггг)", type: "text", name: 'licenseIssueDate'},
        {id:4, placeholder: "Дата окончания действия ВУ (дд.мм.гггг)", type: "text", name: 'licenseExpiryDate'},
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
                    Создавая аккаунт, вы соглашаетесь с нашей Политикой конфиденциальности и Условиями использования
                </p>
            </form>
        </div>
    );
};