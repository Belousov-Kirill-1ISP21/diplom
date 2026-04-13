import api from './client'; // Добавьте этот импорт

export const register = (data) => {
    console.log('=== [auth/register] НАЧАЛО ===');
    console.log('Полученные data:', data);
    
    const payload = {
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        last_name: data.last_name,
        first_name: data.first_name,
        middle_name: data.middle_name || '',
        birth_date: data.birth_date,
        
        // Паспортные данные
        passport_series: data.passport_series,
        passport_number: data.passport_number,
        passport_issued_by: data.passport_issued_by,
        passport_issue_date: data.passport_issue_date,
        
        // Водительские права
        driver_license_series: data.driver_license_series,
        driver_license_number: data.driver_license_number,
        driver_license_issued_by: data.driver_license_issued_by,
        driver_license_issue_date: data.driver_license_issue_date,
        driver_license_expiry_date: data.driver_license_expiry_date,
        driver_categories: data.driver_categories,
    };
    
    console.log('Сформированный payload:', payload);
    
    return api.post('/auth/register', payload);
};

export const login = (email, password) => {
    console.log('=== [auth/login] НАЧАЛО ===');
    console.log('Email:', email);
    
    return api.post('/auth/login', { email, password }).then(
        (response) => {
            console.log('=== [auth/login] УСПЕХ ===');
            console.log('Ответ:', response);
            return response;
        },
        (error) => {
            console.error('=== [auth/login] ОШИБКА ===');
            console.error('error.response:', error.response);
            console.error('error.response?.data:', error.response?.data);
            throw error;
        }
    );
};

export const getMe = () => {
    console.log('=== [auth/getMe] НАЧАЛО ===');
    
    return api.get('/auth/me').then(
        (response) => {
            console.log('=== [auth/getMe] УСПЕХ ===');
            console.log('Ответ:', response);
            return response;
        },
        (error) => {
            console.error('=== [auth/getMe] ОШИБКА ===');
            console.error('error.response:', error.response);
            console.error('error.response?.data:', error.response?.data);
            throw error;
        }
    );
};

export const logout = () => {
    console.log('=== [auth/logout] НАЧАЛО ===');
    
    return api.post('/auth/logout').then(
        (response) => {
            console.log('=== [auth/logout] УСПЕХ ===');
            console.log('Ответ:', response);
            return response;
        },
        (error) => {
            console.error('=== [auth/logout] ОШИБКА ===');
            console.error('error.response:', error.response);
            console.error('error.response?.data:', error.response?.data);
            throw error;
        }
    );
};

export const changePassword = (currentPassword, newPassword, newPasswordConfirmation) => {
    console.log('=== [auth/changePassword] НАЧАЛО ===');
    
    return api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
    }).then(
        (response) => {
            console.log('=== [auth/changePassword] УСПЕХ ===');
            console.log('Ответ:', response);
            return response;
        },
        (error) => {
            console.error('=== [auth/changePassword] ОШИБКА ===');
            console.error('error.response:', error.response);
            console.error('error.response?.data:', error.response?.data);
            throw error;
        }
    );
};

export const updateProfile = (data) => {
    console.log('=== [auth/updateProfile] НАЧАЛО ===');
    console.log('Данные для обновления:', data);
    
    return api.put('/profile', data).then(
        (response) => {
            console.log('=== [auth/updateProfile] УСПЕХ ===');
            console.log('Ответ:', response);
            return response;
        },
        (error) => {
            console.error('=== [auth/updateProfile] ОШИБКА ===');
            console.error('error.response:', error.response);
            throw error;
        }
    );
};
