import { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../api/categoriesApi';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCategories()
      .then((data) => setCategories(data.results || data))
      .catch((err) => setError(err.userMessage || 'Erreur.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, refresh: load };
};
