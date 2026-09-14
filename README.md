# Botika Studio — Agencia digital para boticas

Landing con estética de agencia tecnológica (SaaS + farmacia moderna) para promocionar la creación de tiendas virtuales para boticas, con una demo real funcional y una sección de pago/donación por Yape.

## Estructura

```
botika-studio/
├── index.html       # Landing: agencia digital para boticas (hero 3D, diseños, planes, pago)
├── demo.html         # Tienda funcional de ejemplo: "Botica San José"
├── css/
│   ├── styles.css    # Estilos del landing (tema oscuro/claro, tipografía, animaciones 3D)
│   └── demo.css       # Estilos de la tienda demo (catálogo, carrito, modal de pago)
└── js/
    ├── main.js        # Parallax 3D del hero, reveal de dispositivos, copiar Yape
    └── demo.js         # Catálogo, carrito, checkout y envío del pedido por WhatsApp
```

## Cómo verla

Abre `index.html` directamente en tu navegador (doble clic) o, si prefieres un servidor local:

```bash
cd botika-studio
python3 -m http.server 8000
```

Luego entra a `http://localhost:8000` en tu navegador.

## El landing (`index.html`)

Piensa en el sitio como una agencia especializada, no una tienda de plantillas suelta:

- **Hero** con un celular 3D mostrando la tienda y objetos flotantes (cápsula, frasco, caja, carrito) que reaccionan al mouse.
- **"Míralo en acción"**: un marco tipo video que en realidad enlaza a la demo real (no hay video grabado, así que se evita fingir uno).
- **Galería de diseños**: 4 estilos distintos (Farma One, Plus, Shop, Pro); Farma One enlaza a la demo real, los otros llevan a los planes.
- **Dispositivos**: celular, laptop y desktop que aparecen al hacer scroll.
- **Beneficios, proceso, planes, pago/donación por Yape y CTA final.**

### Qué personalizar

- **Tu QR de Yape**: en la sección `id="pagar"`, reemplaza el SVG de ejemplo (`.fake-qr`) por tu QR real, y cambia el nombre y número. Actualiza también el número en `js/main.js` (constante `number`).
- **Número de WhatsApp**: busca `wa.me/51999999999` en `index.html` y reemplázalo por tu número real con código de país.
- **Precios de los planes**: dentro de la sección `id="planes"`.
- **Colores**: al inicio de `css/styles.css`, dentro de `:root { ... }` (`--void`, `--green`, `--blue`, etc.).
- **Tipografías**: Space Grotesk (titulares) y Manrope (cuerpo), cargadas desde Google Fonts.

## La tienda demo (`demo.html`)

Es una tienda funcional real, no una imagen de ejemplo — parte de tu marketing para mostrar lo que entregas:

- Catálogo con 4 categorías (Medicamentos, Cuidado personal, Vitaminas, Bebés) y 13 productos de muestra.
- Carrito lateral con cantidades editables, que se guarda en el navegador (`localStorage`) aunque recargues la página.
- Botón "Pagar con Yape" que abre un modal con un QR de ejemplo, el número de Yape y el resumen del pedido — este es el QR **del negocio de ejemplo** (Botica San José), distinto al tuyo en el landing.
- Botón "Enviar pedido por WhatsApp" que arma automáticamente el mensaje con los productos, cantidades y el total.

### Qué personalizar en la tienda demo

- **Número de WhatsApp**: en `js/demo.js`, la constante `WHATSAPP_NUMBER`.
- **Número de Yape y nombre del titular**: en `js/demo.js` (`YAPE_NUMBER`) y en `demo.html` dentro de `.qr-box`.
- **Productos, precios y categorías**: en `js/demo.js`, el arreglo `PRODUCTS`.
- **Nombre de la botica e Instagram**: en `demo.html`, dentro del header y el footer.

## Notas técnicas

- No usa frameworks, solo HTML, CSS y JavaScript puro.
- Las animaciones respetan `prefers-reduced-motion` para usuarios que prefieren menos movimiento.
- Es responsive: se adapta a celulares y tablets (breakpoint en 860px).
