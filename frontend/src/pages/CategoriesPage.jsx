import { useMemo, useState } from 'react';
import { createCategorie, deleteCategorie, updateCategorie } from '../api/categoriesApi';
import ConfirmModal from '../components/common/ConfirmModal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useCategories } from '../hooks/useCategories';

const EMPTY_FORM = { nom: '', description: '' };

export default function CategoriesPage() {
  const { categories, loading, error, refresh } = useCategories();
  const [search, setSearch] = useState('');

  const [modalMode, setModalMode] = useState(null); // null | create | edit
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) => {
      return (
        item.nom?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    });
  }, [categories, search]);

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModalMode('create');
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({ nom: item.nom || '', description: item.description || '' });
    setSaveError(null);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
    setForm(EMPTY_FORM);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        nom: form.nom.trim(),
        description: form.description?.trim() || '',
      };
      if (!payload.nom) {
        throw new Error('Le nom est obligatoire.');
      }

      if (modalMode === 'edit' && selected) {
        await updateCategorie(selected.id, payload);
      } else {
        await createCategorie(payload);
      }

      closeModal();
      refresh();
    } catch (err) {
      setSaveError(err.userMessage || err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    setSaveError(null);
    try {
      await deleteCategorie(confirmDelete.id);
      setConfirmDelete(null);
      refresh();
    } catch (err) {
      setSaveError(err.userMessage || 'Impossible de supprimer cette catégorie.');
      setConfirmDelete(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Catégories</h1>
        <button className="btn-primary" onClick={openCreate}>+ Nouvelle catégorie</button>
      </div>

      <ErrorMessage message={error || saveError} onDismiss={() => setSaveError(null)} />

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Rechercher une catégorie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary" onClick={() => setSearch('')} style={{ fontSize: '12px' }}>
          Réinitialiser
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="empty-state">Aucune catégorie trouvée.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nom}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{item.description || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{item.date_creation ? new Date(item.date_creation).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-ghost" onClick={() => openEdit(item)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                        Modifier
                      </button>
                      <button className="btn-danger" onClick={() => setConfirmDelete(item)} style={{ fontSize: '12px', padding: '4px 8px' }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalMode && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ width: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'edit' ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
              <button className="btn-ghost" onClick={closeModal} style={{ color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <form onSubmit={submit} className="modal-body">
              <div className="form-group">
                <label htmlFor="cat-nom">Nom *</label>
                <input
                  id="cat-nom"
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Supprimer la catégorie"
          message="Cette action peut échouer si la catégorie est encore utilisée par des médicaments."
          confirmLabel="Supprimer"
          confirmVariant="danger"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
