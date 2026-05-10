# Retro Sort Workshop

A top-down retro pixel-art sorting game. Organizar marcadores en frascos o papeles en bandejas.

## Cómo desplegar en GitHub Pages

1. Sube este código a un repositorio de GitHub.
2. Ve a la pestaña **Settings** (Configuración) de tu repositorio.
3. En el menú de la izquierda, selecciona **Pages**.
4. En **Build and deployment** > **Source**, asegúrate de que esté seleccionado `GitHub Actions`.
5. El flujo de trabajo que he configurado (`.github/workflows/deploy.yml`) se encargará de compilar y desplegar la aplicación automáticamente cada vez que hagas un `push` a la rama `main`.

## Desarrollo Local

```bash
npm install
npm run dev
```
