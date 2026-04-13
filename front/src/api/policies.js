import api from './client';

// Получить все полисы текущего клиента
export const getMyPolicies = () => {
    return api.get('/client/policies');
};

// Получить конкретный полис
export const getPolicy = (id) => {
    return api.get(`/client/policies/${id}`);
};

// Рассчитать стоимость полиса
export const calculatePolicy = (data) => {
    return api.post('/client/policies/calculate', data);
};

// Оформить полис
export const createPolicy = (data) => {
    return api.post('/client/policies', data);
};

// Оплатить полис
export const payPolicy = (id) => {
    return api.post(`/client/policies/${id}/pay`);
};

// Отменить полис
export const cancelPolicy = (id) => {
    return api.post(`/client/policies/${id}/cancel`);
};