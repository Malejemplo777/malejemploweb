export type Lang = 'en' | 'es';
export const defaultLang: Lang = 'en';

export function langFromUrl(url: URL): Lang {
  return /^\/es(\/|$)/.test(url.pathname) ? 'es' : 'en';
}

export type PageKey = 'home' | 'gate24' | 'guides' | 'about' | 'privacy' | 'cookies';

// Spanish routes get Spanish slugs (better for Spanish search); the English
// routes are untouched so nothing already indexed moves.
const slugs: Record<Exclude<PageKey, 'home' | 'gate24'>, Record<Lang, string>> = {
  guides: { en: 'guides', es: 'guias' },
  about: { en: 'about', es: 'acerca' },
  privacy: { en: 'privacy', es: 'privacidad' },
  cookies: { en: 'cookies', es: 'cookies' },
};

export function pagePath(key: PageKey, lang: Lang, hash = ''): string {
  const base = lang === 'es' ? '/es/' : '/';
  const seg = key === 'home' ? '' : key === 'gate24' ? 'gate24' : slugs[key][lang];
  return `${base}${seg ? `${seg}/` : ''}${hash}`;
}

export function guidePath(slug: string, lang: Lang): string {
  return `${pagePath('guides', lang)}${slug}/`;
}

export const ui = {
  en: {
    langName: 'English',
    switchTo: 'Español',
    switchLabel: 'Leer en español',
    skip: 'Skip to content',
    homeLabel: 'Malejemplo -- home',
    menu: 'Menu',
    navLabel: 'Main',
    nav: { gate24: 'GATE.24', guides: 'Guides', about: 'About' },
    footer: {
      tagline: 'Film tools for DaVinci Resolve, made by one person.',
      stay: 'Stay in the loop',
      legal: 'Contact & legal',
      contact: 'Contact',
      privacy: 'Privacy policy',
      cookies: 'Cookie policy',
      cookieSettings: 'Cookie settings',
      copyright: 'GATE.24 is a product by Malejemplo.',
    },
    newsletter: {
      label: 'Get notified about new releases',
      placeholder: 'you@email.com',
      button: 'Notify me',
      sending: 'Sending...',
      success: "Thanks — you're on the list.",
      error: 'Something went wrong. Try again in a moment.',
    },
    contact: {
      email: 'Email',
      message: 'Message',
      send: 'Send',
      sending: 'Sending...',
      success: "Thanks — message received, I'll get back to you.",
      error: 'Something went wrong. Try again in a moment.',
    },
    cookie: {
      dialog: 'Cookie consent',
      withGa: 'This site uses Google Analytics to understand traffic. No data is collected until you accept.',
      withoutGa: "This site doesn't set any optional cookies right now — nothing to choose. See the",
      policy: 'Cookie policy',
      policyLower: 'cookie policy',
      detailsAfter: 'for details.',
      decline: 'Decline',
      accept: 'Accept',
      close: 'Close',
    },
    slider: { before: 'Before', after: 'With GATE.24', position: 'Comparison position' },
  },
  es: {
    langName: 'Español',
    switchTo: 'English',
    switchLabel: 'Read in English',
    skip: 'Saltar al contenido',
    homeLabel: 'Malejemplo -- inicio',
    menu: 'Menú',
    navLabel: 'Principal',
    nav: { gate24: 'GATE.24', guides: 'Guías', about: 'Acerca de' },
    footer: {
      tagline: 'Herramientas de cine para DaVinci Resolve, hechas por una sola persona.',
      stay: 'Mantente al día',
      legal: 'Contacto y legal',
      contact: 'Contacto',
      privacy: 'Política de privacidad',
      cookies: 'Política de cookies',
      cookieSettings: 'Ajustes de cookies',
      copyright: 'GATE.24 es un producto de Malejemplo.',
    },
    newsletter: {
      label: 'Avísame de nuevos lanzamientos',
      placeholder: 'tu@email.com',
      button: 'Avísame',
      sending: 'Enviando...',
      success: 'Gracias — ya estás en la lista.',
      error: 'Algo ha fallado. Inténtalo de nuevo en un momento.',
    },
    contact: {
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar',
      sending: 'Enviando...',
      success: 'Gracias — mensaje recibido, te responderé pronto.',
      error: 'Algo ha fallado. Inténtalo de nuevo en un momento.',
    },
    cookie: {
      dialog: 'Consentimiento de cookies',
      withGa: 'Este sitio usa Google Analytics para entender el tráfico. No se recoge ningún dato hasta que aceptes.',
      withoutGa: 'Este sitio no instala ninguna cookie opcional ahora mismo — no hay nada que elegir. Consulta la',
      policy: 'Política de cookies',
      policyLower: 'política de cookies',
      detailsAfter: 'para más detalles.',
      decline: 'Rechazar',
      accept: 'Aceptar',
      close: 'Cerrar',
    },
    slider: { before: 'Antes', after: 'Con GATE.24', position: 'Posición de la comparación' },
  },
} as const;
