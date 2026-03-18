import { useState, useEffect, useCallback } from 'react';
import { fetchMedicaments } from '../api/medicamentsApi';

export const useMedicaments = (filters = {}) => {
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMedicaments(filters);
      const items = data.results || data;
      const sorted = [...items].sort((a, b) => {
        const da = new Date(a.date_creation || 0).getTime();
        const db = new Date(b.date_creation || 0).getTime();
        return db - da;
      });
      setMedicaments(sorted);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement des médicaments.');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { medicaments, loading, error, refresh: load };
};
