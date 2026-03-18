# PharmaManager Frontend

React + Vite frontend for PharmaManager.

## Folder

Use this folder as the frontend app:

- `frontend/`

## Requirements

- Node.js 18+

## Run Locally

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL:

- `http://localhost:5173`

Backend API base URL is configured with:

- `VITE_API_BASE_URL=http://localhost:8000/api/v1`

## Build

```bash
cd frontend
npm run build
npm run preview
```

## With Docker Compose

From project root:

```bash
docker compose up -d --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger: `http://localhost:8000/api/schema/swagger-ui/`
