# Proyecto Isla Dorada - SPRINT 2

## Nombre del proyecto y componentes del grupo
- Proyecto: **Isla Dorada Hotel**
- Grupo: **44.4** (Programación Web y Móvil, ULPGC)
- Integrantes:
  - Fedele Zuccaro ([fedele24](https://github.com/fedele24))
  - Joan Martinez Perdomo ([Doffensmirthz](https://github.com/Doffensmirthz))
  - Pablo Llopis Parrilla ([Putrici0](https://github.com/Putrici0))

## Ubicación del PDFs de mockups
- Carpeta general de mockups: [mockups](./mockups)
- Mockups PDF Desktop: [mockups/desktop](./mockups/desktop)
- Mockups PDF Tablet: [mockups/tablet](./mockups/tablet)
- Mockups PDF Phone: [mockups/phone](./mockups/phone)

## Ubicación del contenido JSON
- JSON local usado por las páginas: [data/site-data.json](./data/site-data.json)
- Tipo de fuente: **Local** 

## Listado de páginas HTML del proyecto
Página de inicio de la aplicación web: [pages/index.html](./pages/index.html)

Nota: en todas las páginas se realiza carga de templates y de contenido JSON.

| Página HTML | Mockup PDF (directo)                                                                                                                                                             | Responsive implementado | Templates usados | JSON usado |
|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|---|---|
| [pages/index.html](./pages/index.html) | [desktop](./mockups/desktop/01.%20home.pdf) \| [tablet](./mockups/tablet/01.%20home.pdf) \| [phone](./mockups/phone/01.%20home.pdf)                                              | Header responsive con menú hamburguesa (`<=900px`), bloques text-image apilados (`<=900px`), grids de imágenes `3->2->1` columnas (`<=900px` y `<=576px`). | [templates/header.html](./templates/header.html), [templates/text-image-vertical.html](./templates/text-image-vertical.html), [templates/text-image-right.html](./templates/text-image-right.html), [templates/image-grid.html](./templates/image-grid.html), [templates/footer.html](./templates/footer.html) | [js/pages/index.js](./js/pages/index.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/booking.html](./pages/booking.html) | [desktop](./mockups/desktop/02.%20booking.pdf) \| [tablet](./mockups/tablet/02.%20booking.pdf) \| [phone](./mockups/phone/02.%20booking.pdf)                                     | Widget de disponibilidad en grid responsive (`5->2->1`), checkout adaptado a móvil (`<=900px` y `<=576px`), navegación móvil del header (`<=900px`). | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/booking-widget-section.html](./templates/booking-widget-section.html), [templates/form-booking.html](./templates/form-booking.html), [templates/footer.html](./templates/footer.html) | [js/pages/booking.js](./js/pages/booking.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/rooms.html](./pages/rooms.html) | [desktop](./mockups/desktop/03.%20rooms.pdf) \| [tablet](./mockups/tablet/03.%20rooms.pdf) \| [phone](./mockups/phone/03.%20rooms.pdf)                                           | Secciones text-image alternas que se apilan en móvil/tablet (`<=900px`), ajustes de tipografía y padding (`<=576px`). | [templates/header.html](./templates/header.html), [templates/text-image-right.html](./templates/text-image-right.html), [templates/text-image-left.html](./templates/text-image-left.html), [templates/footer.html](./templates/footer.html) | [js/pages/rooms.js](./js/pages/rooms.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/services.html](./pages/services.html) | [desktop](./mockups/desktop/04.%20services.pdf) \| [tablet](./mockups/tablet/04.%20services.pdf) \| [phone](./mockups/phone/04.%20services.pdf)                                  | Título/subtítulo responsive (`<=900px`/`<=576px`), bloques text-image apilados (`<=900px`), menú móvil de header (`<=900px`). | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/text-image-right.html](./templates/text-image-right.html), [templates/footer.html](./templates/footer.html) | [js/pages/services.js](./js/pages/services.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/restaurant.html](./pages/restaurant.html) | [desktop](./mockups/desktop/05.%20restaurant.pdf) \| [tablet](./mockups/tablet/05.%20restaurant.pdf) \| [phone](./mockups/phone/05.%20restaurant.pdf)                            | Tabla de menú con layout específico para tablet (`768-1023px`) y móvil (`<=767px`), textos/filas reordenados en pantallas pequeñas. | [templates/header.html](./templates/header.html), [templates/text-image-vertical.html](./templates/text-image-vertical.html), [templates/table-menu.html](./templates/table-menu.html), [templates/footer.html](./templates/footer.html) | [js/pages/restaurant.js](./js/pages/restaurant.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/wellness-facilities.html](./pages/wellness-facilities.html) | [desktop](./mockups/desktop/06.%20wellness-facilities.pdf) \| [tablet](./mockups/tablet/06.%20wellness-facilities.pdf) \| [phone](./mockups/phone/06.%20wellness-facilities.pdf) | Título/subtítulo responsive y secciones text-image en columna en móvil (`<=900px`), ajuste adicional en móvil pequeño (`<=576px`). | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/text-image-left.html](./templates/text-image-left.html), [templates/footer.html](./templates/footer.html) | [js/pages/wellness-facilities.js](./js/pages/wellness-facilities.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/activities.html](./pages/activities.html) | [desktop](./mockups/desktop/07.%20activities.pdf) \| [tablet](./mockups/tablet/07.%20activities.pdf) \| [phone](./mockups/phone/07.%20activities.pdf)                            | Cards text-image adaptadas a móvil/tablet (`<=900px`), navegación móvil en header (`<=900px`). | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/text-image-right.html](./templates/text-image-right.html), [templates/footer.html](./templates/footer.html) | [js/pages/activities.js](./js/pages/activities.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/contact.html](./pages/contact.html) | [desktop](./mockups/desktop/08.%20contact.pdf) \| [tablet](./mockups/tablet/08.%20contact.pdf) \| [phone](./mockups/phone/08.%20contact.pdf)                                     | Formulario responsive (`auth.css`), tabla FAQ responsive (`tables.css`) y bloque text-image responsive (`<=900px`/`<=576px`). | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/text-image-right.html](./templates/text-image-right.html), [templates/auth-register.html](./templates/auth-register.html), [templates/table.html](./templates/table.html), [templates/footer.html](./templates/footer.html) | [js/pages/contact.js](./js/pages/contact.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/account.html](./pages/account.html) | [desktop](./mockups/desktop/09.%20account.pdf) \| [tablet](./mockups/tablet/09.%20account.pdf) \| [phone](./mockups/phone/09.%20account.pdf)                                     | Tarjetas de cuenta en grid responsive (`3->2->1`), ajuste de paddings en `<=900px` y `<=576px`. | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/table-card.html](./templates/table-card.html), [templates/footer.html](./templates/footer.html) | [js/pages/account.js](./js/pages/account.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/login.html](./pages/login.html) | [desktop](./mockups/desktop/10.%20login.pdf) \| [tablet](./mockups/tablet/10.%20login.pdf) \| [phone](./mockups/phone/10.%20login.pdf)                                           | Formulario de autenticación responsive (`<=900px` y `<=576px`) y navegación móvil del header. | [templates/header.html](./templates/header.html), [templates/auth-login.html](./templates/auth-login.html), [templates/footer.html](./templates/footer.html) | [js/pages/login.js](./js/pages/login.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/register.html](./pages/register.html) | [desktop](./mockups/desktop/11.%20register.pdf) \| [tablet](./mockups/tablet/11.%20register.pdf) \| [phone](./mockups/phone/11.%20register.pdf)                                  | Formulario responsive (`auth.css`) con ajuste de anchuras y espaciado para tablet y móvil. | [templates/header.html](./templates/header.html), [templates/auth-register.html](./templates/auth-register.html), [templates/footer.html](./templates/footer.html) | [js/pages/register.js](./js/pages/register.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/change-password.html](./pages/change-password.html) | [desktop](./mockups/desktop/12.%20change-password.pdf) \| [tablet](./mockups/tablet/12.%20change-password.pdf) \| [phone](./mockups/phone/12.%20change-password.pdf)             | Flujo de recuperación en tarjeta responsive (`auth.css`), comportamiento correcto en móvil (`<=576px`). | [templates/header.html](./templates/header.html), [templates/forget-password.html](./templates/forget-password.html), [templates/footer.html](./templates/footer.html) | [js/pages/change-password.js](./js/pages/change-password.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/admin.html](./pages/admin.html) | [desktop](./mockups/desktop/13.%20admin.pdf) \| [tablet](./mockups/tablet/13.%20admin.pdf) \| [phone](./mockups/phone/13.%20admin.pdf)                                           | Tablas y formularios de gestión adaptados a tablet/móvil (`tables.css` + `form_booking.css`), menú responsive global. | [templates/header.html](./templates/header.html), [templates/title-subtitle.html](./templates/title-subtitle.html), [templates/table.html](./templates/table.html), [templates/footer.html](./templates/footer.html) | [js/pages/admin.js](./js/pages/admin.js) -> [data/site-data.json](./data/site-data.json) |
| [pages/legal.html](./pages/legal.html) | Sin mockup específico en `mockups/` al ser página con solo texto                                                                                                                 | Página legal responsive (`legal.css` + header/footer global responsive). | [templates/header.html](./templates/header.html), [templates/footer.html](./templates/footer.html) | [js/pages/legal.js](./js/pages/legal.js) -> [data/site-data.json](./data/site-data.json) |

## Validaciones HTML en páginas con formulario

### 1) Login
- Página: [pages/login.html](./pages/login.html)
- Template: [templates/auth-login.html](./templates/auth-login.html)
- Validaciones HTML:
  - `input[type="email"]` obligatorio (`required`)
  - `input[type="password"]` obligatorio (`required`)

### 2) Register
- Página: [pages/register.html](./pages/register.html)
- Template: [templates/auth-register.html](./templates/auth-register.html)
- Validaciones HTML:
  - Nombre obligatorio (`required`)
  - Apellidos obligatorio (`required`)
  - Email con `type="email"` y `required`
  - Contraseña obligatoria (`required`)
  - Confirmación de contraseña obligatoria (`required`)
  - Checkbox de términos obligatorio (`required`)
- Validación adicional en JS:
  - Coincidencia de contraseñas
  - Regla de contraseña: mínimo 6 caracteres, una mayúscula, un número y un carácter especial (`?`, `!`, `*`, `'`)

### 3) Change Password
- Página: [pages/change-password.html](./pages/change-password.html)
- Template: [templates/forget-password.html](./templates/forget-password.html)
- Validaciones HTML:
  - Email con `type="email"` y `required`
  - Código: `required`, `maxlength="6"`, `pattern="\d*"`
  - Nueva contraseña obligatoria (`required`)
  - Confirmación obligatoria (`required`)
- Validación adicional en JS:
  - Solo dígitos en el código (máx. 6)
  - Código de prueba: `123456`
  - Coincidencia y fortaleza de contraseña (misma regla que registro)

### 4) Booking
- Página: [pages/booking.html](./pages/booking.html)
- Templates: [templates/booking-widget-section.html](./templates/booking-widget-section.html), [templates/form-booking.html](./templates/form-booking.html)
- Validaciones HTML:
  - Check-in obligatorio (`type="date"`, `required`)
  - Check-out obligatorio (`type="date"`, `required`)
  - Huéspedes obligatorio (`type="number"`, `required`, `min`, `max`)
  - Formulario final: nombre obligatorio, apellidos obligatorio, email obligatorio (`type="email"`)
  - Checkbox de privacidad obligatorio (`required`)

### 5) Contact
- Página: [pages/contact.html](./pages/contact.html)
- Template: [templates/auth-register.html](./templates/auth-register.html) (reutilizado)
- Validaciones HTML/JS:
  - Nombre, apellidos, email, asunto y mensaje obligatorios (`required`)
  - Email con `type="email"`
  - Checkbox de privacidad obligatorio (`required`)

### 6) Admin
- Página: [pages/admin.html](./pages/admin.html)
- Formulario generado por JS: [js/pages/admin.js](./js/pages/admin.js)
- Validaciones HTML:
  - Alta de elemento: nombre y descripción obligatorios (`required`)
  - Baja por selector (`select`) con comprobación de índice válido en JS

## Usuario y contraseña de prueba
Credenciales definidas en [data/site-data.json](./data/site-data.json):

- Usuario admin: `admin@ulpgc.es` / `pruebaPWM26?`
- Usuario normal (`user`): `user@ulpgc.es` / `pruebaPWM26?`

## Roles de usuario y permisos
El proyecto maneja dos roles de usuario:

- `admin`
- `user`

### Accesos por rol
- `admin`:
  - Puede iniciar sesión.
  - Puede acceder al panel [pages/admin.html](./pages/admin.html).
  - En el header se muestran opciones `.admin-only`.
- `user`:
  - Puede iniciar sesión.
  - Puede acceder a su cuenta [pages/account.html](./pages/account.html).
  - No puede acceder al panel [pages/admin.html](./pages/admin.html) (redirección a login).

### Cómo probar cada rol
- Prueba rol `admin`: iniciar sesión con `admin@ulpgc.es`.
- Prueba rol `user`: iniciar sesión con `user@ulpgc.es`.
- La contraseña por los dos roles es `pruebaPWM26?`
- Alternativa para rol `user`: crear una cuenta nueva desde [pages/register.html](./pages/register.html) (se guarda en `localStorage` con rol `user`).

