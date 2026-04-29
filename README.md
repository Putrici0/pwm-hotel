# Proyecto Isla Dorada - SPRINT 3

Aplicacion web de gestion y consulta para un hotel, desarrollada con Angular y Firebase.

## Nombre del proyecto y componentes del grupo
- Proyecto: **Isla Dorada Hotel**
- Grupo: **44.4** (Programación Web y Móvil, ULPGC)
- Integrantes:
    - Fedele Zuccaro ([fedele24](https://github.com/fedele24))
    - Joan Martinez Perdomo ([Doffensmirthz](https://github.com/Doffensmirthz))
    - Pablo Llopis Parrilla ([Putrici0](https://github.com/Putrici0))

## Ejecucion del proyecto

Desde la raiz de este repositorio (`pwm-hotel`), entrar en la carpeta de la app y ejecutar:

```bash
cd angular-hotel
npm install
npm start
```

La app se levanta en: `http://localhost:4200/`.

## Estructura del codigo del proyecto web

La aplicacion esta organizada en `angular-hotel/src/app`:

- `pages/`: vistas principales de la web.
    - `home`: portada del hotel.
    - `rooms`, `restaurant`, `activities`, `wellness-facilities`: catalogos publicos consumiendo datos de Firebase.
    - `booking`: flujo de busqueda y confirmacion de reservas.
    - `account`: perfil de usuario, datos personales y reservas del usuario logueado.
    - `admin`: panel CRUD para gestionar habitaciones, restauracion, actividades, bienestar y reservas.
    - `login`, `register`, `change-password`, `contact`, `legal`: soporte de autenticacion e informacion.
- `components/`: piezas reutilizables de UI (`header`, `footer`, bloques visuales, etc.).
- `services/`:
    - `auth.service.ts`: login/registro/cierre de sesion y control de rol admin mediante Firebase Auth + Firestore.
    - `admin-data.service.ts`: CRUD generico y sincronizacion en tiempo real de colecciones Firestore.
    - `bookings.service.ts`: alta de nuevas reservas en Firestore.
- `guards/auth.guards.ts`: proteccion de rutas privadas (`/account`, `/booking`) y de administracion (`/admin`).
- `app.routes.ts`: rutas de navegacion de toda la SPA.

### Componentes creados y funcionalidad

**Componentes de pagina (`src/app/pages`)**

- `home.component`: pagina principal del hotel.
- `rooms.component`: catalogo de habitaciones (datos desde `rooms` en Firestore).
- `services.component`: pagina de servicios generales del hotel.
- `restaurant.component`: catalogo/menu de restauracion (datos desde `restaurant`).
- `wellness-facilities.component`: catalogo de bienestar (datos desde `wellness`).
- `activities.component`: catalogo de actividades (datos desde `activities`).
- `booking.component`: buscador + formulario de reserva y alta en `reservations`.
- `account.component`: gestion de cuenta, consulta/cancelacion de reservas del usuario.
- `admin.component`: panel CRUD para `rooms`, `restaurant`, `activities`, `wellness` y `reservations`.
- `login.component`: autenticacion de usuarios.
- `register.component`: alta de nuevos usuarios.
- `change-password.component`: cambio o recuperacion de contrasena.
- `contact.component`: informacion/contacto.
- `legal.component`: informacion legal.

**Componentes reutilizables (`src/app/components`)**

- `header.component`: cabecera y navegacion principal.
- `footer.component`: pie de pagina.
- `title-subtitle.component`: bloque reutilizable de titulo + subtitulo.
- `text-image-section.component`: seccion combinada de texto e imagen.
- `image-grid-section.component`: rejilla de imagenes para contenido visual.

## Estructura de datos almacenados en Firebase

Se usa Firestore con estas colecciones principales:

1. `users`:
    - `email`, `isAdmin`, `nombre`, `apellidos`, `dni`, `nacimiento`
    - `createdAt`, `updatedAt`
2. `rooms`:
    - `nombre`, `descripcion`, `huespedes`, `precio`, `imagen`
3. `restaurant`:
    - `nombre`, `descripcion`, `categoria` (`entrantes|primeros|segundos|postres`), `imagen`
4. `activities`:
    - `nombre`, `descripcion`, `duracion`, `imagen`
5. `wellness`:
    - `nombre`, `descripcion`, `imagen`
6. `reservations`:
    - `nombre`, `apellidos`, `email`, `telefono`, `dni`
    - `entrada`, `salida`, `huespedes`, `habitacion`
    - `cliente`, `familySuite`, `createdAt`

### Ejemplo visual de Firestore

```text
users/
  {uid}/
    email: "usuario@correo.com"
    isAdmin: false
    nombre: "Ana"
    apellidos: "Perez"

rooms/
  {roomId}/
    nombre: "Suite Deluxe"
    descripcion: "Vista al mar..."
    huespedes: 4
    precio: 180
    imagen: "https://..."

reservations/
  {reservationId}/
    email: "usuario@correo.com"
    habitacion: "Suite Deluxe"
    entrada: "2026-05-10"
    salida: "2026-05-12"
```

## Tour por la pagina web

1. **Home (`/`)**: vista principal de presentacion.
2. **Catalogos (`/rooms`, `/restaurant`, `/activities`, `/wellness-facilities`)**: muestran en tiempo real lo guardado en Firestore.
3. **Registro/Login (`/register`, `/login`)**: acceso de usuarios.
4. **Reserva (`/booking`)**:
    - se buscan habitaciones por fechas y huespedes;
    - se completan datos del cliente;
    - al confirmar, se guarda un documento en `reservations`.
5. **Cuenta (`/account`)**:
    - el usuario consulta sus datos y sus reservas filtradas por email;
    - puede cancelar reservas futuras.
6. **Admin (`/admin`)**:
   - CRUD de `rooms`, `restaurant`, `activities`, `wellness`, `reservations`.
   - cualquier alta/edicion/borrado se refleja en catalogos publicos automaticamente.

## Roles de usuario y cuentas de ejemplo

La aplicacion maneja dos roles:

1. **Administrador (`isAdmin: true`)**
   - Accede al panel `/admin`.
   - Puede crear, editar y borrar elementos de catalogo y reservas.
   - Sus cambios impactan directamente en Firestore y en la visualizacion publica.

2. **Cliente (`isAdmin: false`)**
   - Puede iniciar sesion, reservar en `/booking` y consultar/cancelar sus reservas en `/account`.
   - No tiene acceso al panel de administracion.

### Usuarios de prueba ya creados

- **Admin**: `admin@ulpgc.es`  
- **Cliente 1**: `cliente1@ulpgc.es`  
- **Cliente 2**: `cliente2@ulpgc.es`  
- **Contrasena (todos)**: `pruebaPWM26?`

### Ejemplo completo: introducir y visualizar datos

1. Entrar como admin en `/admin`.
2. En seccion **Habitaciones**, crear:
    - `nombre`: `Suite Familiar`
    - `descripcion`: `Suite con terraza`
    - `huespedes`: `5`
    - `precio`: `220`
    - `imagen`: `https://...`
3. Guardar y comprobar en Firestore la coleccion `rooms`.
4. Ir a `/rooms`: la nueva habitacion aparece en el catalogo.
5. Ir a `/booking`, hacer una reserva de esa habitacion.
6. Comprobar:
    - documento nuevo en `reservations`,
    - visualizacion en `/account` del usuario correspondiente.
