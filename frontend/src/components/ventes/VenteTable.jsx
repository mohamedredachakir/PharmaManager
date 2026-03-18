import { formatDateTime, formatCurrency, formatStatut, statutBadgeClass } from '../../utils/formatters';

export default function VenteTable({ ventes, onAnnuler }) {
  if (!ventes.length) {
    return <div className="empty-state">Aucune vente enregistrée.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Référence</th>
          <th>Date</th>
          <th>Nb articles</th>
          <th>Total TTC</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {ventes.map((vente) => (
          <tr key={vente.id} className={vente.statut === 'ANNULEE' ? 'row-annulee' : ''}>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-green-500)' }}>
              {vente.reference}
            </td>
            <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{formatDateTime(vente.date_vente)}</td>
            <td style={{ color: 'var(--color-text-secondary)' }}>{vente.lignes?.length ?? '—'}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
              {formatCurrency(vente.total_ttc)}
            </td>
            <td><span className={statutBadgeClass(vente.statut)}>{formatStatut(vente.statut)}</span></td>
            <td>
              <button
                className="btn-danger"
                onClick={() => onAnnuler(vente.id)}
                disabled={vente.statut === 'ANNULEE'}
                style={{ fontSize: '12px' }}
              >
                Annuler
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
