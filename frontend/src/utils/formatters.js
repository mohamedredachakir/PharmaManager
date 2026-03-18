export const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '—';
  return num.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatStatut = (statut) => {
  const map = {
    EN_COURS: 'En cours',
    COMPLETEE: 'Complétée',
    ANNULEE: 'Annulée',
  };
  return map[statut] || statut;
};

export const statutBadgeClass = (statut) => {
  const map = {
    EN_COURS: 'badge badge-yellow',
    COMPLETEE: 'badge badge-green',
    ANNULEE: 'badge badge-gray',
  };
  return map[statut] || 'badge badge-gray';
};
