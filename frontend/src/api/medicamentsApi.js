import axiosInstance from './axiosConfig';

export const fetchMedicaments = async (params = {}) => {
  const response = await axiosInstance.get('/medicaments/', { params });
  const data = response.data;

  if (!data || !Array.isArray(data.results) || !data.next) {
    return data;
  }

  // The UI has no explicit pagination controls, so load remaining pages.
  const allResults = [...data.results];
  let nextUrl = data.next;
  let guard = 0;

  while (nextUrl && guard < 50) {
    const pageResponse = await axiosInstance.get(nextUrl);
    const pageData = pageResponse.data;

    if (Array.isArray(pageData?.results)) {
      allResults.push(...pageData.results);
      nextUrl = pageData.next;
    } else {
      nextUrl = null;
    }

    guard += 1;
  }

  return {
    ...data,
    results: allResults,
    next: null,
    previous: null,
  };
};

export const fetchMedicamentById = async (id) => {
  const response = await axiosInstance.get(`/medicaments/${id}/`);
  return response.data;
};

export const createMedicament = async (data) => {
  const response = await axiosInstance.post('/medicaments/', data);
  return response.data;
};

export const updateMedicament = async (id, data) => {
  const response = await axiosInstance.patch(`/medicaments/${id}/`, data);
  return response.data;
};

export const deleteMedicament = async (id) => {
  await axiosInstance.delete(`/medicaments/${id}/`);
};

export const fetchAlertes = async () => {
  const response = await axiosInstance.get('/medicaments/alertes/');
  return response.data;
};
