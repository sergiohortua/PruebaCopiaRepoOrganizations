# View-apto

App web para mostrar fotos 360 de un apartamento: galería de ambientes y recorrido con puntos clicables entre habitaciones.

No usa servidor, base de datos ni Node. Son HTML, CSS y JavaScript. El visor es [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/).

## Qué necesitas en el computador

1. Un navegador actual (Chrome, Firefox, Safari o Edge).
2. Git, para publicar en GitHub.
3. Python 3, solo para probar en local (Mac ya lo trae).
4. Un recortador de imágenes: [Squoosh](https://squoosh.app/) o Vista Previa de Mac.

No hace falta instalar Node.js.

## Preparar tus fotos 360

Las fotos deben ser **equirectangular**: el ancho es el doble del alto (por ejemplo 4096 × 2048). Formato JPEG.

Para cada ambiente:

1. Redímela a **4096 px de ancho** (2048 de alto).
2. Expórtala en JPEG calidad 70–80.
3. El archivo debería pesar **entre 2 y 8 MB**.
4. Nómbralo sin espacios ni tildes, con estos 4 archivos:
   - `sala-cocina.jpg` — una sola 360: puerta de entrada a la izquierda, sala al frente, cocina a la derecha
   - `habitacion1.jpg`
   - `habitacion2.jpg`
   - `habitacion-principal.jpg`
5. Crea una miniatura recortada (un pedazo representativo, no la panorámica completa), unos 480 × 270 px.

Sustituye los archivos de ejemplo en `imagenes/` y `imagenes/miniaturas/` con esos mismos nombres.

Si cambia el orden de las puertas, edita las flechas en `js/ambientes.js`.

## Ajustar las flechas del recorrido

Cada flecha se coloca con `yaw` (izquierda–derecha) y `pitch` (arriba–abajo), en grados. Empieza en `0deg` y mueve de 20 en 20 hasta que el ícono quede sobre la puerta real.

En las fotos de ejemplo (desde la sala-cocina, mirando al frente):

- Izquierda: puerta de entrada (no hay flecha; es la calle).
- Frente: sala.
- Derecha: cocina, y más a la derecha el pasillo.
- Flechas hacia las habitaciones: `75deg`, `100deg` y `125deg`.
- Desde cada habitación, la flecha `-90deg` vuelve a sala y cocina.

## Probar en local

No abras el HTML con doble clic. El visor necesita un servidor simple:

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8080
```

Abre [http://localhost:8080](http://localhost:8080).

Prueba esto:

- Abrir dos ambientes desde la galería y girar / hacer zoom.
- Cerrar el visor con el botón o con Escape.
- Entrar al recorrido y saltar de un cuarto a otro con las flechas.
- En el celular (o en el modo responsive de Chrome), comprobar que se puede arrastrar. El giroscopio solo funciona en HTTPS; GitHub Pages ya lo da.

## Publicar gratis en GitHub Pages

1. Crea un repositorio en GitHub (o usa este).
2. Sube el proyecto:

```bash
git add .
git commit -m "Publicar visor 360 de View-apto"
git push
```

3. En GitHub: **Settings → Pages → Build and deployment**.
4. Source: rama `main`, carpeta `/ (root)`.
5. En uno o dos minutos la URL queda así: `https://TU_USUARIO.github.io/View-apto/`

Cada cambio posterior: commit + push. Se actualiza solo.

## Límites del plan gratis

GitHub Pages admite repos de unos 1 GB y archivos de hasta 100 MB. El cuello de botella son las fotos 360, no el código.

No subas originales de 20–40 MB. Si más adelante tienes muchas fotos pesadas, deja el HTML aquí y aloja las imágenes en Cloudinary o Cloudflare R2.

## Estructura

- `index.html` — portada y galería
- `tour.html` — recorrido a pantalla completa
- `css/estilos.css`
- `js/ambientes.js` — lista de cuartos y enlaces del tour
- `js/galeria.js` — abre el visor al hacer clic en una tarjeta
- `js/tour.js` — Photo Sphere Viewer + tour virtual
- `imagenes/` — JPEG 360
- `imagenes/miniaturas/` — recortes chicos para las tarjetas
