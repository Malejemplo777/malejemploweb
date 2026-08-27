# GATE.24 / Malejemplo — Brief ampliado de la web (v2)

Basado en `GATE24_Brief_Pagina_Web.pdf` + quiz de 15 preguntas respondida el 2026-08-24.
Este documento es la base para empezar a construir. Sustituye al PDF original como punto de partida.

## 1. Idioma y URLs

- **Bilingüe**, inglés por defecto en la raíz del dominio (`tudominio.com` = inglés).
- Español en `/es` — **fase 2**: primero se construye y lanza en inglés, la traducción al español se hace después, sobre el sitio ya terminado.
- Implicación técnica: dejar el contenido de texto desacoplado del layout desde el día 1 (ficheros de contenido separados por idioma, aunque solo exista el de inglés al principio) para no tener que rehacer componentes cuando se traduzca.

**Historial (resuelto 2026-08-25):** durante un tiempo el panel del plugin dentro de Resolve estuvo enteramente en español mientras la web se construía en inglés — esto generaba un desajuste real (web atrae angloparlantes, plugin en español) que se documentó aquí con un plan de mitigación (aviso honesto + diagrama anotado). **Ya no aplica: el usuario tradujo el panel completo al inglés** (confirmado 2026-08-25 directamente en `Gate24Plugin.cpp` — los 13 presets y todas las etiquetas de controles están en inglés: Viñeta→Vignette, Grano→Grain, Esenciales→Essentials, etc.). El instalador, aparte, sigue soportando español e inglés (ver 4ter). No hace falta ya ni el aviso ni el diagrama anotado — se quitaron de la web y de la guía comparativa.

## 2. Stack técnico — recomendación: **Astro**

Se pidió "framework moderno (Next.js/Astro)". Recomendación: **Astro** con islas de React solo donde haga falta interactividad (slider antes/después, galería de presets) y animación vía GSAP/Framer Motion.

Por qué Astro y no Next.js para este caso concreto:
- Es una landing/marketing site, no una app con estado de usuario — Astro envía ~0 JS por defecto y solo hidrata los componentes interactivos puntuales (mejor rendimiento, mejor SEO).
- Soporte de i18n con rutas por idioma nativo (`astro:i18n`), encaja con el punto 1.
- Curva de mantenimiento más simple para una sola persona (tú + Claude Code) que Next.js App Router.

Si en el futuro un segundo producto necesita algo tipo dashboard/login, se puede añadir Next.js como sub-app o migrar entonces — no es una decisión irreversible.

## 3. Estructura del proyecto

- Se queda en `CLaude\WEB` (no se mueve a `CLaude\Products\`, decisión explícita del usuario).
- La estructura de páginas **deja hueco para futuros productos desde ya**:
  - `/` — home de Malejemplo (marca personal, escaparate)
  - `/gate24` — página de producto de GATE.24 (la más elaborada, con demo/slider/galería/screencast)
  - `/products` o listado en home preparado para más tarjetas de producto futuras
  - `/about` — sobre Malejemplo / el canal
  - `/guides` — **incluido desde el lanzamiento** por SEO (ver 6bis): 2-3 artículos iniciales, ej. comparativa "GATE.24 vs Dehancer vs Film Look Creator" y un tutorial de look cinematográfico en Resolve
  - Páginas legales: `/privacy`, `/cookies` (necesarias por Google Analytics, ver punto 6)
  - Contacto: **sin email visible** — un formulario simple (mismo mecanismo Formspree que la newsletter, ver punto 7) en el footer o en `/about`, para reducir spam.

## 4. Marca del dominio — decisión aplazada

- El dominio **no bloquea nada del diseño/construcción**. Se decide más adelante, cuando el sitio ya esté hecho.
- Al construir con Astro, el proyecto vive en local (y luego en un hosting tipo Vercel/Netlify/Cloudflare Pages) sin necesitar un dominio propio todavía — se puede previsualizar todo con una URL temporal gratuita del hosting antes de comprar nada.
- Cuando llegue el momento: el dominio va bajo **Malejemplo**, no bajo GATE.24 (ej. `malejemplo.com`, no `gate24.io`). Ahí sí habrá que decidir entre `.com`, `.es` u otra extensión y comprobar disponibilidad real en un registrador (Namecheap, Porkbun, etc.) — eso lo compras tú directamente, no es algo que yo pueda hacer por ti.

## 4bis. Diferenciación frente a la competencia — mensaje central del sitio

Esto no es solo para el contenido de "Guides" (punto 11) — es el mensaje que debería llevar el hero de `/gate24`, porque responde justo a lo que la gente ya busca en Google (ver 6bis: "dehancer vs film look creator" tiene tráfico real demostrado).

| | Dehancer | Film Look Creator (nativo, gratis) | **GATE.24** |
|---|---|---|---|
| Precio | ~550$ | Gratis | Paga lo que quieras (puede ser gratis) |
| Recorte multi-formato (barras cine/redes) | No | No | **Sí** |
| Viñeta ligada al carácter de la óptica | Genérica | Genérica | **Sí** |
| Grano por stock de cámara (8/16/35/65mm) | Sí, muy granular (60+ stocks) | Genérico, uno solo | **Sí, simplificado por stock** |
| Protección de tonos de piel en el contraste final | No es su foco | No | **Sí** |
| Presets listos | Pocos, hay que construir el look | 7 genéricos | **13 (Esenciales + De Género)** |
| Curva de aprendizaje | Alta | Media | **Un click y listo, afinable a mano** |

**Actualizado (2026-08-25)**: el titular original ("The $550 cinematic finish, without the $550") le pareció al usuario demasiado agresivo/comparativo para la voz de marca ("hecha por una persona, sin florituras"). Cambiado en el hero de `/gate24` a un tono más suave: *"Everything a $500+ plugin does for your grade — without the price tag."* La comparación de precio se mantiene como dato objetivo en la tabla comparativa (no es agresiva ahí, es solo información), solo se suavizó el titular.

**Corrección de precio (2026-08-25)**: el "$550" venía de un título de vídeo de YouTube, no de la fuente oficial. Al comprobarlo, Dehancer subió precios en mayo de 2025 y la licencia lifetime para DaVinci Resolve ronda ahora los **$699** (según varias fuentes de búsqueda — no se pudo confirmar al 100% en la página oficial de Dehancer por una limitación técnica de la sesión con su selector de precios). Como el precio de un competidor puede volver a cambiar, se optó por dejar de citar una cifra exacta en toda la web y usar **"$500+"** de forma genérica (hero, tabla comparativa, guía) — sigue siendo cierto sin necesidad de mantenerlo actualizado.

**Dos diferenciadores adicionales, confirmados en el código real (punto 12), que ni Dehancer ni Film Look Creator destacan de esta forma:**
- **Vista previa de diagnóstico**: un modo que superpone en la propia imagen dónde y con qué fuerza está actuando la viñeta, el grano o la detección de piel — en vez de adivinar a ojo si el efecto está bien calibrado.
- **Cuentagotas de tono de piel**: la protección de piel no asume un tono fijo — se muestrea el tono real de cada plano con el selector de color nativo de Resolve, así que se adapta a balances de blancos distintos en vez de fallar en planos con luz de color poco habitual.

## 4ter. Requisitos del sistema

- **Sistema operativo**: solo **Windows** por ahora. La web debe decirlo claro (evita descargas frustradas de gente en Mac); se puede añadir "Mac próximamente" si algún día entra en planes.
- **Versión de DaVinci Resolve (Free vs Studio)**: **confirmado — funciona en la versión gratuita de Resolve**, no requiere Studio. El mensaje de "descarga gratis, paga lo que quieras" se mantiene sin matices ni letra pequeña.
- **Idioma del panel del plugin: inglés** (traducido 2026-08-25, ver historial en el punto 1) — ya no hay desajuste con la web.
- El **instalador** (la ventana de Windows con "Next"/"Install") soporta español e inglés — confirmado en `GATE24_Setup.iss`, sección `[Languages]`. Esto es independiente del panel del plugin en Resolve.

## 5. Presentación del producto (GATE.24)

Combinación elegida (sin vídeo hero, se prioriza interactividad + prueba real):
- **Slider antes/después con selector de preset** (actualizado 2026-08-25, idea del usuario): en vez de un único ejemplo genérico, 5 presets "bandera" con temáticas bien distintas (Cine 35, Western polvoriento, Romance/Ensueño, VHS Hogareño, Terror Clásico — ver detalle y qué imagen buscar para cada uno en el punto 12) — se elige un preset y el slider antes/después cambia a esa temática. Mientras no hay fotos reales, cada preset muestra un degradado de color distinto a modo de placeholder temático (no un único cuadro gris genérico para los 5).
- **Galería de los 13 presets**, con sus nombres reales (ver punto 12): Cine 35, Cine 65, Editorial 4:3, Editorial Urbano, Social 9:16, Social 1:1, Social 4:5, Western polvoriento, Romance / Ensueño, VHS Hogareño, Terror Clásico, VHS Deteriorado, Terror Found Footage — sobre la misma imagen base.
- **Screencast del plugin dentro de DaVinci Resolve** — un vídeo de pantalla grabado tú mismo (con OBS o el grabador de pantalla de Resolve) mostrando el panel de GATE.24 en uso real: seleccionando un preset, moviendo algún control, sobre un clip ya gradeado. Es la única de las tres piezas que **no puedo generar yo** porque necesita tu pantalla y el plugin real funcionando. **Aún no está grabado.** Plan: se construye la sección del sitio ya (con un hueco preparado para el vídeo) y se lanza con una captura de pantalla estática del plugin como placeholder; el vídeo se graba y se sustituye cuando tengas un rato — no bloquea el resto del sitio.

## 6. Tráfico y marketing

Fuentes de tráfico esperadas (aclarado — no hay un canal "misterioso", eran las mismas 3 vías dichas con otras palabras):
- YouTube (@Malejemplo) — enlaces en descripción/tarjetas de vídeo.
- Redes sociales (Instagram/TikTok/X).
- Comunidades de coloristas (Reddit, foros, Discord) — cuidado con no sonar a autopromoción.
- No hay plan de ads de pago ni colaboraciones pagadas por ahora.

## 6bis. SEO — prioridad explícita

Objetivo añadido: aparecer en primeras posiciones de Google para búsquedas relevantes, no solo depender de YouTube/comunidades.

Por qué el stack ya ayuda:
- Astro renderiza HTML estático y envía ~0 JS por defecto → Core Web Vitals altos (LCP/CLS/INP), que es señal directa de ranking de Google.
- Astro genera cada página como HTML real (no una SPA vacía que Google tiene que ejecutar JS para leer) → indexación más fiable.

Lo que hay que añadir encima del stack (no viene gratis, hay que construirlo):
- **Keywords objetivo** — ya comprobadas con búsquedas reales (no es una lista adivinada): existe un volumen real y activo de gente comparando plugins de look de película para Resolve — hay varios vídeos de YouTube y hasta un blog dedicado exclusivamente a "Dehancer vs Film Look Creator" publicado en 2026. Esto confirma que la gente SÍ busca activamente "¿cuál plugin de look cinematográfico me compensa en DaVinci Resolve?", que es exactamente el hueco donde vive GATE.24 (más barato/flexible que Dehancer, más control que el Film Look Creator gratuito de Resolve). Términos a targetear:
  - "davinci resolve film look plugin"
  - "dehancer vs film look creator" (comparativa con tráfico de búsqueda demostrado)
  - "film look creator alternative"
  - "film grain plugin davinci resolve"
  - "davinci resolve ofx plugin cinematic look"
  - "cinematic look davinci resolve free" (aprovecha que GATE.24 puede descargarse gratis vía "paga lo que quieras")
- **Metadatos por página**: title/description únicos, Open Graph + Twitter Card (importa también para cuando se comparte en Reddit/Discord/redes).
- **Datos estructurados (schema.org)**: marcar GATE.24 como `SoftwareApplication` — Google puede mostrar rating/precio en el propio resultado de búsqueda.
- `sitemap.xml` + `robots.txt` generados automáticamente (Astro lo soporta con integración oficial) y enviados a Google Search Console.
- **Contenido, no solo landing**: una landing de una sola página compite mal en SEO frente a sitios con contenido. La palanca real para un plugin de nicho es tener 2-4 páginas/posts tipo tutorial o comparativa ("Cómo conseguir look de película en DaVinci Resolve", "GATE.24 vs Film Look Creator nativo") — esto es lo que de verdad trae tráfico de búsqueda con el tiempo, más que la landing en sí.
- Enlaces desde YouTube (descripción de vídeos) y menciones en foros/Reddit cuentan como backlinks — coherente con las fuentes de tráfico ya elegidas.

## 7. Modelo de negocio y captación

- Pago/descarga delegado a **Gumroad** ("paga lo que quieras").
- **Newsletter — versión ligera para empezar**: no se monta una plataforma de email marketing todavía (nada de Mailchimp/ConvertKit por ahora). Se pone un formulario simple de "avísame de nuevos productos" que guarda los emails en un sitio accesible (ej. **Formspree** en su plan gratuito, que envía cada envío a tu correo y los deja también en un panel exportable a CSV) — cero configuración de infraestructura de email, y el día que quieras mandar una newsletter de verdad solo hay que exportar esa lista e importarla a Buttondown/ConvertKit/lo que sea. El formulario recoge los correos "por si pasaran", tal como se pidió.
- [x] **Hecho (2026-08-25)**: cuenta de Formspree creada (plan gratis: formularios ilimitados, 50 envíos/mes en total, historial 30 días). Dos formularios conectados vía `.env` — `PUBLIC_NEWSLETTER_FORM_ACTION` (footer) y `PUBLIC_CONTACT_FORM_ACTION` (`/about`). Confirmado en el build que ambos están activos, sin el aviso de "no configurado".

## 8. Analytics y legal

- **Google Analytics**. Implicación: al usar cookies de rastreo, hace falta banner de consentimiento de cookies + página de política de privacidad (aplica sobre todo si hay visitantes de la UE). Se añade desde el lanzamiento, no después.

## 9. Móvil

- Se decide más adelante. Se construye primero una versión de escritorio bien resuelta (animación completa) y se adapta móvil después viendo qué tiene sentido simplificar.

## 10. Mantenimiento y ritmo

- Mantenimiento: el propio usuario, con Claude Code (favorece un stack basado en código estándar, no herramientas no-code cerradas).
- Ritmo: **sin prisa** — se prioriza acabado y dirección de arte sobre velocidad de lanzamiento.

## 11bis. Bug de slider táctil en móvil — diagnóstico correcto encontrado (2026-08-26)

**Causa real**: no era un problema de `touch-action`/`preventDefault` como se pensó el 25/08 — era Safari de iOS tratando la `<img>` como una imagen normal (su propio menú de "mantener pulsado para guardar/arrastrar"), compitiendo con el gesto de arrastre. Confirmado por el usuario: "al clicarlo se hace como la imagen con el touch del iPhone".

**Arreglo aplicado** en `BeforeAfterSlider.tsx`: `-webkit-user-drag: none`, `-webkit-touch-callout: none`, `-webkit-user-select: none` en la imagen y el contenedor, más `pointer-events: none` directamente en la `<img>` (así el toque nunca la ve a ella como objetivo, siempre pasa al contenedor `.ba-track` que tiene la lógica de arrastre). Es el arreglo estándar para este problema conocido de Safari/iOS.

**Actualización (2026-08-26): no confirmado que esto arreglara el móvil, y se probó y descartó un camino alternativo.** Se intentó sustituir el arrastre por un `<input type="range">` nativo (como los de "Inside the panel", que sí funcionan bien al tacto) — pero introdujo un problema visual nuevo en escritorio (varias líneas verticales del control nativo — thumb/track/`accent-color` de Chrome — visibles pese a `opacity:0` y varios intentos de neutralizarlas) sin llegar a confirmarse que arreglara el móvil. **Revertido a la versión original con eventos de puntero** (la que ya funcionaba bien y se veía limpia en escritorio) + los arreglos `-webkit-*` de arriba, que si son inocuos visualmente. Decisión: **priorizar que escritorio no se rompa por encima de arreglar el móvil a toda costa** — el usuario ha expresado cansancio con este bug concreto ("ya me he rendido un poco"). El móvil sigue sin arrastre confirmado; no es bloqueante para seguir avanzando en otras cosas.

## 11ter. Bug abierto anterior (2026-08-25, ver diagnóstico correcto arriba)

El slider antes/después de "Pick a mood, see the difference" (`BeforeAfterSlider.tsx`, dentro de `PresetShowcase.tsx`) **no se puede arrastrar con el dedo en móvil real** — confirmado por el usuario en su teléfono vía la IP de red local. Se probaron arreglos defensivos (2026-08-25) sin éxito confirmado todavía:
- `e.preventDefault()` en `onPointerDown`/`onPointerMove`.
- `touch-action: none` reforzado.
- `pointer-events: none` en `.ba-handle` (el círculo central) para que nunca sea él quien reciba el toque inicial, solo `.ba-track`.

Sigue sin funcionar tras esto. **Para la próxima sesión, probar en este orden:**
1. Depurar con el móvil conectado por cable a Chrome DevTools (`chrome://inspect` en desktop) o Safari Web Inspector (si es iPhone) para ver el error/comportamiento real en la consola, en vez de seguir aplicando arreglos a ciegas.
2. Si no hay forma de depurar por cable, sustituir los manejadores `onPointerDown/Move/Up` de React (que podrían estar registrándose como pasivos en algún caso) por `addEventListener` manual vía `ref` con `{ passive: false }` explícito — más control garantizado que las props sintéticas de React sobre este punto concreto.
3. Confirmar si el problema es específico de este slider o de cualquier interacción táctil en la web (probar, por ejemplo, si las pestañas de la galería de presets sí responden al toque en el mismo móvil) — acota si es un problema del componente o algo más general del entorno/navegador del móvil en cuestión.

## 11quater. Pasada de limpieza y pulido (2026-08-26)

A petición del usuario, revisión completa de código + contenido en busca de cosas obsoletas/sueltas:
- Quitada nota interna ("Draft by Claude, pending review...") que se veía **públicamente** en las dos guías, con un enlace roto a este mismo brief.
- Corregido un párrafo de la guía comparativa que seguía diciendo "el panel está en español, hemos publicado una guía anotada" — ya no es cierto (panel en inglés) y esa guía anotada nunca se construyó (se abandonó el plan al traducirse el plugin).
- Quitado el aviso de "Themed placeholders shown" en `/gate24` — ya no aplica, las 13 imágenes son reales.
- Borrado `PlaceholderStill.astro`, componente ya sin ningún uso en el código.
- `README.md` reescrito — estaba describiendo el estado inicial del proyecto (todo como placeholder), completamente desfasado tras toda la sesión.
- Confirmado sin más bugs de alineación tipo el de "by Malejemplo" (barrido completo de `text-align:center` en todo el proyecto).
- Sin `console.log` ni credenciales sueltas en el código.
- Build final limpio, sin avisos.

## 11. Abierto / pendiente antes de empezar a construir

1. ~~Grabar el screencast del plugin en Resolve~~ — **hecho (2026-08-25)**. Grabado con OBS (mosaico: panel + árbol de nodos + scopes/waveform), editado en Resolve. Exportado en dos pasadas: original 2560×1440/~16Mbps/74s pesaba 143MB (demasiado para web); reexportado a 1920×1080/~7.8Mbps/53s → 49.5MB. Sigue por encima del objetivo ideal (15-25MB) pero es un salto grande y se compensa técnicamente (`preload="none"` en el `<video>`, no se descarga hasta que alguien le da a play — no afecta a la carga inicial de la página). Copiado a `public/screencast.mp4` y conectado en `/gate24#screencast`, sustituyendo el placeholder. **Portada (poster) añadida también**: un still real exportado desde Resolve (`Still 2026-08-25 194313_1.12.1.jpg`, el fotograma final del vídeo con Cine 35 aplicado) en vez de un fotograma de la UI de Resolve — se ve mejor como miniatura. Copiado a `public/screencast-poster.jpg`.
2. **Redactar el contenido de "Guides"** (antes llamado "blog" — es una sección de 2-3 páginas fijas tipo guía/comparativa, no un feed que hay que alimentar): el usuario no quiere escribirlo. Se resuelve así — **Claude redacta un primer borrador** (comparativa GATE.24 vs Dehancer vs Film Look Creator basada en la tabla del punto 4bis, y un tutorial de look cinematográfico) usando la investigación de keywords del punto 6bis. El usuario solo revisa/ajusta el tono y añade capturas propias.
3. ~~Reunir los materiales del checklist~~ — completo, ver punto 12.
4. Cuando llegue el momento: elegir dominio final (`.com`/`.es`/otro) y confirmar disponibilidad en un registrador (punto 4) — sigue siendo el único punto realmente aplazado, no es tarea de ahora.

## 12. Checklist de materiales — qué necesito que me pases

El usuario dio acceso directo a la carpeta del proyecto del plugin (`CLaude\Products\Gate.24`) y de ahí se sacó ya lo siguiente, sin necesidad de pedirlo:

**Ya resuelto directamente desde el código/documentación del plugin:**
- [x] **Logo/wordmark real**: `CLaude\Products\Gate.24\GATE24_icon_reference.png` — "GATE" / ".24" en dos líneas, Playfair Display Bold, blanco sobre negro, perforaciones de film minimalistas a los lados. Es el diseño de referencia final (puede no coincidir en resolución/formato exacto con lo que pide el SDK de OFX para el icono del plugin, pero para la web sirve tal cual). Icono también disponible en `GATE24\resources\GATE24_icon.png`.
- [x] **Los 13 nombres de preset**, exactos y con su grupo (fuente: `Gate24Plugin.cpp` + `07_ESTADO_ACTUAL_v0.9.md`) — **nombres originales en español, ver punto 1 para la traducción al inglés hecha el 2026-08-25** (Cine 35→Cinema 35, Western polvoriento→Dusty Western, etc.; la web usa ya los nombres en inglés):
  - **Esenciales**: Cine 35 · Cine 65 · Editorial 4:3 · Editorial Urbano · Social 9:16 · Social 1:1 · Social 4:5
  - **De Género**: Western polvoriento · Romance / Ensueño · VHS Hogareño · Terror Clásico · VHS Deteriorado · Terror Found Footage
- [x] **Marca/firma**: publisher del instalador es literalmente `"Malejemplo"` — coincide con la decisión ya tomada de que el dominio vaya bajo Malejemplo.
- [x] **Versión real: 0.95**, no v1.0 (el PDF original decía "prácticamente v1.0" pero el instalador (`GATE24_Setup_0.95.exe`) y la documentación interna confirman 0.95). **Decisión: no poner número de versión en el copy de marketing de la web** (cambiará, y Gumroad ya mostrará la versión del archivo que se suba ahí) — evita tener que ir actualizando la web cada vez que se compile una nueva build.
- [x] **Mac: confirmado que no, solo Windows** — coincide con lo que ya habías dicho. La razón documentada es falta de acceso a hardware Mac, no una decisión de producto, así que el copy puede decir "Windows por ahora" en vez de algo más definitivo.
- [x] **Detalles técnicos reales que enriquecen el punto 4bis (diferenciación) y pueden ir en la página de producto**, sacados de `07_ESTADO_ACTUAL_v0.9.md`:
  - Panel único sin nodos — cualquier control se puede seguir tocando a mano después de aplicar un preset (no es "preset = caja negra").
  - **Modo Simple/Avanzado**: en Simple solo se ven Preset + Activar + Intensidad de cada sección ("un click y listo"); en Avanzado aparece control fino de cada parámetro — literalmente el "un click y listo, afinable a mano" que ya estaba en el brief, pero ahora con el nombre real del control.
  - **Vista previa de diagnóstico** (Normal / Viñeta / Grano / Piel-medios): superpone un overlay de color mostrando exactamente dónde y con qué fuerza está actuando cada efecto — una función poco habitual en plugins de este tipo, vale la pena destacarla como diferenciador propio, no solo copiar lo que ya se sabía.
  - **Protección de piel con cuentagotas**: no es una detección de piel genérica fija — tiene un selector de color nativo de Resolve para muestrear el tono de piel real del plano y recalibrar la detección. Mejora notablemente el argumento de "protección de tonos de piel" del punto 4bis: no es solo una casilla, es una herramienta real que se adapta a cada plano.
  - Aceleración por GPU (OpenCL) confirmada y estable — vista previa en tiempo real, no hay que renderizar para ver el resultado.
  - 9 formatos de crop disponibles: Custom, 2.39:1, 2.20:1, 2:1, 1.85:1, 4:3, 1:1, 4:5, 9:16 — cubre desde cine anamórfico hasta vertical para redes.

**Ya resuelto (2026-08-25):**
- [x] **Las 13 imágenes gradeadas con GATE.24** — completo. Los 5 presets "bandera" (Cine 35, Western polvoriento, Romance/Ensueño, VHS Hogareño, Terror Clásico) tienen antes+después para el slider interactivo; los 8 restantes (Cine 65, Editorial 4:3, Editorial Urbano, Social 9:16/1:1/4:5, VHS Deteriorado, Terror Found Footage) tienen solo la versión "después" para la galería, que es todo lo que necesita. Todo sacado de Pexels/Pixabay y gradeado en Resolve por el usuario. Optimizadas (1920px, JPEG calidad 82, la mayoría entre 65-320KB en vez de 1-2.3MB originales) vía `scripts/optimize-showcase.mjs` y copiadas a `public/showcase/` (18 ficheros). Conectadas en `src/data/presets.ts` (`sampleBefore`/`sampleAfter` por preset). **La carpeta original `Downloads\fils\` ya se puede borrar** (incluida la subcarpeta `raws\` con los vídeos 4K de origen, ~800MB) — todo lo necesario está copiado dentro del proyecto.
- [x] **Galería de 13 con proporción real**: las miniaturas se corrigieron para respetar el formato real de cada preset (16:9, la proporción del fotograma exportado) en vez de un recuadro fijo que cortaba las barras negras del crop.
- [x] **Interactivo "Try all 13 yourself"**: aproximación CSS en vivo (viñeta/grano/contraste basados en los valores reales de cada preset) que deja probar los 13 presets sobre cualquiera de las 5 fotos base, directamente en el navegador. Se deja claro que es una aproximación, no el motor de color real.
- [x] **Nueva sección "Inside the panel" (2026-08-25)**: el usuario aportó 9 capturas reales del panel de GATE.24 dentro de Resolve (General en varios estados, Crop, Reframe, Vignette, Grain, Contrast). Se construyó un acordeón (`PanelWalkthrough.astro`, con `<details>` nativo) con una captura real por sección, colocada justo después del vídeo, antes de la galería de 13.
- [x] **Puntos interactivos por control (2026-08-25)**: a petición del usuario, cada slider/checkbox/dropdown de las capturas tiene su propio punto interactivo (34 en total) — al pasar el ratón o enfocar con teclado, el texto de debajo cambia a la explicación de ese control concreto, sacada literalmente de `setHint()` en `Gate24Plugin.cpp`. Hecho con CSS puro (`:has()` + `:hover`/`:focus-visible`), sin JavaScript. Las posiciones (top/height en %) de cada punto son una estimación visual de las filas en cada captura, no una medición exacta — si algún punto no coincide bien con su fila real al probarlo, avisar para ajustar el porcentaje.
- [x] **Recorte de `general.png` corregido (2026-08-25)**: la captura de "General" incluía la barra de título "GATE.24" que las otras 5 capturas no tenían, dando sensación de inconsistencia. Recortada para empezar igual que el resto (directo en el título de la sección).
- [x] **Reconstrucción completa: capturas → controles reales (2026-08-25)**: el usuario probó la versión con capturas en su móvil y la vio "horrenda" — mal recortada, baja resolución, y con un hueco enorme entre el panel y el texto (bug real: en el layout de grid de 2 columnas, al apilarse en móvil, el hueco fijo de `min-height` de la caption se combinaba mal con el alto real del panel). En vez de arreglar las capturas, se reconstruyó todo el panel con controles HTML reales (`ResolvePanel.astro`, sustituye a `PanelWalkthrough.astro`, que se borró junto con las 6 capturas): sliders (`input type=range`) que de verdad se arrastran y actualizan su valor en vivo, checkboxes y desplegables reales, estilizados para imitar el aspecto del inspector de Resolve. Nítido a cualquier resolución (vectorial/CSS, no imagen). Los 34 controles (mismo desglose: 8+9+3+3+5+6) mantienen el mismo sistema de "pasa el ratón y te dice qué hace", ahora anclado a filas reales en vez de a una posición estimada sobre una imagen — elimina el problema de desalineación de raíz. Verificado geométricamente en escritorio (1280px, todo en la misma fila) y en móvil real (375px, hueco de 24px entre panel y texto, no cientos de píxeles).
- [x] **Reordenado (2026-08-25)**: el usuario sintió que el interactivo aproximado (`LivePresetPlayground`) "quedaba rarillo" tan arriba, comparado con la fidelidad de las fotos reales y el vídeo. Se movió al final de la página, justo antes de "Requirements" — pasa de ser contenido principal a ser un extra/curiosidad opcional al final, coherente con que es una aproximación y no el motor real.

**Sigue haciendo falta (no estaba en el código, tiene que venir de ti):**
- [x] **Handles reales** — hecho (2026-08-25): YouTube `@malejemplofilms7`, Instagram `@malejemplofilms`, TikTok `@malejemplofilms`. Conectados en `src/data/social.ts`, visibles en el footer.
- [x] ~~Capturas del panel + diagrama anotado en inglés~~ — ya no hace falta, el panel del plugin se tradujo al inglés (ver punto 1), no hay desajuste de idioma que explicar.
- [x] ~~Vídeo screencast~~ — grabado y conectado, ver punto 11.1.
- [x] **Hecho (2026-08-25)**: producto publicado en Gumroad — `https://malejemplo6.gumroad.com/l/gate24`. Configurado: paga-lo-que-quieras (mínimo $0, sugerido $5, USD), categoría Films/Video Production/Editing, tags de SEO, política de reembolso, mensaje de recibo personalizado, sin community/Discord/envío/e-publication. Conectado en `.env` (`PUBLIC_GUMROAD_URL`) y verificado en el build — el botón "Get GATE.24" ya no dice "coming soon".

Con el logo y los 13 nombres ya resueltos, hay base de sobra para empezar a maquetar con contenido real en vez de relleno genérico.
