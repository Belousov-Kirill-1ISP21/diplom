import * as yup from 'yup';

// Константы для текущей даты
const CURRENT_DATE = new Date(2026, 2, 14);
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 3;
const CURRENT_DAY = 14;

// Общая валидация даты
export const isValidDate = (dateString) => {
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

// Общие правила для пароля
export const passwordRules = {
    min: 8,
    max: 32,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
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
    documentType: yup.string()
        .required('Тип документа обязателен')
        .oneOf(['паспорт', 'загранпаспорт'], 'Допустимые типы: паспорт, загранпаспорт')
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
        })
};