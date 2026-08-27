// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Registered 2026-08-26 via Spaceship (see GATE24_Web_Brief_v2.md section 4).
const SITE_URL = 'https://malejemplofilms.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()]
});