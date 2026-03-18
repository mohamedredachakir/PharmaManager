# PharmaManager TODO Audit

Date: 2026-03-18
Scope: prompt compliance audit + runtime bug tracking + fix progress

## 1) Prompt Compliance Matrix

### Backend

- [x] Django project structure with `categories`, `medicaments`, `ventes`
- [x] Required packages in `backend/requirements.txt`
- [x] Settings use `python-decouple` and include all required apps
- [x] `LANGUAGE_CODE` and `TIME_ZONE` match prompt
- [x] Models and serializers implemented with docstrings
- [x] Soft delete implemented for medicaments
- [x] `alertes` endpoint implemented
- [x] Vente create/annuler business logic implemented
- [x] Admin registrations implemented with `list_display`, `search_fields`, `list_filter`
- [x] Fixtures file exists and loads
- [x] Swagger decorators present on view methods
- [x] Swagger examples added on CRUD/custom actions for categories, medicaments, and ventes

### Frontend

- [x] React + Vite structure exists
- [x] API layer implemented (`src/api/*`), components do not import axios directly
- [x] Hooks implemented: `useMedicaments`, `useVentes`, `useCategories`, `useAlertes`
- [x] Pages implemented: Dashboard, Medicaments, Ventes
- [x] Common components implemented: LoadingSpinner, ErrorMessage, ConfirmModal, AlertBadge
- [x] Medicament components implemented
- [x] Ventes components implemented: `VenteForm`, `LigneVenteRow`, `VenteTable`
- [x] Medicaments page now includes category filter
- [x] Medicaments table now includes required category + ordonnance columns
- [x] Utilities implemented (`formatCurrency`, `formatDate`, `formatStatut`)

### Infrastructure / Docs

- [x] Docker Compose works and services are up
- [x] Backend and frontend Dockerfiles exist
- [x] Root README + project docs exist
- [ ] Git conventional commits cannot be verified here (workspace currently not a git repo)

## 2) Bugs Found and Current Status

### Fixed

- [x] Backend could not resolve DB host because `postgres` service was not on same network
- [x] Frontend page imports were broken (wrong relative paths)
- [x] `LoadingSpinner` import was incorrect in `MedicamentForm`
- [x] Missing Django migrations for custom apps (`categories`, `medicaments`, `ventes`)
- [x] `alertes` queryset used invalid comparison (`Medicament.stock_minimum` class attribute)
- [x] `annuler` repeated call now returns `409 Conflict` (was `400`)
- [x] `create` responses for medicaments and ventes now return detailed read serializers (with `id`)
- [x] Vente creation is now transaction-safe (`transaction.atomic`)

### Remaining / Technical Debt

- [ ] Frontend visual design remains mostly inline/basic and can be improved for maintainability

## 3) Runtime Validation Results (Executed)

### Service Health

- [x] `docker compose ps` shows `db`, `backend`, `frontend` running
- [x] Frontend HTTP check: `http://localhost:5173` -> `200`
- [x] Swagger UI check: `http://localhost:8000/api/schema/swagger-ui/` -> `200`
- [x] Build check: `docker compose exec frontend npm run build` -> success
- [x] Migration sync check: `categories` and `medicaments` now include applied `0003` migrations

### Functional API Tests

- [x] Soft delete behavior:
  - DELETE temporary medicament -> `204`
  - GET same medicament after delete -> `404`
- [x] Stock business rules:
  - Stock before sale: `15`
  - After sale of qty=1: `14`
  - After annulation: `15`
- [x] Annulation conflict rule:
  - First cancel -> `200`
  - Second cancel -> `409`

### Automated Tests

- [x] Added and executed backend tests:
  - `apps.medicaments.tests.MedicamentApiTests`
  - `apps.ventes.tests.VenteApiTests`
- [x] Command run: `docker compose exec backend python manage.py test apps.medicaments apps.ventes -v 2`
- [x] Result: `5 tests`, all passed

## 4) What Was Created During This Pass

### New Files

- `frontend/src/components/ventes/LigneVenteRow.jsx`
- `frontend/src/components/ventes/VenteForm.jsx`
- `frontend/src/components/ventes/VenteTable.jsx`
- `backend/apps/medicaments/tests.py`
- `backend/apps/ventes/tests.py`
- `backend/apps/categories/migrations/0003_backfill_and_alter_categorie_date_creation.py`
- `backend/apps/medicaments/migrations/0003_backfill_and_alter_medicament_date_creation.py`
- `TODO_PROJECT_AUDIT.md`

### Updated Files

- `backend/apps/categories/models.py`
- `backend/apps/medicaments/models.py`
- `backend/fixtures/initial_data.json`
- `backend/apps/medicaments/views.py`
- `backend/apps/ventes/views.py`
- `backend/apps/ventes/serializers.py`
- `backend/apps/categories/views.py`
- `frontend/src/components/medicaments/MedicamentTable.jsx`
- `frontend/src/pages/MedicamentsPage.jsx`
- `frontend/src/pages/VentesPage.jsx`

## 5) Next Work Plan

- [x] Decide whether to enforce strict non-null `date_creation` in fixtures/models and migrate existing data
- [x] Add backend automated tests (`soft delete`, `alertes`, `vente create`, `vente annulation`, validation errors)
- [ ] Add frontend smoke tests (optional) and improve CSS architecture (reduce inline style sprawl)
