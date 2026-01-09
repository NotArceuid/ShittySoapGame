import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { log } from "console";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [sveltekit(), tailwindcss(), nodePolyfills()],
    define: {
      PKG_VERSION: JSON.stringify(pkg.version),
      PKG_NAME: JSON.stringify(pkg.name),
    },
    server: {
      allowedHosts: env.VITE_HOST ? [env.VITE_HOST] : []
    }
  };
});


