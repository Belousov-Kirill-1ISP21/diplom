import { useState, useEffect } from 'react';
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
    const [step1Data, setStep1Data] = useState({});
    const [step2Data, setStep2Data] = useState({});
    const [step3Data, setStep3Data] = useState({});
    const { login, resetPolicies } = useAuth();
    
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

    // Сохраняем данные текущего шага
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
            : ['licenseSeries', 'licenseNumber', 'licenseIssuedBy', 'licenseIssueDate', 'licenseExpiryDate', 'licenseCategory'];
        
        const isValid = await trigger(fieldsToValidate);
        
        if (isValid) {
            // Сохраняем данные текущего шага
            saveCurrentStepData();
            
            setStep(step + 1);
            
            if (step === 1) {
                // Переход на 2 шаг - используем сохраненные данные если есть
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
                // Переход на 3 шаг - используем сохраненные данные если есть
                if (Object.keys(step3Data).length > 0) {
                    reset(step3Data);
                } else {
                    reset({
                        licenseSeries: '',
                        licenseNumber: '',
                        licenseIssuedBy: '',
                        licenseIssueDate: '',
                        licenseExpiryDate: '',
                        licenseCategory: ''
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

    const onSubmit = (data) => {
        saveCurrentStepData();
        
        const allData = {
            ...step1Data,
            ...step2Data,
            ...step3Data,
            ...data
        };
        
        login(allData);
        resetPolicies();  
        
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