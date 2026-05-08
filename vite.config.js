import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve, join } from "path";
import {
  readFileSync,
  writeFileSync,
  unlinkSync,
  existsSync,
  rmSync,
  readdirSync,
  statSync,
  cpSync
} from "fs";
import ModuleData from "./module.json" with { type: "json" };

const MODULE_ID = "dynamic-weather";

/**
 * Get the latest modification time from a directory
 */
function getLatestModTime(dir) {
  if (!existsSync(dir)) {
    return 0;
  }

  try {
    const files = readdirSync(dir);
    let latestTime = 0;

    for (const file of files) {
      if (file.startsWith(".")) continue;

      const filePath = join(dir, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        const subDirTime = getLatestModTime(filePath);
        latestTime = Math.max(latestTime, subDirTime);
      } else {
        latestTime = Math.max(latestTime, stats.mtimeMs);
      }
    }

    return latestTime;
  } catch (error) {
    return 0;
  }
}

// Check if packs need to be copied BEFORE starting the build
const packsSrc = resolve(import.meta.dirname, "packs");
const packsDest = resolve(import.meta.dirname, "dist/packs");
const packsNeedCopy = getLatestModTime(packsSrc) > getLatestModTime(packsDest);

console.log(
  packsNeedCopy
    ? "Packs will be copied during build"
    : "Packs are up to date, will skip copy"
);

export default defineConfig(({ mode }) => ({
  base: `/modules/${MODULE_ID}/`,

  build: {
    emptyOutDir: false,
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/dynamic-weather.js"),
      name: "DynamicWeather",
      fileName: () => "dynamic-weather.js",
      formats: ["es"]
    },
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          if (assetInfo.name === "style.css") {
            return "styles/dynamic-weather.css";
          }
          return assetInfo.name;
        }
      }
    }
  },

  plugins: [
    {
      name: "smart-copy-static-files",
      enforce: "pre",
      config(config) {
        // Ensure emptyOutDir is definitely false
        if (!config.build) config.build = {};
        config.build.emptyOutDir = false;
        return config;
      },
      configResolved(config) {
        // Find and completely disable the vite:prepare-out-dir plugin
        const preparePluginIndex = config.plugins.findIndex(
          p => p.name === "vite:prepare-out-dir"
        );
        if (preparePluginIndex >= 0) {
          // Replace all hooks with no-ops
          const preparePlugin = config.plugins[preparePluginIndex];
          preparePlugin.buildStart = undefined;
          preparePlugin.resolveId = undefined;
          preparePlugin.load = undefined;
        }
      },
      buildStart() {
        // Manually clean only unlocked files from dist
        const distPath = resolve(import.meta.dirname, "dist");
        if (existsSync(distPath)) {
          try {
            const entries = readdirSync(distPath);
            for (const entry of entries) {
              // Skip packs folder unless we need to copy it
              if (entry === "packs" && !packsNeedCopy) {
                continue;
              }
              // Skip lang folder - always safe to copy
              if (entry === "lang") {
                continue;
              }
              const fullPath = resolve(distPath, entry);
              try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                  rmSync(fullPath, { recursive: true, force: true });
                } else {
                  unlinkSync(fullPath);
                }
              } catch (err) {
                // Skip locked files
              }
            }
          } catch (err) {
            // Ignore errors
          }
        }
      },
      closeBundle() {
        if (mode !== "production") return;

        // Copy lang folder (always safe to copy)
        const langSrc = resolve(import.meta.dirname, "lang");
        const langDest = resolve(import.meta.dirname, "dist/lang");
        if (existsSync(langSrc)) {
          try {
            cpSync(langSrc, langDest, { recursive: true, force: true });
            console.log("Copied lang folder to dist");
          } catch (err) {
            console.warn("Could not copy lang folder:", err.message);
          }
        }

        // Only copy packs if they've changed
        if (packsNeedCopy) {
          try {
            cpSync(packsSrc, packsDest, { recursive: true, force: true });
            console.log("Copied packs folder to dist");
          } catch (err) {
            console.warn(
              "Could not copy packs folder (may be locked by Foundry):",
              err.message
            );
            console.warn(
              "This is normal if Foundry is running. Try closing Foundry before building."
            );
          }
        } else {
          console.log("Packs in dist are up to date, skipping copy");
        }
      }
    },
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
        const outputPath = resolve(import.meta.dirname, "dist/module.json");
        writeFileSync(outputPath, JSON.stringify(moduleJson, null, 2));

        // Remove .gitignore files from dist
        const gitignorePath = resolve(
          import.meta.dirname,
          "dist/packs/.gitignore"
        );
        if (existsSync(gitignorePath)) {
          try {
            unlinkSync(gitignorePath);
            console.log("Removed .gitignore from dist/packs");
          } catch (err) {
            // File might be locked, skip
          }
        }
      }
    }
  ],

  resolve: {
    conditions: ["import", "browser"],
    alias: {
      "@": resolve(import.meta.dirname, "./src")
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
