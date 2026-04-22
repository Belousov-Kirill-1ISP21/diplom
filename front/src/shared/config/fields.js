// Поля для регистрации
export const SIGNUP_STEP1_FIELDS = [
    { id: 0, placeholder: "Фамилия", type: "text", name: 'surname' },
    { id: 1, placeholder: "Имя", type: "text", name: 'name' },
    { id: 2, placeholder: "Отчество", type: "text", name: 'patronymic' },
    { id: 3, placeholder: "Дата рождения (дд.мм.гггг)", type: "text", name: 'birthDate' },
    { id: 4, placeholder: "Телефон", type: "tel", name: 'phone' },
    { id: 5, placeholder: "Email", type: "email", name: 'email' },
    { id: 6, placeholder: "Пароль", type: "password", name: 'password' },
    { id: 7, placeholder: "Повторите пароль", type: "password", name: 'confirmPassword' },
];

export const SIGNUP_STEP2_FIELDS = [
    { id: 0, placeholder: "Тип документа", type: "select", name: 'documentType', options: ['Паспорт РФ', 'Загранпаспорт'] },
    { id: 1, placeholder: "Серия паспорта", type: "text", name: 'passportSeries' },
    { id: 2, placeholder: "Номер паспорта", type: "text", name: 'passportNumber' },
    { id: 3, placeholder: "Кем выдан", type: "text", name: 'issuedBy' },
    { id: 4, placeholder: "Дата выдачи (дд.мм.гггг)", type: "text", name: 'issueDate' },
];

export const SIGNUP_STEP3_FIELDS = [
    { id: 0, placeholder: "Серия ВУ", type: "text", name: 'licenseSeries' },
    { id: 1, placeholder: "Номер ВУ", type: "text", name: 'licenseNumber' },
    { id: 2, placeholder: "Кем выдано ВУ", type: "text", name: 'licenseIssuedBy' },
    { id: 3, placeholder: "Дата выдачи ВУ (дд.мм.гггг)", type: "text", name: 'licenseIssueDate' },
    { id: 4, placeholder: "Дата окончания действия ВУ (дд.мм.гггг)", type: "text", name: 'licenseExpiryDate' },
];

export const SIGNUP_STEP_TITLES = {
    1: 'Личные данные',
    2: 'Паспортные данные',
    3: 'Водительское удостоверение'
};

// Поля для профиля
export const PROFILE_FIELDS = [
    {id:0, label:'Фамилия', key: 'surname', type: 'text'},
    {id:1, label:'Имя', key: 'name', type: 'text'},
    {id:2, label:'Отчество', key: 'patronymic', type: 'text'},
    {id:3, label:'Дата рождения', key: 'birthDate', type: 'text'},
    {id:4, label:'Email', key: 'email', type: 'email'},
    {id:5, label:'Телефон', key: 'phone', type: 'tel'},
    {id:6, label:'Серия паспорта', key: 'passportSeries', type: 'text'},
    {id:7, label:'Номер паспорта', key: 'passportNumber', type: 'text'},
    {id:8, label:'Кем выдан', key: 'issuedBy', type: 'text'},
    {id:9, label:'Дата выдачи', key: 'issueDate', type: 'text'},
    {id:10, label:'Серия ВУ', key: 'licenseSeries', type: 'text'},
    {id:11, label:'Номер ВУ', key: 'licenseNumber', type: 'text'},
    {id:12, label:'Кем выдано ВУ', key: 'licenseIssuedBy', type: 'text'},
    {id:13, label:'Дата выдачи ВУ', key: 'licenseIssueDate', type: 'text'},
    {id:14, label:'Дата окончания действия ВУ', key: 'licenseExpiryDate', type: 'text'},
    {id:15, label: 'Категории прав', key: 'driverCategories', type: 'text', readOnly: true},
    {id:16, label:'Пароль', key: 'password', type: 'password', isPassword: true},
];

// Маппинг полей для профиля
export const PROFILE_FIELD_MAP = {
    'Фамилия': 'surname',
    'Имя': 'name',
    'Отчество': 'patronymic',
    'Дата рождения': 'birthDate',
    'Email': 'email',
    'Телефон': 'phone',
    'Серия паспорта': 'passportSeries',
    'Номер паспорта': 'passportNumber',
    'Кем выдан': 'issuedBy',
    'Дата выдачи': 'issueDate',
    'Серия ВУ': 'licenseSeries',
    'Номер ВУ': 'licenseNumber',
    'Кем выдано ВУ': 'licenseIssuedBy',
    'Дата выдачи ВУ': 'licenseIssueDate',
    'Дата окончания действия ВУ': 'licenseExpiryDate',
    'Категории прав': 'driverCategories',
    'Пароль': 'password'
};

// Поля для калькулятора (шаг 1 - автомобиль)
export const CALCULATOR_VEHICLE_FIELDS = [
    { name: 'stateNumber', label: 'Государственный номер', type: 'text', placeholder: 'А123ВС777' },
    { name: 'brand', label: 'Марка', type: 'text', placeholder: 'Toyota' },
    { name: 'model', label: 'Модель', type: 'text', placeholder: 'Camry' },
    { name: 'manufactureYear', label: 'Год выпуска', type: 'number', placeholder: '2020' },
    { name: 'powerHp', label: 'Мощность (л.с.)', type: 'number', placeholder: '150' },
    { name: 'category', label: 'Категория ТС', type: 'select', options: ['A', 'B', 'C', 'D', 'E'] },
    { name: 'vin', label: 'VIN', type: 'text', placeholder: 'JTDBE32KX00123456' },
];

// Поля для КАСКО (дополнительные)
export const KASKO_EXTRA_FIELDS = [
    { name: 'purchasePrice', label: 'Стоимость автомобиля (₽)', type: 'number', placeholder: '2000000' },
];

// Поля для калькулятора (шаг 2 - срок)
export const CALCULATOR_DATE_FIELDS = [
    { name: 'startDate', label: 'Дата начала', type: 'date' },
    { name: 'endDate', label: 'Дата окончания', type: 'date' },
];

// Поля для добавления нового автомобиля (модальное окно)
export const NEW_VEHICLE_FIELDS = [
    { name: 'state_number', label: 'Государственный номер *', type: 'text', required: true },
    { name: 'brand', label: 'Марка *', type: 'text', required: true },
    { name: 'model', label: 'Модель *', type: 'text', required: true },
    { name: 'manufacture_year', label: 'Год выпуска', type: 'number', placeholder: '2020' },
    { name: 'power_hp', label: 'Мощность (л.с.)', type: 'number', placeholder: '150' },
    { name: 'category', label: 'Категория ТС', type: 'select', options: ['A', 'B', 'C', 'D', 'E'] },
    { name: 'vin', label: 'VIN *', type: 'text', required: true },
    { name: 'purchase_price', label: 'Стоимость автомобиля (₽)', type: 'number', placeholder: '2000000' },
    { name: 'parking_type', label: 'Способ парковки', type: 'select', options: [
        { value: 'garage', label: 'Гараж' },
        { value: 'street', label: 'Улица' },
        { value: 'parking_lot', label: 'Охраняемая парковка' },
        { value: 'other', label: 'Другое' }
    ]},
    { name: 'has_tracker', label: 'Наличие спутниковой сигнализации', type: 'checkbox' },
];

// Поля для оплаты
export const PAYMENT_FIELDS = [
    { name: 'cardNumber', label: 'Номер карты', type: 'text', placeholder: '1234 5678 9012 3456', maxLength: 19 },
    { name: 'cardHolder', label: 'Владелец карты', type: 'text', placeholder: 'IVAN IVANOV' },
    { name: 'expiryDate', label: 'Срок действия', type: 'text', placeholder: 'MM/YY', maxLength: 5 },
    { name: 'cvv', label: 'CVV', type: 'text', placeholder: '123', maxLength: 3 },
];

// Поля для страхового случая (шаг 3)
export const ACCIDENT_FIELDS = [
    { name: 'accident_date', label: 'Дата происшествия *', type: 'date' },
    { name: 'damage_amount', label: 'Сумма ущерба (₽)', type: 'number', placeholder: 'Введите сумму ущерба' },
    { name: 'description', label: 'Описание происшествия', type: 'textarea', placeholder: 'Опишите обстоятельства происшествия (минимум 10 символов)...', rows: 5 },
    { name: 'is_client_fault', label: 'Я признаю свою вину в ДТП', type: 'checkbox' },
];

// Категории ТС для селектов
export const VEHICLE_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

// Опции парковки
export const PARKING_OPTIONS = [
    { value: 'garage', label: 'Гараж' },
    { value: 'street', label: 'Улица' },
    { value: 'parking_lot', label: 'Охраняемая парковка' },
    { value: 'other', label: 'Другое' }
];