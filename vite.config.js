import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";
import ModuleData from "./module.json" with { type: "json" };

const MODULE_ID = "dynamic-weather";

export default defineConfig(({ mode }) => ({
  base: `/modules/${MODULE_ID}/`,

  plugins: [
    vue(),
    {
      name: "vite-plugin-module-json",
      closeBundle() {
        // Build module.json for dist folder
        const moduleJson = { ...ModuleData };

        // Update paths to not include "dist/" prefix since we're already in dist
        moduleJson.esmodules = ["dynamic-weather.js"];
        moduleJson.styles = ["styles/dynamic-weather.css"];

        // Write module.json to dist
        const outputPath = resolve(__dirname, "dist/module.json");
        writeFileSync(outputPath, JSON.stringify(moduleJson, null, 2));

        // Remove .gitignore files from dist
        const gitignorePath = resolve(__dirname, "dist/packs/.gitignore");
        if (existsSync(gitignorePath)) {
          unlinkSync(gitignorePath);
          console.log("Removed .gitignore from dist/packs");
        }
      }
    },
    mode === "production"
      ? viteStaticCopy({
          targets: [
            { src: "lang", dest: "" },
            { src: "packs", dest: "" }
          ],
          flatten: false
        })
      : {}
  ],

  resolve: {
    conditions: ["import", "browser"],
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },

  esbuild: {
    target: ["es2022"],
    keepNames: true // Preserve function and class names for Foundry compatibility
  },

  css: {
    devSourcemap: true
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(mode)
  },

  server: {
    port: 30002,
    open: false,
    allowedHosts: ["localhost"],
    proxy: {
      // Serve static files from main Foundry server
      [`^/(modules/${MODULE_ID}/(lang|packs))`]: {
        target: "http://localhost:30000",
        changeOrigin: true
      },

      // All other paths except Vite dev server routes served from Foundry
      [`^/(?!modules/${MODULE_ID}/(src|@vite|@id|node_modules))`]: {
        target: "http://localhost:30000",
        changeOrigin: true
      },

      // Socket.io WebSocket connection
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true
      }
    }
  },

  preview: {
    port: 30002,
    open: false,
    allowedHosts: ["localhost"],
    proxy: {
      // Serve static files from main Foundry server
      [`^/(modules/${MODULE_ID}/(lang|packs))`]: {
        target: "http://localhost:30000",
        changeOrigin: true
      },

      // All other paths served from Foundry
      [`^/(?!modules/${MODULE_ID}/dist)`]: {
        target: "http://localhost:30000",
        changeOrigin: true
      },

      // Socket.io WebSocket connection
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true
      }
    }
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: "esbuild",
    target: ["es2022"],
    lib: {
      entry: resolve(__dirname, "src/dynamic-weather.js"),
      name: "DynamicWeather",
      formats: ["es"],
      fileName: () => "dynamic-weather.js",
      cssFileName: "dynamic-weather" // Output as dynamic-weather.css
    },
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: assetInfo => {
          // Defensive check for undefined assetInfo
          if (!assetInfo || !assetInfo.name) {
            return "[name][extname]";
          }
          if (assetInfo.name.endsWith(".css")) {
            return "styles/dynamic-weather.css";
          }
          return assetInfo.name;
        }
      }
    }
  },

  // Support for top-level await in Foundry context
  optimizeDeps: {
    rolldownOptions: {
      target: "es2022"
    }
  }
}));
