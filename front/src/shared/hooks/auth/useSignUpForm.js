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
    passwordRules,
    isValidDateISO,
    isValidDateNotFuture
} from '../../lib/validations/authValidations';
import { register as apiRegister } from '../../../api/auth';

// Конвертер из ДД.ММ.ГГГГ в YYYY-MM-DD
const convertToISO = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('.');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Валидация формата ДД.ММ.ГГГГ (конвертируем в ISO и проверяем)
const isValidDateDDMMYYYY = (value) => {
    if (!value) return false;
    const isoDate = convertToISO(value);
    return isValidDateISO(isoDate);
};

// Проверка что дата не в будущем
const isNotFutureDate = (value) => {
    if (!value) return false;
    const isoDate = convertToISO(value);
    return isValidDateNotFuture(isoDate);
};

const step1Schema = yup.object().shape({
    ...personalInfoSchema,
    birthDate: yup.string()
        .required('Дата рождения обязательна')
        .test('valid-format', 'Дата должна быть в формате ДД.ММ.ГГГГ', isValidDateDDMMYYYY)
        .test('not-future', 'Дата рождения не может быть в будущем', isNotFutureDate),
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

const step2Schema = yup.object().shape({
    ...passportSchema,
    issueDate: yup.string()
        .required('Дата выдачи обязательна')
        .test('valid-format', 'Дата должна быть в формате ДД.ММ.ГГГГ', isValidDateDDMMYYYY)
        .test('not-future', 'Дата выдачи не может быть в будущем', isNotFutureDate)
        .test('not-too-old', 'Дата выдачи не может быть раньше 1991 года', (value) => {
            if (!value) return false;
            const [day, month, year] = value.split('.').map(Number);
            return year >= 1991;
        }),
});

const step3Schema = yup.object().shape({
    ...licenseSchema,
    licenseIssueDate: yup.string()
        .required('Дата выдачи ВУ обязательна')
        .test('valid-format', 'Дата должна быть в формате ДД.ММ.ГГГГ', isValidDateDDMMYYYY)
        .test('not-future', 'Дата выдачи ВУ не может быть в будущем', isNotFutureDate),
    
    licenseExpiryDate: yup.string()
        .required('Дата окончания действия ВУ обязательна')
        .test('valid-format', 'Дата должна быть в формате ДД.ММ.ГГГГ', isValidDateDDMMYYYY)
        .test('after-issue', 'Дата окончания должна быть позже даты выдачи', function(value) {
            if (!value || !this.parent.licenseIssueDate) return false;
            const [expiryDay, expiryMonth, expiryYear] = value.split('.').map(Number);
            const [issueDay, issueMonth, issueYear] = this.parent.licenseIssueDate.split('.').map(Number);
            const expiry = new Date(expiryYear, expiryMonth - 1, expiryDay);
            const issue = new Date(issueYear, issueMonth - 1, issueDay);
            return expiry > issue;
        }),
});

export const useSignUpForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [step1Data, setStep1Data] = useState({});
    const [step2Data, setStep2Data] = useState({});
    const [step3Data, setStep3Data] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const { login } = useAuth();
    
    const getSchema = () => {
        if (step === 1) return step1Schema;
        if (step === 2) return step2Schema;
        return step3Schema;
    };
    
    const { register, handleSubmit, formState: { errors }, trigger, reset, getValues, setValue, clearErrors } = useForm({
        resolver: yupResolver(getSchema()),
        mode: 'onChange',
        reValidateMode: 'onSubmit'
    });

    const saveCurrentStepData = () => {
        const currentValues = getValues();
        
        if (step === 1) {
            setStep1Data(currentValues);
        } else if (step === 2) {
            setStep2Data(currentValues);
        } else if (step === 3) {
            setStep3Data(currentValues);
        }
    };

    const nextStep = async () => {
        const fieldsToValidate = step === 1 
            ? ['surname', 'name', 'patronymic', 'birthDate', 'phone', 'email', 'password', 'confirmPassword']
            : step === 2
            ? ['passportSeries', 'passportNumber', 'issuedBy', 'issueDate']
            : ['licenseSeries', 'licenseNumber', 'licenseIssuedBy', 'licenseIssueDate', 'licenseExpiryDate'];
        
        const isValid = await trigger(fieldsToValidate);
        
        if (isValid) {
            saveCurrentStepData();
            setStep(step + 1);
            setFormErrors({});
            
            if (step === 1) {
                if (Object.keys(step2Data).length > 0) {
                    reset({
                        documentType: '',
                        ...step2Data
                    });
                } else {
                    reset({
                        documentType: '',
                        passportSeries: '',
                        passportNumber: '',
                        issuedBy: '',
                        issueDate: ''
                    });
                }
            } else if (step === 2) {
                if (Object.keys(step3Data).length > 0) {
                    reset(step3Data);
                } else {
                    reset({
                        licenseSeries: '',
                        licenseNumber: '',
                        licenseIssuedBy: '',
                        licenseIssueDate: '',
                        licenseExpiryDate: ''
                    });
                }
            }
            
            setTimeout(() => {
                clearErrors();
            }, 0);
        }
    };
    
    const prevStep = () => {
        saveCurrentStepData();
        const prevStepNumber = step - 1;
        setStep(prevStepNumber);
        setFormErrors({}); 
        
        if (prevStepNumber === 1) {
            reset(step1Data);
        } else if (prevStepNumber === 2) {
            reset({
                documentType: '',
                ...step2Data
            });
        } else if (prevStepNumber === 3) {
            reset(step3Data);
        }
        
        setTimeout(() => {
            clearErrors();
        }, 0);
    };

    const onSubmit = async (data) => {
        const currentFormData = getValues();
        
        const allData = {
            ...step1Data,
            ...step2Data,
            ...step3Data,
            ...currentFormData,
            ...data
        };
        
        const payloadForBackend = {
            email: allData.email,
            phone: allData.phone,
            password: allData.password,
            password_confirmation: allData.confirmPassword,
            last_name: allData.surname,
            first_name: allData.name,
            middle_name: allData.patronymic || '',
            birth_date: convertToISO(allData.birthDate),
            passport_series: allData.passportSeries,
            passport_number: allData.passportNumber,
            passport_issued_by: allData.issuedBy,
            passport_issue_date: convertToISO(allData.issueDate),
            driver_license_series: allData.licenseSeries,
            driver_license_number: allData.licenseNumber,
            driver_license_issued_by: allData.licenseIssuedBy,
            driver_license_issue_date: convertToISO(allData.licenseIssueDate),
            driver_license_expiry_date: convertToISO(allData.licenseExpiryDate)
        };
        
        try {
            const response = await apiRegister(payloadForBackend);
            const { token, user, profile } = response.data;  
    
            const fullUser = {
                ...user,
                client_profile: profile  
            };
    
            const hasPendingVehicle = localStorage.getItem('pendingVehicle');
            const hasPendingPolicy = localStorage.getItem('pendingPolicy');
            const hasPendingData = hasPendingVehicle && hasPendingPolicy;
            
            console.log('Registration successful, hasPendingData:', hasPendingData);
            console.log('pendingVehicle:', hasPendingVehicle);
            console.log('pendingPolicy:', hasPendingPolicy);
            
            login(fullUser, token);
            
        } catch (error) {
            console.error('Registration error:', error);
            const responseData = error.response?.data || {};
            const errors = responseData.errors || {};
            const message = responseData.message || 'Ошибка регистрации';
            
            const newErrors = {};
            
            if (errors.email) {
                newErrors.email = errors.email[0];
            }
            if (errors.phone) {
                newErrors.phone = errors.phone[0];
            }
            if (errors.password) {
                newErrors.password = errors.password[0];
            }
            if (errors.last_name) {
                newErrors.last_name = errors.last_name[0];
            }
            if (errors.first_name) {
                newErrors.first_name = errors.first_name[0];
            }
            if (errors.middle_name) {
                newErrors.middle_name = errors.middle_name[0];
            }
            
            if (message && Object.keys(newErrors).length === 0) {
                newErrors.form = message;
            }
            
            if (message.includes('email') || message.includes('Email')) {
                newErrors.email = 'Пользователь с таким email уже существует';
                newErrors.form = null;
            }
            
            if (message.includes('phone') || message.includes('Phone')) {
                newErrors.phone = 'Пользователь с таким телефоном уже существует';
                newErrors.form = null;
            }
            
            setFormErrors(newErrors);
            
            if (newErrors.email || newErrors.phone || newErrors.password || newErrors.last_name || newErrors.first_name) {
            }
        }
    };

    return {
        step,
        register,
        handleSubmit,
        errors,
        formErrors,
        nextStep,
        prevStep,
        onSubmit
    };
};