# PharmaManager

Application complète de gestion de pharmacie — Développée dans le cadre du test technique SMARTHOLOL

## 📋 Vue d'ensemble

**PharmaManager** est une application web production-grade pour la gestion complète d'une pharmacie, incluant:

- Gestion des catégories de médicaments
- Inventaire des médicaments avec alertes de stock
- Enregistrement et suivi des ventes
- Interface web moderne et intuitive
- API REST complète avec documentation Swagger

## 🛠 Stack Technique

| Couche                | Technologie                                  |
| --------------------- | -------------------------------------------- |
| **Backend**           | Django 4.2.11 + Django REST Framework 3.14.0 |
| **Base de données**   | PostgreSQL 14+                               |
| **Documentation API** | Swagger UI (drf-spectacular)                 |
| **Frontend**          | React.js + Vite                              |
| **Gestion d'état**    | React Hooks                                  |
| **HTTP Client**       | Axios                                        |

## 📦 Structure du projet

```
pharma-manager/
├── backend/              # API Django REST
│   ├── config/           # Configuration projet
│   ├── apps/             # Applications Django
│   │   ├── categories/   # Gestion des catégories
│   │   ├── medicaments/  # Gestion des médicaments
│   │   └── ventes/       # Gestion des ventes
│   ├── fixtures/         # Données initiales
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # Interface React + Vite
│   ├── src/
│   │   ├── api/          # Couche API (axios)
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages principales
│   │   ├── hooks/        # Hooks personnalisés
│   │   └── utils/        # Fonctions utilitaires
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md (ce fichier)
```

## ✅ Prérequis

- **Python** 3.11 ou supérieur
- **Node.js** 18 ou supérieur
- **PostgreSQL** 14 ou supérieur
- **Git**

## 🚀 Installation rapide

### 1. Cloner le projet

```bash
git clone <repository-url>
cd pharma-manager
```

### 2. Configuration Backend

```bash
cd backend

# Créer et activer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres PostgreSQL

# Appliquer les migrations
python manage.py migrate

# Charger les données initiales
python manage.py loaddata fixtures/initial_data.json

# Créer un compte administrateur (optionnel)
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

Le backend sera disponible à: **http://localhost:8000**

### 3. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# L'URL par défaut pointe vers http://localhost:8000/api/v1

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible à: **http://localhost:5173**

## 📚 Documentation API

### Accéder à la documentation interactive

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **Schema JSON**: http://localhost:8000/api/schema/

### Points d'accès principaux

#### Catégories

- `GET /api/v1/categories/` — Lister toutes les catégories
- `POST /api/v1/categories/` — Créer une catégorie
- `GET /api/v1/categories/{id}/` — Détail d'une catégorie
- `PUT/PATCH /api/v1/categories/{id}/` — Modifier une catégorie
- `DELETE /api/v1/categories/{id}/` — Supprimer une catégorie

#### Médicaments

- `GET /api/v1/medicaments/` — Lister les médicaments actifs (paginé)
- `POST /api/v1/medicaments/` — Créer un médicament
- `GET /api/v1/medicaments/{id}/` — Détail d'un médicament
- `PUT/PATCH /api/v1/medicaments/{id}/` — Modifier un médicament
- `DELETE /api/v1/medicaments/{id}/` — Archiver un médicament (soft delete)
- `GET /api/v1/medicaments/alertes/` — Médicaments en rupture de stock

#### Ventes

- `GET /api/v1/ventes/` — Lister les ventes (paginé)
- `POST /api/v1/ventes/` — Enregistrer une nouvelle vente
- `GET /api/v1/ventes/{id}/` — Détail d'une vente
- `POST /api/v1/ventes/{id}/annuler/` — Annuler une vente

### Codes HTTP utilisés

| Code  | Signification                                                 |
| ----- | ------------------------------------------------------------- |
| `200` | Succès (GET)                                                  |
| `201` | Créé (POST)                                                   |
| `204` | Pas de contenu (DELETE)                                       |
| `400` | Erreur de validation                                          |
| `404` | Non trouvé                                                    |
| `409` | Conflit (ex: tentative d'annulation d'une vente déjà annulée) |

## 🔧 Admin Django

Accédez au panneau d'administration à: **http://localhost:8000/admin/**

Gérez:

- Les catégories
- Les médicaments (avec soft delete)
- Les ventes et lignes de vente

## 🎯 Fonctionnalités principais

### Backend (Django)

✅ Modèles complets avec relations et validations  
✅ Soft delete pour les médicaments  
✅ Snapshot de prix lors de la vente  
✅ Déduction de stock automatique  
✅ Alertes de rupture de stock  
✅ Commandes de gestion (migrate, loaddata)  
✅ Documentation Swagger complète  
✅ Serializers avec validations métier

### Frontend (React)

✅ Navigation principale (Dashboard, Médicaments, Ventes)  
✅ Tableau de bord avec statistiques  
✅ Gestion des médicaments (CRUD + alertes)  
✅ Gestion des ventes (créer, annuler)  
✅ Validation côté client  
✅ Gestion d'erreurs robuste  
✅ Interface responsive

## 🧪 Données initiales

Le projet inclut des fixtures avec données de test:

- 5 catégories de médicaments
- 10 médicaments réalistes (prix marocains)
- 3 ventes complétées
- Certains médicaments en alerte de stock

Chargez ces données avec:

```bash
python manage.py loaddata fixtures/initial_data.json
```

## 📝 Variables d'environnement

### Backend (`.env`)

```
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
DB_NAME=pharma_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (`.env`)

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🔒 Recommandations de sécurité

En production:

- Changez `SECRET_KEY` et utilisez une clé aléatoire forte
- Définissez `DEBUG=False`
- Utilisez une vraie base de données PostgreSQL (pas SQLite)
- Configurez `ALLOWED_HOSTS` correctement
- Utilisez HTTPS
- Stockez les secrets dans des variables d'environnement

## 📖 Commits Git

Le projet suit la convention **Conventional Commits**:

```
feat(categories): add Categorie model and migration
feat(medicaments): add soft delete and alerte property
feat(ventes): add stock deduction on sale creation
fix(medicaments): correct alertes endpoint filtering
docs: update README with API endpoints
```

## 🤝 Support

Pour des questions ou des problèmes:

1. Consultez la documentation Swagger: http://localhost:8000/api/schema/swagger-ui/
2. Vérifiez les fichiers README dans `backend/` et `frontend/`
3. Inspectez les logs Django et React

## 📄 Licence

Test technique SMARTHOLOL - Tous droits réservés

---

**Développé avec ❤️ — PharmaManager v1.0.0**
# PharmaManager
