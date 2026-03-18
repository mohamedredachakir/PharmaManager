import { useState } from 'react';
import { useMedicaments } from '../hooks/useMedicaments';
import { useCategories } from '../hooks/useCategories';
import { createMedicament, updateMedicament, deleteMedicament } from '../api/medicamentsApi';
import MedicamentTable from '../components/medicaments/MedicamentTable';
import MedicamentForm from '../components/medicaments/MedicamentForm';
import ConfirmModal from '../components/common/ConfirmModal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MedicamentsPage() {
  const [filters, setFilters] = useState({ search: '', categorie: '' });
  const { medicaments, loading, error, refresh } = useMedicaments(filters);
  const { categories } = useCategories();

  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // medicament id
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [apiErrors, setApiErrors] = useState({});

  const openCreate = () => { setSelected(null); setApiErrors({}); setSaveError(null); setModal('create'); };
  const openEdit = (med) => { setSelected(med); setApiErrors({}); setSaveError(null); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSubmit = async (data) => {
    setSaving(true);
    setSaveError(null);
    setApiErrors({});
    try {
      const payload = {
        ...data,
        nom: data.nom?.trim() || '',
        dci: data.dci?.trim() || '',
        forme: data.forme?.trim() || '',
        dosage: data.dosage?.trim() || '',
        categorie: Number(data.categorie),
        prix_achat: Number(data.prix_achat),
        prix_vente: Number(data.prix_vente),
        stock_actuel: Number(data.stock_actuel),
        stock_minimum: Number(data.stock_minimum),
      };

      if (!payload.nom || !payload.forme || !payload.dosage || !data.date_expiration) {
        setSaveError('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (!Number.isFinite(payload.categorie) || payload.categorie <= 0) {
        setApiErrors({ categorie: ['Veuillez selectionner une categorie valide.'] });
        return;
      }
      if (!Number.isFinite(payload.prix_achat) || !Number.isFinite(payload.prix_vente)) {
        setSaveError('Les prix saisis sont invalides.');
        return;
      }
      if (payload.prix_vente <= payload.prix_achat) {
        setApiErrors({ non_field_errors: ["Le prix de vente doit etre superieur au prix d'achat."] });
        return;
      }
      if (!Number.isInteger(payload.stock_actuel) || !Number.isInteger(payload.stock_minimum) || payload.stock_actuel < 0 || payload.stock_minimum < 0) {
        setSaveError('Les valeurs de stock doivent etre des entiers positifs.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiration = new Date(data.date_expiration);
      expiration.setHours(0, 0, 0, 0);
      if (expiration <= today) {
        setApiErrors({ non_field_errors: ["La date d'expiration doit etre dans le futur."] });
        return;
      }

      if (modal === 'edit') {
        await updateMedicament(selected.id, payload);
      } else {
        await createMedicament(payload);
        // Ensure the newly created row is visible even if previous filters hid it.
        setFilters({ search: '', categorie: '' });
      }
      closeModal();
      refresh();
    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object') {
        setApiErrors(err.response.data);
      } else {
        setSaveError(err.userMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteMedicament(confirmDelete);
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      setSaveError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Médicaments</h1>
        <button className="btn-primary" onClick={openCreate}>+ Ajouter un médicament</button>
      </div>

      <ErrorMessage message={error} />

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Rechercher par nom, DCI..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select
          className="filter-select"
          value={filters.categorie}
          onChange={(e) => setFilters((f) => ({ ...f, categorie: e.target.value }))}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
        <button className="btn-secondary" onClick={() => setFilters({ search: '', categorie: '' })} style={{ fontSize: '12px' }}>
          Réinitialiser
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <MedicamentTable
            medicaments={medicaments}
            onEdit={openEdit}
            onDelete={(id) => setConfirmDelete(id)}
          />
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ width: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'edit' ? 'Modifier le médicament' : 'Nouveau médicament'}</h3>
              <button className="btn-ghost" onClick={closeModal} style={{ color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <div className="modal-body">
              <ErrorMessage message={saveError} onDismiss={() => setSaveError(null)} />
              <MedicamentForm
                initialData={selected}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                loading={saving}
                apiErrors={apiErrors}
              />
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Supprimer le médicament"
          message="Ce médicament sera archivé (soft delete) et n'apparaîtra plus dans la liste. Cette action est réversible depuis l'admin Django."
          confirmLabel="Supprimer"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
