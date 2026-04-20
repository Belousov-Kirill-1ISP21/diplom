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
import { register as apiRegister } from '../../../api/auth';

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
        console.log('=== saveCurrentStepData ===');
        console.log('Step:', step);
        console.log('Current values:', currentValues);
        
        if (step === 1) {
            setStep1Data(currentValues);
            console.log('Saved to step1Data:', currentValues);
        } else if (step === 2) {
            setStep2Data(currentValues);
            console.log('Saved to step2Data:', currentValues);
        } else if (step === 3) {
            setStep3Data(currentValues);
            console.log('Saved to step3Data:', currentValues);
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
        
        console.log('=== ПОЛНЫЕ ДАННЫЕ ===', allData);

        console.log('step1Data:', step1Data);
        console.log('step2Data:', step2Data);
        console.log('step3Data:', step3Data);
        
        // Теперь отправляем ВСЕ данные на бэк
        const payloadForBackend = {
            // Шаг 1
            email: allData.email,
            phone: allData.phone,
            password: allData.password,
            password_confirmation: allData.confirmPassword,
            last_name: allData.surname,
            first_name: allData.name,
            middle_name: allData.patronymic || '',
            birth_date: allData.birthDate,
            
            // Шаг 2 - Паспортные данные
            passport_series: allData.passportSeries,
            passport_number: allData.passportNumber,
            passport_issued_by: allData.issuedBy,
            passport_issue_date: allData.issueDate,
            
            // Шаг 3 - Водительские права
            driver_license_series: allData.licenseSeries,
            driver_license_number: allData.licenseNumber,
            driver_license_issued_by: allData.licenseIssuedBy,
            driver_license_issue_date: allData.licenseIssueDate,
            driver_license_expiry_date: allData.licenseExpiryDate
        };
    
        console.log('=== PAYLOAD ДЛЯ БЭКА ===', payloadForBackend);
        
        try {
            const response = await apiRegister(payloadForBackend);
            const { token, user, profile } = response.data;  

            const fullUser = {
                ...user,
                client_profile: profile  
            };

            login(fullUser, token);
            
            const pendingData = localStorage.getItem('pendingCalculatorData');
            if (pendingData) {
                localStorage.removeItem('pendingCalculatorData');
            }
            
            navigate('/Profile');
        } catch (error) {
            console.error('Registration error:', error);
            const responseData = error.response?.data || {};
            const errors = responseData.errors || {};
            const message = responseData.message || 'Ошибка регистрации';
            
            const newErrors = {};
            if (errors.email) newErrors.email = errors.email[0];
            if (errors.phone) newErrors.phone = errors.phone[0];
            if (errors.password) newErrors.password = errors.password[0];
            if (message) newErrors.form = message;
            
            setFormErrors(newErrors);
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