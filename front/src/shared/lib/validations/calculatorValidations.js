// Функция нормализации госномера (замена русских букв на английские)
export const normalizeLicensePlate = (plate) => {
    if (!plate) return plate;
    
    const mapping = {
        'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M',
        'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T',
        'У': 'Y', 'Х': 'X', 'а': 'a', 'в': 'b', 'е': 'e',
        'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p',
        'с': 'c', 'т': 't', 'у': 'y', 'х': 'x'
    };
    
    let normalized = '';
    for (let char of plate) {
        normalized += mapping[char] || char;
    }
    
    return normalized.toUpperCase();
};

// Функция валидации госномера
export const validateLicensePlate = (plate) => {
    if (!plate) return 'Госномер обязателен';
    
    const pattern = /^[A-Z]{1}[0-9]{3}[A-Z]{2}[0-9]{2,3}$/;
    const normalized = normalizeLicensePlate(plate);
    
    if (!pattern.test(normalized)) {
        return 'Неверный формат госномера. Примеры: А123АА123 или A123AA123';
    }
    
    return null;
};

// Валидация для автомобиля
export const validateVehicleData = (data, policyType) => {
    const errors = {};
    
    // Госномер
    if (!data.stateNumber?.trim()) {
        errors.stateNumber = 'Госномер обязателен';
    } else {
        const normalized = normalizeLicensePlate(data.stateNumber);
        if (!/^[A-Z]{1}[0-9]{3}[A-Z]{2}[0-9]{2,3}$/.test(normalized)) {
            errors.stateNumber = 'Неверный формат госномера. Примеры: А123АА123 или A123AA123';
        }
    }
    
    // Марка
    if (!data.brand?.trim()) {
        errors.brand = 'Марка обязательна';
    } else if (data.brand.trim().length < 2) {
        errors.brand = 'Марка должна содержать минимум 2 символа';
    } else if (data.brand.trim().length > 30) {
        errors.brand = 'Марка не должна превышать 30 символов';
    }
    
    // Модель
    if (!data.model?.trim()) {
        errors.model = 'Модель обязательна';
    } else if (data.model.trim().length < 1) {
        errors.model = 'Модель должна содержать минимум 1 символ';
    } else if (data.model.trim().length > 30) {
        errors.model = 'Модель не должна превышать 30 символов';
    }
    
    // Год выпуска
    if (!data.manufactureYear) {
        errors.manufactureYear = 'Год выпуска обязателен';
    } else {
        const year = parseInt(data.manufactureYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear) {
            errors.manufactureYear = `Год выпуска должен быть от 1900 до ${currentYear}`;
        }
    }
    
    // Мощность
    if (!data.powerHp) {
        errors.powerHp = 'Мощность обязательна';
    } else {
        const power = parseInt(data.powerHp);
        if (isNaN(power) || power < 1 || power > 2000) {
            errors.powerHp = 'Мощность должна быть от 1 до 2000 л.с.';
        }
    }
    
    // VIN
    if (!data.vin?.trim()) {
        errors.vin = 'VIN обязателен';
    } else {
        const vinClean = data.vin.trim().toUpperCase();
        if (vinClean.length !== 17) {
            errors.vin = 'VIN должен содержать ровно 17 символов';
        } else if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vinClean)) {
            errors.vin = 'VIN может содержать только латинские буквы (кроме I,O,Q) и цифры';
        }
    }
    
    // Категория
    if (!data.category) {
        errors.category = 'Выберите категорию ТС';
    }
    
    // Стоимость для КАСКО
    if (policyType === 'kasko') {
        if (!data.purchasePrice) {
            errors.purchasePrice = 'Стоимость автомобиля обязательна';
        } else {
            const price = parseFloat(data.purchasePrice);
            if (isNaN(price) || price < 10000) {
                errors.purchasePrice = 'Стоимость должна быть не менее 10 000 ₽';
            }
        }
    }
    
    return errors;
};

// Валидация дат
export const validateDates = (startDate, endDate) => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!startDate) {
        errors.startDate = 'Дата начала обязательна';
    } else {
        const start = new Date(startDate);
        if (start < today) {
            errors.startDate = 'Дата начала не может быть раньше сегодняшнего дня';
        }
    }
    
    if (!endDate) {
        errors.endDate = 'Дата окончания обязательна';
    } else if (startDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            errors.endDate = 'Дата окончания должна быть позже даты начала';
        }
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
            errors.endDate = 'Минимальный срок страхования — 30 дней';
        }
        if (diffDays > 365) {
            errors.endDate = 'Максимальный срок страхования — 365 дней';
        }
    }
    
    return errors;
};