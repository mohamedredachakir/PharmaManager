import { useAlertes } from '../hooks/useAlertes';
import { useMedicaments } from '../hooks/useMedicaments';
import { useVentes } from '../hooks/useVentes';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBadge from '../components/common/AlertBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { medicaments } = useMedicaments();
  const { alertes, loading: alertLoading } = useAlertes();
  const { ventes } = useVentes();

  const today = new Date().toISOString().slice(0, 10);
  const ventesAujourdhui = ventes.filter((v) => v.date_vente?.slice(0, 10) === today && v.statut !== 'ANNULEE');
  const revenueAujourdhui = ventesAujourdhui.reduce((s, v) => s + parseFloat(v.total_ttc || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(new Date().toISOString())}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-green">
          <div className="stat-value green">{medicaments.length}</div>
          <div className="stat-label">Médicaments actifs</div>
        </div>
        <div className="stat-card stat-alert">
          <div className="stat-value red">{alertes.length}</div>
          <div className="stat-label">Alertes de stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{ventesAujourdhui.length}</div>
          <div className="stat-label">Ventes aujourd'hui</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-value green">{formatCurrency(revenueAujourdhui)}</div>
          <div className="stat-label">Revenu aujourd'hui</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Alertes de réapprovisionnement</h2>
          {alertes.length > 0 && <AlertBadge type="alert" />}
        </div>

        {alertLoading ? (
          <LoadingSpinner />
        ) : alertes.length === 0 ? (
          <div className="empty-state">Tous les stocks sont à niveau. ✓</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Catégorie</th>
                <th>Stock actuel</th>
                <th>Stock minimum</th>
                <th>Manque</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {alertes.map((med) => (
                <tr key={med.id} className="row-alert">
                  <td style={{ fontWeight: 500 }}>{med.nom} <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>({med.dosage})</span></td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{med.categorie_nom || '—'}</td>
                  <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{med.stock_actuel}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{med.stock_minimum}</td>
                  <td style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                    {Math.max(0, med.stock_minimum - med.stock_actuel)} unités
                  </td>
                  <td><AlertBadge type={med.stock_actuel === 0 ? 'alert' : 'warning'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
