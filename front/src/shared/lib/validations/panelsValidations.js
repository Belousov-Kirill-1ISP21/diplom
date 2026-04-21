// panelsValidations.js
import * as yup from 'yup';

// ==================== ВАЛИДАЦИЯ КЛИЕНТА ====================
export const clientValidationSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email обязателен')
        .email('Введите корректный email'),
    phone: yup
        .string()
        .required('Телефон обязателен')
        .matches(/^\+7\d{10}$/, 'Телефон должен быть в формате +7XXXXXXXXXX (10 цифр после +7)'),
    password: yup
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .matches(/[A-ZА-Я]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .matches(/[a-zа-я]/, 'Пароль должен содержать хотя бы одну строчную букву')
        .matches(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    last_name: yup
        .string()
        .max(30, 'Фамилия должна содержать максимум 30 символов')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Фамилия должна начинаться с заглавной буквы и содержать только русские буквы'),
    first_name: yup
        .string()
        .max(30, 'Имя должно содержать максимум 30 символов')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Имя должно начинаться с заглавной буквы и содержать только русские буквы'),
    middle_name: yup
        .string()
        .nullable()
        .max(30, 'Отчество должно содержать максимум 30 символов')
        .matches(/^[А-ЯЁ][а-яё]*$/, 'Отчество должно начинаться с заглавной буквы и содержать только русские буквы'),
    birth_date: yup
        .string()
        .nullable()
        .test('valid-date', 'Введите корректную дату', (value) => {
            if (!value) return true;
            const date = new Date(value);
            const today = new Date();
            const minDate = new Date('1900-01-01');
            return date <= today && date >= minDate;
        })
});

// ==================== ВАЛИДАЦИЯ ТАРИФА ====================
export const tariffValidationSchema = yup.object().shape({
    policy_type_id: yup
        .string()
        .required('Тип полиса обязателен')
        .oneOf(['1', '2'], 'Выберите корректный тип полиса'),
    vehicle_category: yup
        .string()
        .required('Категория ТС обязательна')
        .oneOf(['A', 'B', 'C', 'D', 'E'], 'Выберите корректную категорию ТС'),
    base_rate: yup
        .number()
        .required('Базовая ставка обязательна')
        .positive('Базовая ставка должна быть положительной')
        .typeError('Введите число'),
    min_rate: yup
        .number()
        .required('Минимальная ставка обязательна')
        .positive('Минимальная ставка должна быть положительной')
        .typeError('Введите число'),
    max_rate: yup
        .number()
        .required('Максимальная ставка обязательна')
        .positive('Максимальная ставка должна быть положительной')
        .min(yup.ref('min_rate'), 'Максимальная ставка не может быть меньше минимальной')
        .typeError('Введите число'),
    calculation_method: yup
        .string()
        .required('Метод расчета обязателен')
        .oneOf(['basic', 'coefficient'], 'Выберите корректный метод расчета')
});

// ==================== ВАЛИДАЦИЯ СКИДКИ ПОЛИСА ====================
export const policyDiscountSchema = yup.object().shape({
    discount_amount: yup
        .number()
        .required('Скидка обязательна')
        .integer('Скидка должна быть целым числом')
        .min(0, 'Скидка не может быть меньше 0')
        .max(100, 'Скидка не может быть больше 100')
        .typeError('Введите число')
});

// ==================== ВАЛИДАЦИЯ ПРОДЛЕНИЯ ПОЛИСА ====================
export const policyRenewSchema = yup.object().shape({
    days: yup
        .number()
        .required('Количество дней обязательно')
        .integer('Введите целое число')
        .min(1, 'Минимальное продление — 1 день')
        .max(365, 'Максимальное продление — 365 дней')
        .typeError('Введите число')
});

// ==================== ВАЛИДАЦИЯ СТРАХОВОГО СЛУЧАЯ ====================
export const accidentStatusSchema = yup.object().shape({
    status: yup
        .string()
        .required('Статус обязателен')
        .oneOf(['pending', 'approved', 'rejected', 'paid'], 'Выберите корректный статус')
});

export const accidentFaultSchema = yup.object().shape({
    is_client_fault: yup
        .boolean()
        .required('Укажите вину клиента')
});

// ==================== ВАЛИДАЦИЯ СМЕНЫ ТИПА ПОЛЬЗОВАТЕЛЯ ====================
export const userTypeSchema = yup.object().shape({
    user_type: yup
        .string()
        .required('Тип пользователя обязателен')
        .oneOf(['client', 'agent', 'admin'], 'Выберите корректный тип пользователя')
});

// ==================== ОБЩИЕ ФУНКЦИИ ДЛЯ ВАЛИДАЦИИ ====================

// Валидация телефона на лету
export const validatePhone = (phone) => {
    return /^\+7\d{10}$/.test(phone);
};

// Валидация ФИО на лету
export const validateRussianName = (name) => {
    return /^[А-ЯЁ][а-яё]*$/.test(name);
};

// Валидация даты рождения
export const validateBirthDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    return date <= today && date >= minDate;
};

// Форматирование телефона для отображения
export const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+${cleaned}`;
    }
    return phone;
};

// Очистка телефона перед отправкой
export const cleanPhoneForSubmit = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+7${cleaned}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+${cleaned}`;
    }
    return phone;
};

// Сообщения об ошибках для форм
export const getValidationErrorMessage = (error) => {
    if (!error) return null;
    
    const messages = {
        'email': 'Введите корректный email адрес',
        'phone': 'Телефон должен быть в формате +7XXXXXXXXXX',
        'password': 'Пароль должен содержать минимум 8 символов, заглавную и строчную буквы, цифру',
        'last_name': 'Фамилия должна содержать только русские буквы и начинаться с заглавной',
        'first_name': 'Имя должно содержать только русские буквы и начинаться с заглавной',
        'base_rate': 'Базовая ставка должна быть положительным числом',
        'min_rate': 'Минимальная ставка должна быть положительным числом',
        'max_rate': 'Максимальная ставка должна быть больше минимальной',
        'discount_amount': 'Скидка должна быть от 0 до 100',
        'days': 'Количество дней должно быть от 1 до 365'
    };
    
    for (const [field, message] of Object.entries(messages)) {
        if (error.includes(field) || error.toLowerCase().includes(field)) {
            return message;
        }
    }
    
    return error;
};