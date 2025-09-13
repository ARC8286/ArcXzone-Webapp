import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password })
    .then(response => response.data);
};

export const getProfile = () => {
  return api.get('/auth/profile')
    .then(response => response.data);
};
