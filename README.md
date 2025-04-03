# EventUp App

## Descripción General

EventUp es una aplicación móvil construida con React Native y Expo que permite a los usuarios descubrir, crear y gestionar eventos. La aplicación cuenta con un ecosistema completo para la gestión de eventos, incluyendo autenticación de usuarios, detalles de actividades, calificaciones y más.

**Backend:** Esta aplicación utiliza un backend desplegado en Render. Puedes encontrar el repositorio del backend [aquí](https://github.com/netfoor/backend-app-events.git).

# 📱 Nombre de la Aplicación: Eventup
**Descripción:** La aplicación IventUp permite a los usuarios crear, organizar y dar seguimiento a sus eventos diarias de forma sencilla.
Con una interfaz simple e intuitiva, los usuarios pueden categorizar sus eventos, establecer prioridades y fechas de vencimiento, lo que facilita
una mejor gestión del tiempo y el cumplimiento de objetivos. Ideal para personas que buscan mejorar su productividad personal o en equipo. 

## 🎯 Objetivo General
El objetivo de TaskMaster es proporcionar una herramienta sencilla y eficiente para la gestión de eventos diarias. Busca ayudar a los usuarios a 
mantenerse organizados al permitirles crear, categorizar y seguir el progreso de sus eventos, mejorando así su productividad personal. La aplicación 
tiene como propósito facilitar la visualización y priorización de eventos, optimizando el tiempo y los esfuerzos para cumplir con los objetivos diarios.

## 🏗️ Arquitectura de la Aplicación
- Tipo de arquitectura: Estructura Modular

- Justificación: Se eligió una arquitectura monolítica para simplificar el desarrollo y mantenimiento de la aplicación en esta fase inicial. Al ser una aplicación 
pequeña y con pocos requerimientos complejos, una arquitectura monolítica permite un desarrollo más rápido, sin necesidad de gestionar múltiples servicios o 
bases de datos. Además, facilita la integración de nuevas funcionalidades y la resolución de errores, ya que toda la lógica está centralizada en un solo lugar.

## 🚀 Framework de Desarrollo
- **Framework:** React Native con Expo
- **Justificación:** Se eligió React Native debido a su capacidad para desarrollar aplicaciones móviles tanto para iOS como para Android utilizando una sola base de código. Esto reduce significativamente el tiempo y el esfuerzo de desarrollo. Expo se utiliza para facilitar la configuración y el despliegue de la aplicación, 
ya que ofrece  herramientas y una amplia variedad de bibliotecas listas para usar, lo que hace que el desarrollo sea aún más rápido y sencillo.

## 🗂️ Estrategia de Versionamiento

Versionamiento por ramas
- `main` → Rama principal con la documentación.
- `Israel` → Israel
- `Fortino` → Fortino
- `Joel` → Joel


## 🎨 Wireframes/Mockups 
Puedes visualizar los wireframes de la aplicación en los siguientes enlaces:  
- [🎨 Diseño en Figma](https://www.figma.com/design/KC9NbaHgOQnRA2Sf7iZi3x/AgendaProject-(Copy))  
- [📱 Prototipo interactivo](https://www.figma.com/proto/KC9NbaHgOQnRA2Sf7iZi3x/AgendaProject-(Copy)?node-id=181-3604&p=f&t=gc643fMwi9xs5Oeu-1&scaling=scale-down&content-scaling=fixed&page-id=181%3A3592&starting-point-node-id=181%3A3621)

## Diagrama de flujo
- Se agrego a la carpeta Diseños


## 📂 Repositorio GitHub  
Enlace al repositorio: [GitHub Repo](https://github.com/Ability2040/mi-app-movil)



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