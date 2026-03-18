import axiosInstance from './axiosConfig';

export const fetchCategories = async () => {
  const response = await axiosInstance.get('/categories/');
  return response.data;
};

export const createCategorie = async (data) => {
  const response = await axiosInstance.post('/categories/', data);
  return response.data;
};

export const updateCategorie = async (id, data) => {
  const response = await axiosInstance.patch(`/categories/${id}/`, data);
  return response.data;
};

export const deleteCategorie = async (id) => {
  await axiosInstance.delete(`/categories/${id}/`);
};
