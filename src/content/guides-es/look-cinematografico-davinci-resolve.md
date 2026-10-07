---
title: "Cómo conseguir un look cinematográfico en DaVinci Resolve (flujo gratuito)"
description: "Un flujo paso a paso para dar el acabado a un clip ya corregido de color en DaVinci Resolve, con barras de recorte, viñeta ligada a la óptica, grano de película y contraste que protege la piel."
publishDate: 2026-08-25
translationOf: cinematic-film-look-davinci-resolve-tutorial
---

Un «look cinematográfico» no es un solo deslizador — suele ser cuatro cosas apiladas: **encuadre**, **viñeta**, **grano** y un **pase final de contraste**. Este es el orden que de verdad funciona, y por qué.

## 1. Primero la corrección de color, el acabado al final

Haz tu corrección de color primaria antes de nada de esto. Las barras de encuadre, el grano y un pase final de contraste están pensados para ir encima de un clip que ya tiene el color bien, no para arreglar una mala corrección. Si trabajas en Log, DaVinci Wide Gamut o ACES, asegúrate de haber convertido a Rec.709 (con CST o con tu LUT de salida) *antes* del nodo de acabado. El grano y la detección de tonos de piel dan por hecho que miran una imagen normal, referida a pantalla — en Log, el «gris medio» y el tono real de la piel viven en otros sitios, así que las matemáticas leen mal.

## 2. Encuadra para donde va el vídeo

Elige la relación de aspecto según la entrega, no por costumbre: 2.39:1 o 2.20:1 para sensación de cine, 4:3 o 1:1 para un look editorial o de impresión, 9:16, 1:1 o 4:5 si cortas para redes sociales. Las barras de recorte con las esquinas ligeramente redondeadas se leen más como «ventanilla de proyector antiguo» que un rectángulo duro — un detalle pequeño, fácil de pasar por alto y difícil de dejar de ver una vez que lo notas.

## 3. Viñeta: ajústala a una óptica, no a un deslizador

Una viñeta no es solo «esquinas oscuras». La forma en que cae la luz en el borde del encuadre es distinta en una óptica anamórfica (ovalada, caída más cerrada) que en una esférica (redonda, caída más suave) o en un look sutil de teleobjetivo. Elige el carácter que encaje con tu historia, no solo la opción más oscura.

## 4. Grano: ajústalo al negativo, no solo a la cantidad

Los distintos negativos de película tienen una estructura de grano claramente distinta — el 8 mm y el 16 mm se leen toscos y caseros, el 35 mm es la textura estándar del cine, el 65 mm es casi invisible. Antes de tocar la intensidad, elige el negativo que encaje con el ambiente que buscas; solo entonces sube o baja la cantidad.

## 5. Contraste — y sin aplastar los tonos de piel

La forma más fácil de estropear un buen pase de acabado es una curva de contraste que también aplasta las caras. Si tu herramienta tiene un modo de protección de piel, úsalo — y si te deja muestrear el tono de piel real de tu plano en vez de asumir un tono fijo por defecto, usa eso también. El tono de piel cambia con el balance de blancos y la iluminación entre planos más de lo que la gente espera; una suposición fija falla justo en los planos que no encajan.

## Hacerlo en un solo paso

Cada paso de arriba es una decisión técnica real y separada — y por eso es lento hacerlo a mano en cada clip. Este es el flujo en torno al que está construido [GATE.24](/es/gate24/): reúne los cuatro pasos (recorte, viñeta ligada a la óptica, grano según el negativo y contraste que protege la piel) en 13 presets listos para usar, cada uno un punto de partida que sigues pudiendo afinar a mano. Funciona en la versión gratuita de DaVinci Resolve, solo en Windows por ahora.
