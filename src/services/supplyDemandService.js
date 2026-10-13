import api from './api';

export const getSupplyDemandOverview = async (crop = 'Rice', state = 'Andhra Pradesh', district = 'Krishna', season = 'Kharif') => {
  const response = await api.get('/farmer/supply-demand/overview', {
    params: { crop, state, district, season },
  });
  return response.data;
};

export default {
  getSupplyDemandOverview,
};
