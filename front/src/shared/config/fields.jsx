// Поля для регистрации
export const SIGNUP_STEP1_FIELDS = [
    {id:0, placeholder: "Фамилия", type: "text", name: 'surname'},
    {id:1, placeholder: "Имя", type: "text", name: 'name'},
    {id:2, placeholder: "Отчество", type: "text", name: 'patronymic'},
    {id:3, placeholder: "Дата рождения (дд.мм.гггг)", type: "text", name: 'birthDate'},
    {id:4, placeholder: "+70000000000", type: "tel", name: 'phone'},
    {id:5, placeholder: "Email", type: "email", name: 'email'},
    {id:6, placeholder: "Пароль", type: "password", name: 'password'},
    {id:7, placeholder: "Повторите пароль", type: "password", name: 'confirmPassword'},
];

export const SIGNUP_STEP2_FIELDS = [
    {id:0, placeholder: "Тип документа (паспорт)", type: "text", name: 'documentType'},
    {id:1, placeholder: "Серия паспорта (4 цифры)", type: "text", name: 'passportSeries'},
    {id:2, placeholder: "Номер паспорта (6 цифр)", type: "text", name: 'passportNumber'},
    {id:3, placeholder: "Кем выдан", type: "text", name: 'issuedBy'},
    {id:4, placeholder: "Дата выдачи (дд.мм.гггг)", type: "text", name: 'issueDate'},
];

export const SIGNUP_STEP3_FIELDS = [
    {id:0, placeholder: "Серия ВУ (4 цифры)", type: "text", name: 'licenseSeries'},
    {id:1, placeholder: "Номер ВУ (6 цифр)", type: "text", name: 'licenseNumber'},
    {id:2, placeholder: "Кем выдано ВУ", type: "text", name: 'licenseIssuedBy'},
    {id:3, placeholder: "Дата выдачи ВУ (дд.мм.гггг)", type: "text", name: 'licenseIssueDate'},
    {id:4, placeholder: "Дата окончания действия ВУ (дд.мм.гггг)", type: "text", name: 'licenseExpiryDate'},
    {id:5, placeholder: "Категория (A, B, C, D)", type: "text", name: 'licenseCategory'},
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
    {id:15, label:'Категория', key: 'licenseCategory', type: 'text'},
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
    'Категория': 'licenseCategory',
    'Пароль': 'password'
};