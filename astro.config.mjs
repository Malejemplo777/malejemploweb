// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// TODO: domain is not decided yet (see GATE24_Web_Brief_v2.md, section 4) --
// update this once it's registered. Required for sitemap.xml / canonical URLs.
const SITE_URL = 'https://malejemplo.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()]
});