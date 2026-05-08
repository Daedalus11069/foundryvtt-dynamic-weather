#!/usr/bin/env node
import { statSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const SOURCE_DIR = resolve("src/packs/weather-tables/_source");
const PACK_DIR = resolve("packs/weather-tables");

/**
 * Get the latest modification time from a directory
 * @param {string} dir - Directory path
 * @returns {number} - Latest modification timestamp in milliseconds
 */
function getLatestModTime(dir) {
  if (!existsSync(dir)) {
    return 0;
  }

  try {
    const files = readdirSync(dir);
    let latestTime = 0;

    for (const file of files) {
      // Skip hidden files and .gitignore
      if (file.startsWith(".")) {
        continue;
      }

      const filePath = join(dir, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        const subDirTime = getLatestModTime(filePath);
        latestTime = Math.max(latestTime, subDirTime);
      } else {
        // For source: only check .json files
        // For packs: check all files (LevelDB files)
        const isSourceDir = dir.includes("_source");
        if (!isSourceDir || file.endsWith(".json")) {
          latestTime = Math.max(latestTime, stats.mtimeMs);
        }
      }
    }

    return latestTime;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
    return 0;
  }
}

/**
 * Check if packs need to be rebuilt
 * @returns {boolean} - True if rebuild is needed
 */
function needsRebuild() {
  // If pack directory doesn't exist, we need to build
  if (!existsSync(PACK_DIR)) {
    console.log("Pack directory does not exist. Building packs...");
    return true;
  }

  const sourceModTime = getLatestModTime(SOURCE_DIR);
  const packModTime = getLatestModTime(PACK_DIR);

  if (sourceModTime === 0) {
    console.log("No source files found.");
    return false;
  }

  if (packModTime === 0) {
    console.log("No pack files found. Building packs...");
    return true;
  }

  // Check if source files are newer than pack files
  if (sourceModTime > packModTime) {
    console.log("Source files have been modified. Rebuilding packs...");
    return true;
  }

  console.log("Packs are up to date. Skipping rebuild.");
  return false;
}

/**
 * Build the packs using fvtt CLI
 */
function buildPacks() {
  try {
    console.log("Building packs from source...");
    execSync(
      "fvtt package pack weather-tables --in src/packs/weather-tables/_source --out packs",
      {
        stdio: "inherit"
      }
    );
    console.log("Packs built successfully!");
  } catch (error) {
    console.error("Error building packs:", error.message);
    process.exit(1);
  }
}

// Main execution
if (needsRebuild()) {
  buildPacks();
} else {
  console.log("No pack rebuild needed.");
}
