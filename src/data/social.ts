// Real handles, added 2026-08-25 (GATE24_Web_Brief_v2.md section 12).
// Set any of these back to null to hide that link instead of rendering a dead href.
export const social = {
  youtube: 'https://www.youtube.com/@malejemplofilms7' as string | null,
  instagram: 'https://www.instagram.com/malejemplofilms/' as string | null,
  tiktok: 'https://www.tiktok.com/@malejemplofilms' as string | null,
  x: null as string | null,
};

// Formspree (or equivalent) form endpoints -- see section 7/12 of the brief.
// Falls back to a disabled state in the UI until these are set.
export const NEWSLETTER_FORM_ACTION = import.meta.env.PUBLIC_NEWSLETTER_FORM_ACTION ?? '';
export const CONTACT_FORM_ACTION = import.meta.env.PUBLIC_CONTACT_FORM_ACTION ?? '';
export const GUMROAD_URL = import.meta.env.PUBLIC_GUMROAD_URL ?? '';
// Two Gumroad products (Lite is free, Pro is paid). Each falls back to the single
// legacy link until its own is set.
export const GUMROAD_LITE_URL = import.meta.env.PUBLIC_GUMROAD_LITE_URL ?? GUMROAD_URL;
export const GUMROAD_PRO_URL = import.meta.env.PUBLIC_GUMROAD_PRO_URL ?? '';
