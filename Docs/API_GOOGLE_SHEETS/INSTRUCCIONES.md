# 📄 Guía de Configuración: API Google Sheets

Sigue estos pasos para conectar tu Tienda a Google Sheets.

## 1. Preparar la Hoja de Cálculo

Crea una nueva hoja en Google Sheets (ej: `Tecnonets_DB`).

### Pestaña 1: "Productos"

Crea los siguientes encabezados en la primera fila (Fila 1):

- **Columna A:** `id`
- **Columna B:** `title`
- **Columna C:** `price`
- **Columna D:** `category`
- **Columna E:** `tags`
- **Columna F:** `image`
- **Columna G:** `description`
- **Columna H:** `checkoutUrl`

### Pestaña 2: "Usuarios"

Crea los siguientes encabezados:

- **Columna A:** `Nombre`
- **Columna B:** `Usuario`
- **Columna C:** `Contraseña`
- **Columna D:** `Rol`
- **Columna E:** `Estado`

> **Agrega tu usuario Admin manual:**
> A2: `Victor` | B2: `admin` | C2: `tecnonets2024` | D2: `admin` | E2: `Activo`

---

## 2. Preparar Carpeta de Imágenes (Google Drive)

1.  Crea una carpeta en Drive llamada `Tecnonets_Images`.
2.  Dale clic derecho > **Compartir** > **Cualquier usuario que tenga el vínculo** (Lector).
3.  Copia el ID de la carpeta (es la parte alfanumérica larga al final de la URL).

---

## 3. Instalar el Código ("El Backend")

1.  En tu Hoja de Google, ve al menú **Extensiones** > **Apps Script**.
2.  Borra lo que hay y pega TODO el código que está en el archivo `codigo_backend.gs` (en esta carpeta).
3.  **IMPORTANTE:** Al principio del código, cambia estas 3 variables:
    ```javascript
    const API_KEY = "inventa-una-clave-segura";
    const DRIVE_FOLDER_ID = "EL_ID_DE_TU_CARPETA_DRIVE";
    const SHEET_ID = "EL_ID_DE_TU_HOJA";
    ```
4.  Guarda el proyecto (Ctrl + S).

---

## 4. Publicar la API

1.  Arriba a la derecha, botón azul **"Implantar" (Deploy)** > **"Nueva implementación"**.
2.  Tipo: **Aplicación web**.
3.  Descripción: `API v1`.
4.  Ejecutar como: **Yo** (tu correo).
5.  Quién tiene acceso: **Cualquier usuario** (Anyone). _Importante para que la web pueda leerlo_.
6.  Dale "Implantar". (Te pedirá permisos, acéptalos todos).
7.  **COPIA LA URL** que te da al final (`https://script.google.com/macros/s/..../exec`).

---

## 5. Conectar la Web

Una vez tengas esa URL, vuelve conmigo y la configuraremos en el archivo `.env.local` de la aplicación.
