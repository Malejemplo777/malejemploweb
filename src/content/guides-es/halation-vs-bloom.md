---
title: "Halation vs bloom: cuál es la diferencia (y por qué importa al corregir el color)"
description: "El halation y el bloom se parecen, pero vienen de causas físicas distintas en la película real — esta es la diferencia, y por qué tratarlos como un solo deslizador te deja con el equilibrio equivocado."
publishDate: 2026-10-01
translationOf: halation-vs-bloom
---

«Halation» y «bloom» se usan como si fueran lo mismo en mucho marketing de plugins, pero en película real vienen de **causas físicas distintas** — y esa diferencia es justo la razón por la que meterlos en un solo deslizador obliga a un equilibrio malo.

## Bloom: la luz se extiende antes de llegar a la emulsión

El bloom (a veces llamado «glow») es un halo suave e incoloro alrededor de cualquier cosa muy brillante — una ventana, una luz práctica, el sol directo. Viene de la luz que se dispersa dentro del objetivo y se difunde por toda la zona brillante, más o menos por igual en todas direcciones. No tiene preferencia por los bordes; un cielo grande y quemado hace bloom igual de fácil que una luz pequeña y dura.

## Halation: la luz rebota de vuelta a través de la emulsión

El halation es más estrecho y más cálido — un anillo rojizo-anaranjado específicamente a lo largo de los **bordes de alto contraste**, clásicamente alrededor de una farola o del marco de una ventana contra un fondo oscuro. Ocurre porque la luz atraviesa la emulsión de la película, llega a la base o al respaldo de la cámara y se refleja de vuelta hacia arriba, atravesando la emulsión por segunda vez — teñida de rojo porque la capa antihalo (que está ahí justamente para absorber ese rebote) no lo captura todo. Es un fenómeno de borde, no de área.

## Por qué un solo deslizador no funciona

Como son físicamente distintos, responden a cosas distintas:

- El bloom depende de **cuánto brilla** algo — sube un umbral de brillo y atrapas más cielo quemado junto con tu fuente de luz prevista.
- El halation depende del **contraste en un borde** — una silueta contra un cielo brillante puede hacer halation aunque nada en el plano esté del todo quemado.

Un único control de «halation» que en realidad hace las dos cosas tiene que elegir un umbral para dos trabajos distintos. Súbelo para conseguir un anillo de borde visible en una farola tenue, y un cielo brillante empieza a hacer bloom con él. Bájalo para mantener limpio el cielo, y el anillo de borde de la farola desaparece.

## Tratarlos por separado

El mejor enfoque es separar el **halation de borde** y el **brillo general** en dos mecanismos independientes, cada uno con su propio umbral: el halation de borde reacciona al contraste en los bordes (así una farola contra un fondo oscuro puede dibujar un anillo marcado), el brillo general reacciona al brillo sostenido (así un cielo quemado no necesita activar el mecanismo de borde en absoluto). Ajustas «qué cuenta como fuente» para cada uno por separado, en vez de buscar un único número que está mal para los dos.
