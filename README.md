# Proyecto Isla Dorada - SPRINT 4

Aplicacion web/movil para gestion y consulta de hotel, desarrollada con Ionic, Capacitor y Firebase.

## Nombre del proyecto y componentes del grupo
- Proyecto: **Isla Dorada Hotel**
- Grupo: **44.4** (Programacion Web y Movil, ULPGC)
- Integrantes:
  - Fedele Zuccaro ([fedele24](https://github.com/fedele24))
  - Joan Martinez Perdomo ([Doffensmirthz](https://github.com/Doffensmirthz))
  - Pablo Llopis Parrilla ([Putrici0](https://github.com/Putrici0))

## Ejecucion del proyecto (Android con Capacitor)

```bash
cd angular-hotel
npm install
npm run build
npx cap sync android
npx cap open android
```

Notas:
- El proyecto ya incluye plataforma Android en `angular-hotel/android`.
- `webDir` de Capacitor: `dist/angular-hotel/browser`.
- `appId`: `com.ulpgc.isladorada`.

## Estructura del codigo del proyecto

La aplicacion esta organizada en `angular-hotel/src/app`.

### Pages (`src/app/pages`)
- `home`: portada.
- `rooms`: catalogo de habitaciones.
- `restaurant`: catalogo/menu con detalle por plato (`/restaurant/:id`).
- `favorites`: listado de platos favoritos del usuario autenticado.
- `activities`, `wellness-facilities`: catalogos publicos.
- `booking`: flujo de busqueda y confirmacion de reservas.
- `account`: perfil de usuario y reservas.
- `admin`: panel CRUD para colecciones de negocio.
- `login`, `register`, `change-password`, `contact`, `legal`, `services`.

### Components (`src/app/components`)
- `header`, `footer`.
- `title-subtitle`, `text-image-section`, `image-grid-section`.

### Services (`src/app/services`)
- `auth.service.ts`: autenticacion, sesion y rol admin.
- `admin-data.service.ts`: CRUD y sincronizacion en Firestore.
- `firebase-data.service.ts`: acceso de lectura a colecciones.
- `bookings.service.ts`: alta y gestion de reservas.
- `dishes.service.ts` / `menu.service.ts`: adaptacion de datos de `restaurant` a modelo de plato.
- `favorites.service.ts`: gestion de favoritos por usuario logueado.
- `sqlite-favorites.service.ts`: persistencia local de favoritos en SQLite (Ionic/Capacitor).

### Guards y rutas
- `guards/auth.guards.ts`: protege `/booking`, `/account`, `/favorites` y `/admin`.
- `app.routes.ts`: navegacion principal de la SPA/PWA.

## Funcionalidad incorporada en Sprint 4
- Integracion real con Ionic (`@ionic/angular`) en vistas de detalle y favoritos.
- Soporte movil con Capacitor Android.
- Nueva funcionalidad de favoritos para platos de restaurante.
- Persistencia local de favoritos con SQLite (`@capacitor-community/sqlite`) por email de usuario.
- Vista detalle de plato con accion de marcar/desmarcar favorito.
- Rutas auxiliares/compatibles:
  - `/menu` redirige a `/restaurant`
  - `/dish-page/:id` redirige a `/restaurant/:id`

## Estructura de datos en Firebase

Colecciones principales usadas por la app:

1. `users`
  - `email`, `isAdmin`, `nombre`, `apellidos`, `dni`, `nacimiento`
  - `createdAt`, `updatedAt`
2. `rooms`
  - `nombre`, `descripcion`, `huespedes`, `precio`, `imagen`
3. `restaurant`
  - `nombre`, `descripcion`, `categoria`, `imagen`
4. `activities`
  - `nombre`, `descripcion`, `duracion`, `imagen`
5. `wellness`
  - `nombre`, `descripcion`, `imagen`
6. `reservations`
  - `nombre`, `apellidos`, `email`, `telefono`, `dni`
  - `entrada`, `salida`, `huespedes`, `habitacion`
  - `cliente`, `familySuite`, `createdAt`

Nota de Sprint 4:
- Los favoritos se guardan en SQLite local, no en Firestore, en tabla `favorites(user_email, dish_id)`.

## Roles de usuario y cuentas de ejemplo

1. **Administrador (`isAdmin: true`)**
  - Acceso a `/admin`.
  - CRUD sobre catalogos y reservas.

2. **Cliente (`isAdmin: false`)**
  - Login, reserva (`/booking`), cuenta (`/account`) y favoritos (`/favorites`).
  - Sin acceso a `/admin`.

Usuarios de prueba:
- Admin: `admin@ulpgc.es`
- Cliente 1: `cliente1@ulpgc.es`
- Cliente 2: `cliente2@ulpgc.es`
- Cliente 3: `cliente3@ulpgc.es`
- Contrasena (todos): `pruebaPWM26?`
