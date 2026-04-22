import api from './client';

export const getMyPolicies = () => {
    return api.get('/client/policies');
};

export const getPolicy = (id) => {
    return api.get(`/client/policies/${id}`);
};

export const calculatePolicy = (data) => {
    return api.post('/client/policies/calculate', data);
};

export const createPolicy = (data) => {
    return api.post('/client/policies', data);
};

export const payPolicy = (id) => {
    return api.post(`/client/policies/${id}/pay`);
};

export const cancelPolicy = (id) => {
    return api.post(`/client/policies/${id}/cancel`);
};

