import { formatCurrency } from '../../utils/formatters';

export default function LigneVenteRow({ ligne, medicaments, index, onChange, onRemove }) {
  const handleMedicamentChange = (e) => {
    const med = medicaments.find((m) => m.id === Number(e.target.value));
    onChange(index, {
      ...ligne,
      medicament_id: med?.id || '',
      prix_unitaire: med?.prix_vente || 0,
      sous_total: (ligne.quantite || 0) * (med?.prix_vente || 0),
    });
  };

  const handleQuantiteChange = (e) => {
    const quantite = Math.max(1, Number(e.target.value));
    onChange(index, {
      ...ligne,
      quantite,
      sous_total: quantite * (ligne.prix_unitaire || 0),
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 120px 40px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
      <select value={ligne.medicament_id || ''} onChange={handleMedicamentChange} required>
        <option value="">— Médicament —</option>
        {medicaments.map((m) => (
          <option key={m.id} value={m.id} disabled={m.stock_actuel === 0}>
            {m.nom} ({m.dosage}) — Stock: {m.stock_actuel}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        max={medicaments.find((m) => m.id === ligne.medicament_id)?.stock_actuel || 9999}
        value={ligne.quantite || 1}
        onChange={handleQuantiteChange}
        style={{ textAlign: 'center' }}
      />

      <div style={{ padding: '8px 12px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
        {ligne.prix_unitaire ? formatCurrency(ligne.prix_unitaire) : '—'}
      </div>

      <div style={{ padding: '8px 12px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-green-500)' }}>
        {ligne.sous_total ? formatCurrency(ligne.sous_total) : '—'}
      </div>

      <button type="button" onClick={() => onRemove(index)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
        ✕
      </button>
    </div>
  );
}
