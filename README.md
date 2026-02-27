# Proyecto 'Isla Dorada'
### Grupo 44.4 de la asignatura 'Programación Web y Móvil' de la Universidad de Las Palmas de Gran Canaria en el grado de Ingeniería Informática
Integrantes: Fedele Zuccaro, Joan Martinez Perdomo, Pablo Llopis Parrilla


## 1. Descripción del proyecto
Desarrollar una plataforma web y móvil para 'Isla Dorada', especializada en la reserva directa de habitaciones del hotel, eliminando intermediarios para ofrecer a los huéspedes una experiencia fluida, rápida y visualmente impactante

## 2. Definición y especificación de los requisitos funcionales
### 2.1 Requisitos funcionales del usuario
#### A. Módulo de Consulta y Catálogo (Público)

RFU1: El sistema permitirá a los usuarios consultar el catálogo completo de tipos de habitaciones del hotel (descripciones, fotos y características).

RFU2: El sistema permitirá a los usuarios buscar y visualizar las habitaciones libres filtrando por fechas específicas y número de huéspedes.

RFU3: El sistema mostrará la ubicación geográfica del hotel y datos de contacto.

RFU4: El sistema mostrará la información sobre el impacto ambiental (huella de carbono).

RFU5: El sistema ofrecerá una página de contacto de asistencia al cliente y una sección de preguntas frecuentes (FAQ).

RFU6: El sistema mostrará la oferta detallada del hotel organizada por categorías:
•	Restauración: Menú del día y platos destacados.
•	Bienestar: Información sobre gimnasio, spa y piscinas.
•	Actividades: Información sobre excursiones y espectáculos.

#### B. Módulo de Gestión de Usuarios y Cuentas

RFU7: Los usuarios no registrados podrán crear una cuenta aportando un identificador y una clave.

RFU8: Los usuarios registrados podrán acceder a un panel personal para consultar sus reservas y acceder a descuentos exclusivos.

RFU9: Los usuarios registrados podrán modificar sus datos de perfil (excepto los datos identificatorios críticos).

RFU10: El sistema permitirá solicitar el cambio de contraseña en caso de olvido.


#### C. Módulo de Reservas y Pagos
RFU11: Los usuarios (registrados o invitados) podrán reservar una o varias habitaciones disponibles.

RFU12: El proceso de reserva incluirá una pasarela de pago externa al sitio web para completar la transacción.

### 2.2 Requisitos funcionales del administrador.

RFA1: El administrador podrá crear, consultar, modificar y eliminar las habitaciones.

RFA2: El administrador podrá crear, consultar, modificar y eliminar los servicios del hotel.

RFA3: El administrador podrá crear, consultar, modificar y eliminar las reservas.

RFA4: El sistema requerirá autenticación para el acceso al panel de administración.

## 3. Mockups y StoryBoard

## Estructuración del código
El código se divide en las carpetas [pages](./pages) (paginas finales usando el xlu para los templates), [css](./css) (de momento lo tenemos todo compactado en un único css) y [js](./js) que en este sprint1 solo contiene el código xlu proporcionado por los profesores.
En la carpeta [examples](./examples) se encuentra el diseño de cada template que se puede abrir en el navegador para demostrar cual es nuestra intención con los templates. Los separamos de pages por el cambio que había que hacer con respecto al xlu, es decir los examples tienen, entre otros, <body> mientras que los templates no, de ahí que se puedan visualizar.
En cuanto a **path traversal** usamos el relativo, es decir como se insistió en clase de teoría usamos la ruta relativa y no la absoluta (../ ./).

## Mockups
Nosotros guardamos los mockups diseñados en figma individualmente en formato png en [carpeta mockups](./mockups)

## Templates
Tenemos los templates html en la [carpeta templates](./templates)

## Navegabilidad de la página web
Nosotros usamos una _navbar_ que de momento está con _Lorem Ipsum_ pero que durante la presentación hay una diapositiva explicando que iría en cada botón y de ahí se entiende la navegabilidad.

# Entendimiento del story-board
Desde cualquier página a través del header se podrá acceder en este orden según la _navbar_:
1. [Home](./pages/index.html)  
2. [Bookings](./pages/bookings.html)  
3. [Services](./pages/services.html) Que si no se hace click despliega las siguientes opciones
   - [Restaurant](./pages/restaurant.html)  
   - [Wellness Facilities](./pages/wellness-facilities.html)  
   - [Activities](./pages/activities.html)  
4. [Contact](./pages/contact.html)  
5. [Account](./pages/account.html) Que si no se hace click despliega las siguientes opciones
   - [Login](./pages/login.html)  
   - [Register](./pages/register.html)  
   - [Recover Password](./pages/change-password.html)  
**Siguiendo las indicaciones sobre dos tipos de cuentas (privilegiadas y no privilegiadas)** hemos decidido que si un usuario registrado accede a su cuenta se redirigirá hacia [admin.html](./pages/admin.html)
