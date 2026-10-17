import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import tailwindcss from "@tailwindcss/vite";
import process from "process";


// Sisipkan CSS hasil build ke <style> di index.html supaya tidak ada
// request CSS yang memblokir render (render-blocking resource).
function inlineCssPlugin() {
  return {
    name: "inline-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      return html.replace(
        /<link rel="stylesheet"[^>]*href="\/?([^"]+\.css)"[^>]*>/g,
        (tag, file) => {
          const asset = ctx.bundle[file];
          return asset ? `<style>${asset.source}</style>` : tag;
        }
      );
    },
  };
}

// Set ke false jika hosting TIDAK menjalankan `vite preview`
// (mis. hanya menyajikan folder dist statis). Jika false, aplikasi memanggil
// API Delcom langsung seperti sebelumnya.
const USE_API_PROXY = true;
const API_PROXY_PATH = "/delcom-api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1";
  const apiUrl = new URL(baseUrl);
  const useProxy = USE_API_PROXY && mode === "production";

  return {
    plugins: [
      svelte({
        prebundleSvelteLibraries: false,
      }),
      tailwindcss(),
      inlineCssPlugin(),
      svelteTesting(),
    ],
    server: {
      port: Number(env.APP_PORT) || 3004,
    },
    preview: {
      port: Number(env.APP_PORT) || 3004,
      // Request /delcom-api/* diteruskan server ke API Delcom sehingga browser
      // hanya melakukan request satu-origin (tanpa preflight CORS + Authorization).
      proxy: {
        [API_PROXY_PATH]: {
          target: apiUrl.origin,
          changeOrigin: true,
          rewrite: (path) => path.replace(API_PROXY_PATH, apiUrl.pathname),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(useProxy ? API_PROXY_PATH : baseUrl),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,svelte}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});