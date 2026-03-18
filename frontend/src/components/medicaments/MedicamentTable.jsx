import AlertBadge from '../common/AlertBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function MedicamentTable({ medicaments, onEdit, onDelete }) {
  if (!medicaments.length) {
    return <div className="empty-state">Aucun médicament trouvé.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>DCI</th>
          <th>Catégorie</th>
          <th>Forme</th>
          <th>Stock actuel</th>
          <th>Stock min</th>
          <th>Prix vente</th>
          <th>Ordonnance</th>
          <th>Expiration</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {medicaments.map((med) => (
          <tr key={med.id} className={med.est_en_alerte ? 'row-alert' : ''}>
            <td style={{ fontWeight: 500 }}>{med.nom}</td>
            <td style={{ color: 'var(--color-text-secondary)' }}>{med.dci || '—'}</td>
            <td>{med.categorie_nom || med.categorie}</td>
            <td>{med.forme}</td>
            <td style={{ color: med.est_en_alerte ? 'var(--color-danger)' : 'inherit', fontWeight: med.est_en_alerte ? 600 : 400 }}>
              {med.stock_actuel}
            </td>
            <td style={{ color: 'var(--color-text-secondary)' }}>{med.stock_minimum}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{formatCurrency(med.prix_vente)}</td>
            <td>{med.ordonnance_requise ? <span className="badge badge-yellow">OUI</span> : <span className="badge badge-gray">NON</span>}</td>
            <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{formatDate(med.date_expiration)}</td>
            <td>{med.est_en_alerte ? <AlertBadge type="alert" /> : <AlertBadge type="ok" />}</td>
            <td>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn-ghost" onClick={() => onEdit(med)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => onDelete(med.id)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
