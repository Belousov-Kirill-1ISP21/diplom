import * as yup from 'yup';

const CURRENT_DATE = new Date(2026, 2, 14);
const CURRENT_YEAR = 2026;

// Общая функция валидации даты в формате YYYY-MM-DD
export const isValidDateISO = (dateString) => {
    if (!dateString) return false;
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > CURRENT_YEAR) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
};

// Схема для даты с проверкой на будущее (прошлая дата)
export const pastDateSchema = (fieldName) => {
    return yup.string()
        .required(`${fieldName} обязательна`)
        .test('valid-format', 'Введите корректную дату', isValidDateISO)
        .test('not-future', `${fieldName} не может быть в будущем`, (value) => {
            if (!value) return false;
            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date <= CURRENT_DATE;
        });
};

// Общие правила для пароля
export const passwordRules = {
    min: 8,
    max: 32,
    hasUpperCase: /[A-ZА-Я]/,
    hasLowerCase: /[a-zа-я]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[!@#$%^&*]/,
    noCyrillic: /^[a-zA-Z0-9!@#$%^&*]+$/
};

// Схема для личных данных
export const personalInfoSchema = {
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
    
    birthDate: pastDateSchema('Дата рождения'),
    
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
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Неверный формат Email')
};

// Схема для паспортных данных
export const passportSchema = {
    passportSeries: yup.string()
        .required('Серия паспорта обязательна')
        .matches(/^\d{4}$/, 'Серия паспорта должна содержать ровно 4 цифры'),
    
    passportNumber: yup.string()
        .required('Номер паспорта обязателен')
        .matches(/^\d{6}$/, 'Номер паспорта должен содержать ровно 6 цифр'),
    
    issuedBy: yup.string()
        .required('Кем выдан обязательно')
        .min(10, 'Название органа выдачи должно содержать минимум 10 символов')
        .max(200, 'Название органа выдачи должно содержать максимум 200 символов'),
    
    issueDate: pastDateSchema('Дата выдачи')
        .test('not-too-old', 'Дата выдачи не может быть раньше 1991 года', (value) => {
            if (!value) return false;
            const [year] = value.split('-').map(Number);
            return year >= 1991;
        })
};

// Схема для ВУ
export const licenseSchema = {
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
    
    licenseIssueDate: pastDateSchema('Дата выдачи ВУ'),
    
    licenseExpiryDate: yup.string()
        .required('Дата окончания действия ВУ обязательна')
        .test('valid-format', 'Введите корректную дату', isValidDateISO)
        .test('after-issue', 'Дата окончания должна быть позже даты выдачи', function(value) {
            if (!value || !this.parent.licenseIssueDate) return false;
            
            const [issueYear, issueMonth, issueDay] = this.parent.licenseIssueDate.split('-').map(Number);
            const [expiryYear, expiryMonth, expiryDay] = value.split('-').map(Number);
            
            const issueDate = new Date(issueYear, issueMonth - 1, issueDay);
            const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay);
            
            return expiryDate > issueDate;
        }),
    
    licenseCategory: yup.string()
        .required('Категория обязательна')
        .oneOf(['A', 'B', 'C', 'D', 'E'], 'Выберите категорию из списка')
};