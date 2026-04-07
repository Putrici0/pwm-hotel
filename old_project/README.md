# Proyecto Isla Dorada - SPRINT 2

## Nombre del proyecto y componentes del grupo
- Proyecto: **Isla Dorada Hotel**
- Grupo: **44.4** (Programación Web y Móvil, ULPGC)
- Integrantes:
  - Fedele Zuccaro ([fedele24](https://github.com/fedele24))
  - Joan Martinez Perdomo ([Doffensmirthz](https://github.com/Doffensmirthz))
  - Pablo Llopis Parrilla ([Putrici0](https://github.com/Putrici0))

## Ubicación del PDFs de mockups
- Carpeta general de mockups: [mockups](mockups)
- Mockups PDF Desktop: [mockups/desktop](mockupsesktop)
- Mockups PDF Tablet: [mockups/tablet](mockupsablet)
- Mockups PDF Phone: [mockups/phone](mockupshone)

## Ubicación del contenido JSON
- JSON local usado por las páginas: [data/site-data.json](dataite-data.json)
- Tipo de fuente: **Local** 

## Listado de páginas HTML del proyecto
Página de inicio de la aplicación web: [pages/index.html](pagesndex.html)

Nota: en todas las páginas se realiza carga de templates y de contenido JSON.

| Página HTML | Mockup PDF (directo)                                                                                                                                                             | Responsive implementado | Templates usados | JSON usado |
|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|---|---|
| [pages/index.html](pagesndex.html) | [desktop](mockupsesktop/01. home.pdf) \| [tablet](mockupsablet/01. home.pdf) \| [phone](mockupshone/01. home.pdf)                                              | Header responsive con menú hamburguesa (`<=900px`), bloques text-image apilados (`<=900px`), grids de imágenes `3->2->1` columnas (`<=900px` y `<=576px`). | [templates/header.html](templateseader.html), [templates/text-image-vertical.html](templatesext-image-vertical.html), [templates/text-image-right.html](templatesext-image-right.html), [templates/image-grid.html](templatesmage-grid.html), [templates/footer.html](templatesooter.html) | [js/pages/index.js](jsages/index.js) -> [data/site-data.json](dataite-data.json) |
| [pages/booking.html](pagesooking.html) | [desktop](mockupsesktop/02. booking.pdf) \| [tablet](mockupsablet/02. booking.pdf) \| [phone](mockupshone/02. booking.pdf)                                     | Widget de disponibilidad en grid responsive (`5->2->1`), checkout adaptado a móvil (`<=900px` y `<=576px`), navegación móvil del header (`<=900px`). | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/booking-widget-section.html](templatesooking-widget-section.html), [templates/form-booking.html](templatesorm-booking.html), [templates/footer.html](templatesooter.html) | [js/pages/booking.js](jsages/booking.js) -> [data/site-data.json](dataite-data.json) |
| [pages/rooms.html](pagesooms.html) | [desktop](mockupsesktop/03. rooms.pdf) \| [tablet](mockupsablet/03. rooms.pdf) \| [phone](mockupshone/03. rooms.pdf)                                           | Secciones text-image alternas que se apilan en móvil/tablet (`<=900px`), ajustes de tipografía y padding (`<=576px`). | [templates/header.html](templateseader.html), [templates/text-image-right.html](templatesext-image-right.html), [templates/text-image-left.html](templatesext-image-left.html), [templates/footer.html](templatesooter.html) | [js/pages/rooms.js](jsages/rooms.js) -> [data/site-data.json](dataite-data.json) |
| [pages/services.html](pageservices.html) | [desktop](mockupsesktop/04. services.pdf) \| [tablet](mockupsablet/04. services.pdf) \| [phone](mockupshone/04. services.pdf)                                  | Título/subtítulo responsive (`<=900px`/`<=576px`), bloques text-image apilados (`<=900px`), menú móvil de header (`<=900px`). | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/text-image-right.html](templatesext-image-right.html), [templates/footer.html](templatesooter.html) | [js/pages/services.js](jsages/services.js) -> [data/site-data.json](dataite-data.json) |
| [pages/restaurant.html](pagesestaurant.html) | [desktop](mockupsesktop/05. restaurant.pdf) \| [tablet](mockupsablet/05. restaurant.pdf) \| [phone](mockupshone/05. restaurant.pdf)                            | Tabla de menú con layout específico para tablet (`768-1023px`) y móvil (`<=767px`), textos/filas reordenados en pantallas pequeñas. | [templates/header.html](templateseader.html), [templates/text-image-vertical.html](templatesext-image-vertical.html), [templates/table-menu.html](templatesable-menu.html), [templates/footer.html](templatesooter.html) | [js/pages/restaurant.js](jsages/restaurant.js) -> [data/site-data.json](dataite-data.json) |
| [pages/wellness-facilities.html](pagesellness-facilities.html) | [desktop](mockupsesktop/06. wellness-facilities.pdf) \| [tablet](mockupsablet/06. wellness-facilities.pdf) \| [phone](mockupshone/06. wellness-facilities.pdf) | Título/subtítulo responsive y secciones text-image en columna en móvil (`<=900px`), ajuste adicional en móvil pequeño (`<=576px`). | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/text-image-left.html](templatesext-image-left.html), [templates/footer.html](templatesooter.html) | [js/pages/wellness-facilities.js](jsages/wellness-facilities.js) -> [data/site-data.json](dataite-data.json) |
| [pages/activities.html](pagesctivities.html) | [desktop](mockupsesktop/07. activities.pdf) \| [tablet](mockupsablet/07. activities.pdf) \| [phone](mockupshone/07. activities.pdf)                            | Cards text-image adaptadas a móvil/tablet (`<=900px`), navegación móvil en header (`<=900px`). | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/text-image-right.html](templatesext-image-right.html), [templates/footer.html](templatesooter.html) | [js/pages/activities.js](jsages/activities.js) -> [data/site-data.json](dataite-data.json) |
| [pages/contact.html](pagesontact.html) | [desktop](mockupsesktop/08. contact.pdf) \| [tablet](mockupsablet/08. contact.pdf) \| [phone](mockupshone/08. contact.pdf)                                     | Formulario responsive (`auth.css`), tabla FAQ responsive (`tables.css`) y bloque text-image responsive (`<=900px`/`<=576px`). | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/text-image-right.html](templatesext-image-right.html), [templates/auth-register.html](templatesuth-register.html), [templates/table.html](templatesable.html), [templates/footer.html](templatesooter.html) | [js/pages/contact.js](jsages/contact.js) -> [data/site-data.json](dataite-data.json) |
| [pages/account.html](pagesccount.html) | [desktop](mockupsesktop/09. account.pdf) \| [tablet](mockupsablet/09. account.pdf) \| [phone](mockupshone/09. account.pdf)                                     | Tarjetas de cuenta en grid responsive (`3->2->1`), ajuste de paddings en `<=900px` y `<=576px`. | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/table-card.html](templatesable-card.html), [templates/footer.html](templatesooter.html) | [js/pages/account.js](jsages/account.js) -> [data/site-data.json](dataite-data.json) |
| [pages/login.html](pagesogin.html) | [desktop](mockupsesktop/10. login.pdf) \| [tablet](mockupsablet/10. login.pdf) \| [phone](mockupshone/10. login.pdf)                                           | Formulario de autenticación responsive (`<=900px` y `<=576px`) y navegación móvil del header. | [templates/header.html](templateseader.html), [templates/auth-login.html](templatesuth-login.html), [templates/footer.html](templatesooter.html) | [js/pages/login.js](jsages/login.js) -> [data/site-data.json](dataite-data.json) |
| [pages/register.html](pagesegister.html) | [desktop](mockupsesktop/11. register.pdf) \| [tablet](mockupsablet/11. register.pdf) \| [phone](mockupshone/11. register.pdf)                                  | Formulario responsive (`auth.css`) con ajuste de anchuras y espaciado para tablet y móvil. | [templates/header.html](templateseader.html), [templates/auth-register.html](templatesuth-register.html), [templates/footer.html](templatesooter.html) | [js/pages/register.js](jsages/register.js) -> [data/site-data.json](dataite-data.json) |
| [pages/change-password.html](pageshange-password.html) | [desktop](mockupsesktop/12. change-password.pdf) \| [tablet](mockupsablet/12. change-password.pdf) \| [phone](mockupshone/12. change-password.pdf)             | Flujo de recuperación en tarjeta responsive (`auth.css`), comportamiento correcto en móvil (`<=576px`). | [templates/header.html](templateseader.html), [templates/forget-password.html](templatesorget-password.html), [templates/footer.html](templatesooter.html) | [js/pages/change-password.js](jsages/change-password.js) -> [data/site-data.json](dataite-data.json) |
| [pages/admin.html](pagesdmin.html) | [desktop](mockupsesktop/13. admin.pdf) \| [tablet](mockupsablet/13. admin.pdf) \| [phone](mockupshone/13. admin.pdf)                                           | Tablas y formularios de gestión adaptados a tablet/móvil (`tables.css` + `form_booking.css`), menú responsive global. | [templates/header.html](templateseader.html), [templates/title-subtitle.html](templatesitle-subtitle.html), [templates/table.html](templatesable.html), [templates/footer.html](templatesooter.html) | [js/pages/admin.js](jsages/admin.js) -> [data/site-data.json](dataite-data.json) |
| [pages/legal.html](pagesegal.html) | Sin mockup específico en `mockups/` al ser página con solo texto                                                                                                                 | Página legal responsive (`legal.css` + header/footer global responsive). | [templates/header.html](templateseader.html), [templates/footer.html](templatesooter.html) | [js/pages/legal.js](jsages/legal.js) -> [data/site-data.json](dataite-data.json) |

## Validaciones HTML en páginas con formulario

### 1) Login
- Página: [pages/login.html](pagesogin.html)
- Template: [templates/auth-login.html](templatesuth-login.html)
- Validaciones HTML:
  - `input[type="email"]` obligatorio (`required`)
  - `input[type="password"]` obligatorio (`required`)

### 2) Register
- Página: [pages/register.html](pagesegister.html)
- Template: [templates/auth-register.html](templatesuth-register.html)
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
- Página: [pages/change-password.html](pageshange-password.html)
- Template: [templates/forget-password.html](templatesorget-password.html)
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
- Página: [pages/booking.html](pagesooking.html)
- Templates: [templates/booking-widget-section.html](templatesooking-widget-section.html), [templates/form-booking.html](templatesorm-booking.html)
- Validaciones HTML:
  - Check-in obligatorio (`type="date"`, `required`)
  - Check-out obligatorio (`type="date"`, `required`)
  - Huéspedes obligatorio (`type="number"`, `required`, `min`, `max`)
  - Formulario final: nombre obligatorio, apellidos obligatorio, email obligatorio (`type="email"`)
  - Checkbox de privacidad obligatorio (`required`)

### 5) Contact
- Página: [pages/contact.html](pagesontact.html)
- Template: [templates/auth-register.html](templatesuth-register.html) (reutilizado)
- Validaciones HTML/JS:
  - Nombre, apellidos, email, asunto y mensaje obligatorios (`required`)
  - Email con `type="email"`
  - Checkbox de privacidad obligatorio (`required`)

### 6) Admin
- Página: [pages/admin.html](pagesdmin.html)
- Formulario generado por JS: [js/pages/admin.js](jsages/admin.js)
- Validaciones HTML:
  - Alta de elemento: nombre y descripción obligatorios (`required`)
  - Baja por selector (`select`) con comprobación de índice válido en JS

## Usuario y contraseña de prueba
Credenciales definidas en [data/site-data.json](dataite-data.json):

- Usuario admin: `admin@ulpgc.es` / `pruebaPWM26?`
- Usuario normal (`user`): `user@ulpgc.es` / `pruebaPWM26?`

## Roles de usuario y permisos
El proyecto maneja dos roles de usuario:

- `admin`
- `user`

### Accesos por rol
- `admin`:
  - Puede iniciar sesión.
  - Puede acceder al panel [pages/admin.html](pagesdmin.html).
  - En el header se muestran opciones `.admin-only`.
- `user`:
  - Puede iniciar sesión.
  - Puede acceder a su cuenta [pages/account.html](pagesccount.html).
  - No puede acceder al panel [pages/admin.html](pagesdmin.html) (redirección a login).

### Cómo probar cada rol
- Prueba rol `admin`: iniciar sesión con `admin@ulpgc.es`.
- Prueba rol `user`: iniciar sesión con `user@ulpgc.es`.
- La contraseña por los dos roles es `pruebaPWM26?`
- Alternativa para rol `user`: crear una cuenta nueva desde [pages/register.html](pagesegister.html) (se guarda en `localStorage` con rol `user`).

