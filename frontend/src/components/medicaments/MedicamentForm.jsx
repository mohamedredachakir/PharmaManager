import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';

const EMPTY_FORM = {
  nom: '', dci: '', categorie: '', forme: '', dosage: '',
  prix_achat: '', prix_vente: '', stock_actuel: '0',
  stock_minimum: '10', date_expiration: '', ordonnance_requise: false,
};

export default function MedicamentForm({ initialData = null, onSubmit, onCancel, loading = false, apiErrors = {} }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const { categories } = useCategories();

  useEffect(() => {
    setForm(initialData || EMPTY_FORM);
  }, [initialData]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const field = (name, label, type = 'text', required = true) => (
    <div className="form-group">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <input
        id={name}
        type={type}
        value={form[name] ?? ''}
        onChange={(e) => set(name, e.target.value)}
        className={apiErrors[name] ? 'error' : ''}
        required={required}
        step={type === 'number' && (name.includes('prix') ? '0.01' : '1')}
        min={type === 'number' ? 0 : undefined}
      />
      {apiErrors[name] && <span className="form-error">{apiErrors[name][0]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {field('nom', 'Nom commercial')}
        {field('dci', 'DCI (Dénomination Commune)', 'text', false)}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="categorie">Catégorie *</label>
          <select
            id="categorie"
            value={form.categorie}
            onChange={(e) => set('categorie', e.target.value)}
            className={apiErrors.categorie ? 'error' : ''}
            required
          >
            <option value="">— Sélectionner —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          {apiErrors.categorie && <span className="form-error">{apiErrors.categorie[0]}</span>}
        </div>
        {field('forme', 'Forme galénique')}
      </div>

      <div className="form-grid">
        {field('dosage', 'Dosage')}
        {field('date_expiration', "Date d'expiration", 'date')}
      </div>

      <div className="form-grid">
        {field('prix_achat', "Prix d'achat (MAD)", 'number')}
        {field('prix_vente', 'Prix de vente (MAD)', 'number')}
      </div>

      <div className="form-grid">
        {field('stock_actuel', 'Stock actuel', 'number')}
        {field('stock_minimum', 'Stock minimum (seuil alerte)', 'number')}
      </div>

      {apiErrors.non_field_errors && (
        <div className="form-group" style={{ marginTop: '4px' }}>
          <span className="form-error">{apiErrors.non_field_errors[0]}</span>
        </div>
      )}

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textTransform: 'none', fontSize: '13px', fontWeight: 400 }}>
          <input
            type="checkbox"
            checked={form.ordonnance_requise}
            onChange={(e) => set('ordonnance_requise', e.target.checked)}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
          Médicament sous ordonnance
        </label>
      </div>

      <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer le médicament')}
        </button>
      </div>
    </form>
  );
}
