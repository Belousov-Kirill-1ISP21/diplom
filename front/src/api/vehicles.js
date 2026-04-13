import api from './client';

export const getMyVehicles = () => {
    return api.get('/client/vehicles');
};

export const createVehicle = (data) => {
    return api.post('/client/vehicles', data);
};

export const updateVehicle = (id, data) => {
    return api.put(`/client/vehicles/${id}`, data);
};

export const deleteVehicle = (id) => {
    return api.delete(`/client/vehicles/${id}`);
};