import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const firstValue = data && typeof data === 'object' ? Object.values(data)[0] : undefined;
    const normalizedFirstValue = Array.isArray(firstValue) ? firstValue[0] : firstValue;
    const message =
      (typeof data === 'string' ? data : undefined) ||
      data?.detail ||
      data?.message ||
      normalizedFirstValue ||
      (error.request && !error.response
        ? 'Impossible de contacter le serveur. Verifiez la configuration reseau/CORS.'
        : undefined) ||
      'Une erreur est survenue.';
    return Promise.reject({ ...error, userMessage: message });
  }
);

export default axiosInstance;
