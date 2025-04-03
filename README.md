# EventUp App

## Descripción General

EventUp es una aplicación móvil construida con React Native y Expo que permite a los usuarios descubrir, crear y gestionar eventos. La aplicación cuenta con un ecosistema completo para la gestión de eventos, incluyendo autenticación de usuarios, detalles de actividades, calificaciones y más.

**Backend:** Esta aplicación utiliza un backend desplegado en Render. Puedes encontrar el repositorio del backend [aquí](https://github.com/netfoor/backend-app-events.git).

## Características

*   **Autenticación de Usuarios:** Sistema seguro de inicio de sesión y registro.
*   **Gestión de Eventos:** Crear, ver y participar en eventos.
*   **Detalles de Actividades:** Vista detallada de actividades con calificaciones.
*   **Gestión de Asistentes:** Agregar y gestionar asistentes a eventos.
*   **Sistema de Calificaciones:** Dejar y ver calificaciones para eventos y actividades.

## Tecnologías Utilizadas

*   **Framework:** React Native con Expo
*   **Navegación:** React Navigation
*   **Componentes UI:** Componentes personalizados (Button, Card, Input, etc.)
*   **Gestión de Estado:** React Context API (AuthContext, EventContext)
*   **Iconos:** Ionicons
*   **Gestión de Activos:** Cargadores de Expo Asset y Font

## Instalación y Configuración

Sigue estos pasos para configurar y ejecutar la aplicación:

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_del_repositorio>
    cd <nombre_del_proyecto>
    ```
2.  **Instalar dependencias:**

    ```bash
    npm install
    # o
    yarn install
    ```
3.  **Iniciar el servidor de desarrollo:**

    ```bash
    npm start
    # o
    yarn start
    ```
4.  **Usar la aplicación Expo Go:** En su dispositivo, use la aplicación Expo Go para escanear el código QR que aparece en la terminal, o use un emulador.

## Estructura del Proyecto

```
app_eventup/
├── assets/             # Contiene imágenes e iconos de la aplicación
├── src/                # Código fuente principal
│   ├── components/     # Componentes de UI reutilizables
│   ├── context/        # Proveedores de React Context
│   ├── hooks/          # Hooks personalizados de React
│   ├── navigation/     # Configuración de navegación
│   ├── screens/        # Pantallas de la aplicación
│   └── services/       # Servicios API y utilidades
├── App.js              # Archivo principal de la aplicación
├── app.json            # Configuración de Expo
└── package.json        # Dependencias del proyecto
```

## Desarrollo

La aplicación utiliza Expo para simplificar el desarrollo. Puedes:

*   Usar Expo Go para pruebas rápidas en dispositivos físicos.
*   Usar emuladores iOS/Android para desarrollo.
*   Exportar a una aplicación independiente usando los servicios de construcción de Expo.

## Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1.  Hacer fork del repositorio.
2.  Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3.  Confirmar tus cambios (`git commit -m 'Agrega una nueva funcionalidad'`).
4.  Enviar a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Crear un nuevo Pull Request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.