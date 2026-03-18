import { useState, useEffect, useCallback } from 'react';
import { fetchAlertes } from '../api/medicamentsApi';

export const useAlertes = () => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlertes();
      setAlertes(data.results || data);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement des alertes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { alertes, loading, error, refresh: load };
};
