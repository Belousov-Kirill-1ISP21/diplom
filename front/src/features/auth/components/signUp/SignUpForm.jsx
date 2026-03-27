import React from 'react';
import styles from './SignUpFormStyle.module.css';
import { TextInput } from '../../../../shared/components/TextInput.jsx';
import { 
    SIGNUP_STEP1_FIELDS, 
    SIGNUP_STEP2_FIELDS, 
    SIGNUP_STEP3_FIELDS,
    SIGNUP_STEP_TITLES 
} from '../../../../shared/config/fields';
import { useSignUpForm } from '../../../../shared/hooks/auth/useSignUpForm';

export const SignUpForm = () => {
    const {
        step,
        register,
        handleSubmit,
        errors,
        nextStep,
        prevStep,
        onSubmit
    } = useSignUpForm();

    const getCurrentFields = () => {
        if (step === 1) return SIGNUP_STEP1_FIELDS;
        if (step === 2) return SIGNUP_STEP2_FIELDS;
        return SIGNUP_STEP3_FIELDS;
    };

    return (
        <div className={styles.SignUpForm}>
            <div className={styles.stepIndicator}>
                Шаг {step} из 3
            </div>

            <form className={styles.SignUpFormForm} onSubmit={handleSubmit(onSubmit)}>
                <h1 className={styles.SignInFormH1}>
                    {SIGNUP_STEP_TITLES[step]}
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
                        options={field.options} 
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