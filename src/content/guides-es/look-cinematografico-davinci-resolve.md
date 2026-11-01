---
title: "Cómo conseguir un look cinematográfico en DaVinci Resolve (con un flujo gratuito)"
description: "Un flujo paso a paso para dar el acabado a un clip ya etalonado en DaVinci Resolve: barras de recorte, viñeta según la óptica, grano de película y contraste que respeta la piel."
publishDate: 2026-08-25
translationOf: cinematic-film-look-davinci-resolve-tutorial
---

Un «look cinematográfico» no sale de un solo slider. Suelen ser cuatro cosas apiladas: **encuadre**, **viñeta**, **grano** y un **pase final de contraste**. Este es el orden que de verdad funciona, y por qué.

## 1. Primero el etalonaje, el acabado al final

Haz tu etalonaje primario antes de tocar nada de esto. Las barras, el grano y el pase final de contraste están pensados para ir encima de un clip que ya tiene el color bien resuelto, no para arreglar un etalonaje flojo. Si trabajas en Log, DaVinci Wide Gamut o ACES, convierte a Rec.709 (con un CST o con tu LUT de salida) *antes* del nodo de acabado. El grano y la detección de tonos de piel dan por hecho que están viendo una imagen normal, preparada para pantalla; en Log, el gris medio y el tono real de la piel están en otro sitio y las cuentas salen mal.

## 2. Encuadra según dónde se va a ver el vídeo

Elige la relación de aspecto por el formato de entrega, no por costumbre: 2.39:1 o 2.20:1 para un aire de cine, 4:3 o 1:1 para un look más editorial o de impresión. Unas barras con las esquinas ligeramente redondeadas recuerdan más a la ventanilla de un proyector antiguo que un rectángulo seco. Es un detalle pequeño, fácil de pasar por alto y difícil de dejar de ver una vez que te fijas.

## 3. Viñeta: ajústala a una óptica, no a un slider

Una viñeta no es solo «esquinas oscuras». La luz cae de forma distinta en el borde del encuadre según la óptica: en una anamórfica la caída es ovalada y más cerrada, en una esférica es redonda y más suave, y con un teleobjetivo es muy sutil. Elige el carácter que encaje con tu historia, no simplemente la opción más oscura.

## 4. Grano: ajústalo a la película, no solo a la cantidad

Cada película tiene una estructura de grano muy distinta: el 8 mm y el 16 mm se ven toscos y caseros, el 35 mm es la textura estándar del cine y el 65 mm casi no se nota. Antes de tocar la intensidad, elige la película que encaje con el ambiente que buscas; solo después sube o baja la cantidad.

## 5. Contraste, sin machacar la piel

La forma más fácil de estropear un buen pase de acabado es una curva de contraste que también aplasta las caras. Si tu herramienta tiene un modo de protección de piel, úsalo; y si te deja tomar el tono de piel real de tu plano en vez de dar por bueno uno fijo, mejor todavía. El tono de piel cambia con el balance de blancos y la luz de un plano a otro más de lo que la gente cree, y un valor fijo falla justo en los planos que no encajan.

## Todo en un solo paso

Cada uno de estos pasos es una decisión técnica real e independiente, y por eso hacerlos a mano en cada clip es lento. Este es el flujo sobre el que está montado [GATE.24](/es/gate24/): reúne los cuatro pasos (recorte, viñeta según la óptica, grano según la película y contraste que respeta la piel) en 10 presets que sirven de punto de partida y que puedes seguir afinando a mano. Funciona con la versión gratuita de DaVinci Resolve y, por ahora, solo en Windows.
