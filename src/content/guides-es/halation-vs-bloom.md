---
title: "Halation vs bloom: en qué se diferencian (y por qué importa al etalonar)"
description: "El halation y el bloom se parecen, pero en la película real tienen causas físicas distintas. Te explicamos la diferencia y por qué tratarlos con un solo slider te lleva a un equilibrio equivocado."
publishDate: 2026-10-01
cover: m04-original
translationOf: halation-vs-bloom
---

En el marketing de muchos plugins, «halation» y «bloom» se usan como si fueran lo mismo, pero en película real tienen **causas físicas distintas**, y esa diferencia es justo la razón por la que juntarlos en un solo slider obliga a un compromiso malo.

## Bloom: la luz se esparce antes de llegar a la emulsión

El bloom (a veces llamado «glow») es un halo suave e incoloro alrededor de cualquier cosa muy brillante: una ventana, una luz práctica, el sol directo. Se produce cuando la luz se dispersa dentro del objetivo y se difunde por toda la zona brillante, más o menos igual en todas direcciones. No tiene preferencia por los bordes: un cielo grande y quemado hace bloom con la misma facilidad que una luz pequeña y dura.

## Halation: la luz rebota de vuelta a través de la emulsión

El halation es más estrecho y más cálido: un anillo rojizo-anaranjado que aparece justo en los **bordes de alto contraste**, como el que se ve alrededor de una farola o del marco de una ventana sobre un fondo oscuro. Ocurre porque la luz atraviesa la emulsión de la película, llega a la base o al respaldo de la cámara y rebota hacia arriba, cruzando la emulsión por segunda vez. Sale teñido de rojo porque la capa antihalo (que está justamente para absorber ese rebote) no lo captura todo. Es un fenómeno de bordes, no de áreas.

## Por qué un solo slider no funciona

Como son físicamente distintos, reaccionan a cosas distintas:

- El bloom depende de **lo brillante que sea** algo: si subes un umbral de brillo, te llevas también más cielo quemado junto con la fuente de luz que querías.
- El halation depende del **contraste en un borde**: una silueta contra un cielo claro puede hacer halation aunque nada del plano esté realmente quemado.

Un único control de «halation» que en realidad hace las dos cosas tiene que elegir un umbral para dos trabajos distintos. Si lo subes para conseguir un anillo visible en una farola tenue, un cielo brillante empieza a hacer bloom con ella. Si lo bajas para mantener el cielo limpio, el anillo de la farola desaparece.

## Tratarlos por separado

Lo mejor es separar el **halation de borde** y el **brillo general** en dos mecanismos independientes, cada uno con su propio umbral: el halation de borde reacciona al contraste en los bordes (así una farola sobre un fondo oscuro puede dibujar un anillo marcado) y el brillo general reacciona al brillo sostenido (así un cielo quemado no tiene por qué activar el mecanismo de bordes). Ajustas «qué cuenta como fuente» por separado en cada uno, en vez de buscar un único número que está mal para los dos.
