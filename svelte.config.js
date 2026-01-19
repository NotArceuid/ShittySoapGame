import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    paths: {
      base: process.env.NODE_ENV == 'production' ? '/soap-game' : ''
    }
  },
  compilerOptions: {
    customElement: true
  },
  preprocess: vitePreprocess(),
};

export default config;
