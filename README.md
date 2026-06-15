# FarmaTalent

FarmaTalent es una plataforma independiente de talento farmaceutico y base para un futuro marketplace de turnos. Esta primera fase prioriza infraestructura, autenticacion, roles, permisos base, multiempresa y una SPA React consumiendo una API Laravel.

## Estructura

```text
farmatalent/
├── docker-compose.yml
├── farmatalent-api/   # Laravel 12 + Sanctum + MySQL
└── farmatalent-web/   # React + Vite + Bootstrap
```

## Stack

- Backend: Laravel 12, Sanctum, MySQL, API REST.
- Frontend: React, Vite, JavaScript, Bootstrap 5, React Router.
- Infraestructura local: Docker Compose con `api`, `web` y `mysql`.

## Instalacion con Docker

1. Crear los contenedores:

```bash
docker compose up --build
```

2. Abrir la app:

- Frontend: http://localhost:5173
- API healthcheck: http://localhost:8000/api/v1/health

El contenedor `api` ejecuta `composer install`, genera `APP_KEY`, corre migraciones y seeders. El contenedor `web` ejecuta `npm install` y levanta Vite.

## Usuarios iniciales

```text
Super Admin
Email: admin@farmatalent.test
Password: password

Profesional demo
Email: farmaceutico@farmatalent.test
Password: password
```

## API base

Todas las rutas versionadas viven bajo `/api/v1`.

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /roles`
- `GET /profile`
- `PUT /profile`
- `GET /companies`
- `POST /companies`
- `GET /companies/{company}`
- `PUT /companies/{company}`

La autenticacion usa tokens Bearer de Sanctum. El frontend guarda el token en `localStorage` y lo envia como `Authorization: Bearer <token>`.

## Modelo de dominio inicial

- `users`: identidad, credenciales, tipo profesional, estado, foto futura y reputacion futura.
- `roles`: roles globales y empresariales.
- `role_user`: roles globales asignados a usuarios.
- `companies`: farmacias, clinicas y empresas de salud.
- `company_users`: relacion multiempresa entre usuarios y empresas, con rol empresarial.
- `professional_profiles`: colegio/licencia, experiencia, especialidad, certificaciones y descripcion.
- `worker_metrics`: estructura preparada para puntualidad, ventas, operacion, atencion y reputacion.

## Arquitectura

El backend expone solamente API REST y no usa Blade para el frontend principal. El frontend es una SPA independiente y consume `VITE_API_URL`.

La separacion principal es:

- `farmatalent-api`: dominio, persistencia, autenticacion, policies y endpoints.
- `farmatalent-web`: experiencia de usuario, rutas publicas/privadas, layouts y manejo de sesion.

La estructura deja espacio para modulos futuros sin introducir microservicios ni logica avanzada antes de tiempo.

## Desarrollo sin Docker

Backend:

```bash
cd farmatalent-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

Frontend:

```bash
cd farmatalent-web
npm install
cp .env.example .env
npm run dev
```

## Fuera de alcance en esta fase

No se implemento matching inteligente, pagos, chat, IA, geolocalizacion, scoring automatico ni reputacion publica. La base queda lista para crecer hacia esos modulos mediante APIs.
