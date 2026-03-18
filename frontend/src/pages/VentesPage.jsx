import { useState } from 'react';
import { useVentes } from '../hooks/useVentes';
import { createVente, annulerVente } from '../api/ventesApi';
import VenteTable from '../components/ventes/VenteTable';
import VenteForm from '../components/ventes/VenteForm';
import ConfirmModal from '../components/common/ConfirmModal';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VentesPage() {
  const { ventes, loading, error, refresh } = useVentes();
  const [showForm, setShowForm] = useState(false);
  const [confirmAnnul, setConfirmAnnul] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleCreate = async (data) => {
    setSaving(true);
    setSaveError(null);
    try {
      await createVente(data);
      setShowForm(false);
      refresh();
    } catch (err) {
      setSaveError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async () => {
    setSaving(true);
    try {
      await annulerVente(confirmAnnul);
      setConfirmAnnul(null);
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
        <h1>Ventes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nouvelle vente</button>
      </div>

      <ErrorMessage message={error || saveError} onDismiss={() => setSaveError(null)} />

      <div className="card" style={{ padding: 0 }}>
        {loading ? <LoadingSpinner /> : (
          <VenteTable
            ventes={ventes}
            onAnnuler={(id) => setConfirmAnnul(id)}
          />
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ width: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvelle vente</h3>
              <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <div className="modal-body">
              <VenteForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                loading={saving}
                error={saveError}
              />
            </div>
          </div>
        </div>
      )}

      {confirmAnnul && (
        <ConfirmModal
          title="Annuler la vente"
          message="Cette vente sera marquée comme annulée et les stocks seront réintégrés automatiquement."
          confirmLabel="Confirmer l'annulation"
          confirmVariant="danger"
          onConfirm={handleAnnuler}
          onCancel={() => setConfirmAnnul(null)}
          loading={saving}
        />
      )}
    </div>
  );
}
