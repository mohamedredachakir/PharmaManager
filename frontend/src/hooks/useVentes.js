import { useState, useEffect, useCallback } from 'react';
import { fetchVentes } from '../api/ventesApi';

export const useVentes = (filters = {}) => {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVentes(filters);
      setVentes(data.results || data);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement des ventes.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { ventes, loading, error, refresh: load };
};
