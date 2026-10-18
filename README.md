# Aquella vez · Manual de español

Sitio web del manual **Aquella vez** (Luis Fader).

- `index.html` — portada, índice de las 10 unidades y prólogo.
- `unidad-1.html` — Unidad 1 completa (secciones A–F, notas y test final).
- `assets/css/` — estilos comunes (`estilo.css`) y del test (`test.css`).
- `assets/js/comun.js` — ejercicios interactivos, diálogos y traducciones emergentes.
- `assets/js/test.js` — motor del test de unidad (estilo Duolingo), reutilizable.
- `assets/js/voz.js` — elige la voz española de mejor calidad del dispositivo para el audio.
- `assets/js/datos/` — datos de cada unidad (glosario de traducciones y preguntas del test).

## Añadir una unidad nueva
1. Copiar `unidad-1.html` como `unidad-N.html` y cambiar el contenido.
2. Crear `assets/js/datos/unidad-N-test.js` (y un glosario si hace falta).
3. En `index.html`, añadir `url`, `titulo` e `img` a la unidad N en la lista `UNIDADES`.
