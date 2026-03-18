# PharmaManager Backend

Backend API for PharmaManager pharmacy management application built with Django REST Framework.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup .env
cp .env.example .env

# Run migrations
python manage.py migrate

# Load initial data
python manage.py loaddata fixtures/initial_data.json

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## API Documentation

- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/
- Schema: http://localhost:8000/api/schema/

## Environment Variables

See `.env.example` for all required variables:

- `DEBUG`: Set to True for development
- `SECRET_KEY`: Django secret key
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: PostgreSQL connection

## Admin Panel

Access Django admin at: http://localhost:8000/admin/
