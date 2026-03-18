import { useState } from 'react';
import { useMedicaments } from '../../hooks/useMedicaments';
import LigneVenteRow from './LigneVenteRow';
import { formatCurrency } from '../../utils/formatters';

const newLigne = () => ({ medicament_id: '', quantite: 1, prix_unitaire: 0, sous_total: 0 });

export default function VenteForm({ onSubmit, onCancel, loading = false, error = null }) {
  const [lignes, setLignes] = useState([newLigne()]);
  const [notes, setNotes] = useState('');
  const { medicaments } = useMedicaments();

  const grandTotal = lignes.reduce((sum, l) => sum + (l.sous_total || 0), 0);

  const updateLigne = (index, updated) => {
    setLignes((prev) => prev.map((l, i) => (i === index ? updated : l)));
  };

  const removeLigne = (index) => {
    if (lignes.length === 1) return;
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      lignes: lignes.map(({ medicament_id, quantite }) => ({ medicament_id, quantite })),
      notes,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px 120px 40px', gap: '8px', marginBottom: '6px' }}>
        <label>Médicament</label>
        <label style={{ textAlign: 'center' }}>Qté</label>
        <label>Prix unitaire</label>
        <label>Sous-total</label>
        <span />
      </div>

      {lignes.map((ligne, i) => (
        <LigneVenteRow
          key={i}
          index={i}
          ligne={ligne}
          medicaments={medicaments}
          onChange={updateLigne}
          onRemove={removeLigne}
        />
      ))}

      <button
        type="button"
        className="btn-secondary"
        onClick={() => setLignes((prev) => [...prev, newLigne()])}
        style={{ marginTop: '8px', fontSize: '12px' }}
      >
        + Ajouter un article
      </button>

      <hr className="divider" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total TTC</span>
        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-green-500)' }}>
          {formatCurrency(grandTotal)}
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optionnel)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Remarques sur la vente..."
        />
      </div>

      {error && <div className="error-banner" style={{ marginTop: '12px' }}><span>⚠</span>{error}</div>}

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={loading || grandTotal === 0}>
          {loading ? 'Enregistrement...' : `Valider la vente — ${formatCurrency(grandTotal)}`}
        </button>
      </div>
    </form>
  );
}
