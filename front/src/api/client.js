import axios from 'axios';

console.log('=== [client] ИНИЦИАЛИЗАЦИЯ ===');

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

console.log('=== [client] API создан, baseURL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
    console.log('=== [client] INTERCEPTOR REQUEST ===');
    console.log('URL:', config.url);
    console.log('Метод:', config.method);
    console.log('Данные:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
        console.log('Токен найден, добавляем Authorization');
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log('Токен не найден');
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('=== [client] INTERCEPTOR RESPONSE SUCCESS ===');
        console.log('Статус:', response.status);
        console.log('Данные:', response.data);
        return response;
    },
    (error) => {
        console.error('=== [client] INTERCEPTOR RESPONSE ERROR ===');
        console.error('Статус:', error.response?.status);
        console.error('Данные ошибки:', error.response?.data);
        return Promise.reject(error);
    }
);

export default api;