/**
 * Dynamic Weather Patterns Module for Foundry VTT
 * Creates realistic weather transitions based on rolltables and time
 */

import { createApp, h } from "vue";
import WeatherControl from "@/components/WeatherControl.vue";
import "@/dynamic-weather.css";

/**
 * Convert frequency value and unit to milliseconds
 * @param {number} value - The frequency value
 * @param {string} unit - The unit (minutes, hours, days)
 * @returns {number} - Frequency in milliseconds
 */
function convertFrequencyToMs(value, unit) {
  const conversions = {
    minutes: 60000,
    hours: 3600000,
    days: 86400000
  };
  return value * (conversions[unit] || conversions.hours);
}

class WeatherPattern {
  constructor(data = {}) {
    this.id = data.id || foundry.utils.randomID();
    this.name = data.name || "Clear";
    this.description = data.description || "";
    this.intensity = data.intensity || 0; // 0-100 scale
    this.temperature = data.temperature || 20; // Celsius
    this.precipitation = data.precipitation || 0; // 0-100 scale
    this.windSpeed = data.windSpeed || 0; // km/h
    this.cloudCover = data.cloudCover || 0; // 0-100 scale
    this.visibility = data.visibility || 100; // 0-100 scale
    this.timestamp = data.timestamp || Date.now();
    this.weatherType = data.weatherType || "normal"; // "normal" or "strange"

    // Special effects for magical/supernatural weather
    this.hasSpecialEffects = data.hasSpecialEffects || false;
    this.constantEffects = data.constantEffects || []; // Array of effect descriptions
    this.randomEventsTable = data.randomEventsTable || null; // RollTable ID for random events
    this.eventFrequency = data.eventFrequency || 1800000; // How often to roll random events (default 30 min)
    this.effectDuration = data.effectDuration || null; // Override normal duration
  }

  /**
   * Calculate compatibility score with another weather pattern (0-1)
   * Used to determine realistic transition paths
   */
  compatibilityWith(otherPattern) {
    const tempDiff = Math.abs(this.temperature - otherPattern.temperature);
    const precipDiff = Math.abs(
      this.precipitation - otherPattern.precipitation
    );
    const cloudDiff = Math.abs(this.cloudCover - otherPattern.cloudCover);

    // Lower differences mean higher compatibility
    const score = 1 - (tempDiff / 40 + precipDiff / 100 + cloudDiff / 100) / 3;
    return Math.max(0, Math.min(1, score));
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      intensity: this.intensity,
      temperature: this.temperature,
      precipitation: this.precipitation,
      windSpeed: this.windSpeed,
      cloudCover: this.cloudCover,
      visibility: this.visibility,
      timestamp: this.timestamp,
      weatherType: this.weatherType,
      hasSpecialEffects: this.hasSpecialEffects,
      constantEffects: this.constantEffects,
      randomEventsTable: this.randomEventsTable,
      eventFrequency: this.eventFrequency,
      effectDuration: this.effectDuration
    };
  }
}

class WeatherTransitionManager {
  constructor() {
    this.currentPattern = null;
    this.targetPattern = null;
    this.transitionProgress = 0; // 0-1
    this.transitionDuration = 300000; // 5 minutes in milliseconds
    this.transitionStartTime = null; // When the transition started
    this.lastUpdate = Date.now();
  }

  /**
   * Start a transition to a new weather pattern
   * @param {WeatherPattern} targetPattern - The weather pattern to transition to
   * @param {Number} duration - Transition duration in milliseconds
   */
  startTransition(targetPattern, duration = null) {
    if (!this.currentPattern) {
      this.currentPattern = targetPattern;
      this.transitionProgress = 1;
      this.transitionStartTime = null;
      return;
    }

    this.targetPattern = targetPattern;
    this.transitionProgress = 0;

    // Adjust duration based on pattern compatibility
    const compatibility = this.currentPattern.compatibilityWith(targetPattern);
    const baseDuration = duration || this.transitionDuration;

    // Less compatible patterns take longer to transition
    this.transitionDuration = baseDuration * (2 - compatibility);
    this.transitionStartTime = Date.now();
    this.lastUpdate = Date.now();
  }

  /**
   * Update the transition state based on elapsed time
   */
  update() {
    if (!this.targetPattern || this.transitionProgress >= 1) {
      return false;
    }

    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    this.lastUpdate = now;

    const increment = elapsed / this.transitionDuration;
    this.transitionProgress += increment;

    if (this.transitionProgress > 1) {
      this.transitionProgress = 1;
    }

    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.currentPattern = this.targetPattern;
      this.targetPattern = null;
      return true; // Transition complete
    }

    return false;
  }

  /**
   * Get the current interpolated weather state
   */
  getCurrentState() {
    if (!this.currentPattern) return null;
    if (!this.targetPattern || this.transitionProgress >= 1) {
      return this.currentPattern;
    }

    // Interpolate between current and target patterns
    const t = this.transitionProgress;
    const eased = this.easeInOutCubic(t); // Smooth transition curve

    const interpolated = new WeatherPattern({
      name: this.targetPattern.name, // Always show the target (new) weather name
      description: this.targetPattern.description, // Always show the target description
      intensity: this.lerp(
        this.currentPattern.intensity,
        this.targetPattern.intensity,
        eased
      ),
      temperature: this.lerp(
        this.currentPattern.temperature,
        this.targetPattern.temperature,
        eased
      ),
      precipitation: this.lerp(
        this.currentPattern.precipitation,
        this.targetPattern.precipitation,
        eased
      ),
      windSpeed: this.lerp(
        this.currentPattern.windSpeed,
        this.targetPattern.windSpeed,
        eased
      ),
      cloudCover: this.lerp(
        this.currentPattern.cloudCover,
        this.targetPattern.cloudCover,
        eased
      ),
      visibility: this.lerp(
        this.currentPattern.visibility,
        this.targetPattern.visibility,
        eased
      ),
      timestamp: Date.now()
    });

    return interpolated;
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  getProgress() {
    return this.transitionProgress;
  }

  isTransitioning() {
    return this.targetPattern !== null && this.transitionProgress < 1;
  }
}

class DynamicWeatherSystem {
  constructor() {
    this.transitionManager = new WeatherTransitionManager();
    this.updateInterval = null;
    this.rollTableId = null;
    this.strangeWeatherRollTableIds = [];
    this.updateFrequency = 3600000; // 1 hour default
    this.lastRoll = 0;
    this.isActive = false;
  }

  /**
   * Initialize the weather system
   */
  async initialize() {
    console.log("Dynamic Weather: Initializing system");

    // Load saved state
    await this.loadState();

    // Start the update loop
    this.startUpdateLoop();

    this.isActive = true;

    // If no current weather, roll immediately (only if table is configured)
    if (!this.transitionManager.currentPattern && this.rollTableId) {
      await this.rollWeather();
    } else if (!this.rollTableId) {
      console.warn(
        "Dynamic Weather: No rolltable configured. Please configure one in settings or the control dialog."
      );
    }
  }

  /**
   * Start the periodic update loop
   */
  startUpdateLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update every second for smooth transitions
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000);
  }

  /**
   * Main update loop
   */
  async update() {
    if (!this.isActive) return;

    // Update transition state
    const transitionComplete = this.transitionManager.update();

    if (transitionComplete) {
      await this.saveState();
      Hooks.callAll(
        "dynamicWeatherTransitionComplete",
        this.transitionManager.getCurrentState()
      );
    }

    // Check if it's time to roll for new weather
    const now = Date.now();
    const timeSinceLastRoll = now - this.lastRoll;
    if (timeSinceLastRoll >= this.updateFrequency) {
      await this.rollWeather();
    }

    // Broadcast current state
    Hooks.callAll(
      "dynamicWeatherUpdate",
      this.transitionManager.getCurrentState()
    );
  }

  /**
   * Roll on the configured rolltable for new weather
   */
  async rollWeather() {
    const weatherMode = game.settings.get("dynamic-weather", "weatherMode");
    let tableToUse = null;
    let weatherType = "normal";

    // Determine which table to roll on based on mode
    if (weatherMode === "normal") {
      if (!this.rollTableId) {
        console.warn("Dynamic Weather: No normal weather rolltable configured");
        return;
      }
      tableToUse = this.rollTableId;
      weatherType = "normal";

      // Debug logging
      const table = game.tables.get(tableToUse);
    } else if (weatherMode === "strange") {
      if (
        !this.strangeWeatherRollTableIds ||
        this.strangeWeatherRollTableIds.length === 0
      ) {
        console.warn(
          "Dynamic Weather: No strange weather rolltables configured"
        );
        return;
      }
      // Randomly pick one of the selected strange tables
      tableToUse =
        this.strangeWeatherRollTableIds[
          Math.floor(Math.random() * this.strangeWeatherRollTableIds.length)
        ];
      weatherType = "strange";
    } else if (weatherMode === "hybrid") {
      // Hybrid mode: randomly choose between normal and strange
      const hybridChance = game.settings.get("dynamic-weather", "hybridChance");
      const roll = Math.random() * 100;

      if (roll < hybridChance) {
        // Roll strange weather
        if (
          !this.strangeWeatherRollTableIds ||
          this.strangeWeatherRollTableIds.length === 0
        ) {
          console.warn(
            "Dynamic Weather: No strange weather rolltables configured for hybrid mode"
          );
          tableToUse = this.rollTableId;
          weatherType = "normal";
        } else {
          // Randomly pick one of the selected strange tables
          tableToUse =
            this.strangeWeatherRollTableIds[
              Math.floor(Math.random() * this.strangeWeatherRollTableIds.length)
            ];
          weatherType = "strange";
        }
      } else {
        // Roll normal weather
        if (!this.rollTableId) {
          console.warn(
            "Dynamic Weather: No normal weather rolltable configured"
          );
          return;
        }
        tableToUse = this.rollTableId;
        weatherType = "normal";
      }
    }

    const rollTable = game.tables.get(tableToUse);
    if (!rollTable) {
      console.warn(`Dynamic Weather: Rolltable ${tableToUse} not found`);
      return;
    }

    try {
      const roll = await rollTable.roll();
      const result = roll.results[0];

      if (result) {
        const newPattern = this.parseWeatherFromResult(result, weatherType);
        const duration =
          game.settings.get("dynamic-weather", "transitionDuration") * 60000;

        this.transitionManager.startTransition(newPattern, duration);
        this.lastRoll = Date.now();

        await this.saveState();

        // Notify users
        if (game.settings.get("dynamic-weather", "announceWeather")) {
          const typeLabel =
            weatherType === "strange"
              ? " <span class='strange-weather-badge'>Strange</span>"
              : "";

          // Only show description if it's different from the name and not empty
          const showDescription =
            newPattern.description &&
            newPattern.description !== newPattern.name &&
            newPattern.description.trim() !== "";
          const descriptionHtml = showDescription
            ? `<p><em>${newPattern.description}</em></p>`
            : "";

          ChatMessage.create({
            content: `<div class="dynamic-weather-announcement ${weatherType}-weather">
                            <h3>Weather Change${typeLabel}</h3>
                            <p>The weather is transitioning to: <strong>${newPattern.name}</strong></p>
                            ${descriptionHtml}
                        </div>`,
            whisper: game.settings.get("dynamic-weather", "whisperToGM")
              ? [game.user.id]
              : []
          });
        }

        Hooks.callAll("dynamicWeatherRolled", newPattern, result, weatherType);
      }
    } catch (error) {
      console.error("Dynamic Weather: Error rolling weather:", error);
    }
  }

  /**
   * Parse weather data from a rolltable result
   * Expects results to have specific text format or flags
   */
  parseWeatherFromResult(result, weatherType = "normal") {
    // Get the name from the table result
    const text = result.text || result.name || "";
    const name = text.split("\n")[0] || result.text || result.name || "Unknown";

    // Try to get weather data from flags first
    const weatherData = result.flags?.["dynamic-weather"];

    if (weatherData) {
      // Create a copy without name/description from flags (those come from table result only)
      const { name: _, description: __, ...cleanWeatherData } = weatherData;

      return new WeatherPattern({
        ...cleanWeatherData,
        name: name,
        description: text,
        weatherType
      });
    }

    // Parse from text description
    // v13: TableResult uses 'text' property directly

    // Default pattern based on name keywords
    const pattern = new WeatherPattern({
      name: name,
      description: text,
      weatherType: weatherType
    });

    // Simple keyword-based attribute assignment
    const lowerText = text.toLowerCase();

    if (lowerText.includes("rain") || lowerText.includes("storm")) {
      pattern.precipitation = 70;
      pattern.cloudCover = 80;
      pattern.visibility = 60;
    }

    if (lowerText.includes("heavy") || lowerText.includes("severe")) {
      pattern.intensity = 80;
      pattern.windSpeed = 40;
    }

    if (lowerText.includes("cloud")) {
      pattern.cloudCover = 60;
    }

    if (lowerText.includes("clear") || lowerText.includes("sunny")) {
      pattern.cloudCover = 10;
      pattern.visibility = 100;
    }

    if (lowerText.includes("fog")) {
      pattern.visibility = 30;
      pattern.cloudCover = 90;
    }

    if (lowerText.includes("snow")) {
      pattern.precipitation = 60;
      pattern.temperature = -2;
      pattern.cloudCover = 70;
    }

    if (lowerText.includes("wind")) {
      pattern.windSpeed = 35;
    }

    return pattern;
  }

  /**
   * Set the rolltable to use for weather generation
   */
  setRollTable(tableId) {
    this.rollTableId = tableId;
    game.settings.set("dynamic-weather", "rollTableId", tableId);
  }

  /**
   * Set the rolltables to use for strange weather generation
   */
  setStrangeRollTables(tableIds) {
    this.strangeWeatherRollTableIds = tableIds || [];
    game.settings.set(
      "dynamic-weather",
      "strangeWeatherRollTableIds",
      tableIds
    );
  }

  /**
   * Set how often to roll for new weather (in milliseconds)
   */
  setUpdateFrequency(frequency) {
    this.updateFrequency = frequency;
    // Don't save to settings - the setting stores hours, not milliseconds
    // The frequency is saved in systemState instead
  }

  /**
   * Get the current weather state
   */
  getCurrentWeather() {
    return this.transitionManager.getCurrentState();
  }

  /**
   * Manually trigger a weather roll
   */
  async forceRoll() {
    this.lastRoll = 0; // Reset timer
    await this.rollWeather();
  }

  /**
   * Clear all saved weather state and force a fresh roll
   */
  async clearWeatherState() {
    console.log("Dynamic Weather: Clearing saved weather state");
    this.transitionManager.currentPattern = null;
    this.transitionManager.targetPattern = null;
    this.transitionManager.transitionProgress = 0;
    this.lastRoll = 0;
    await this.saveState();
    await this.rollWeather();
    console.log("Dynamic Weather: State cleared and new weather rolled");
  }

  /**
   * Save current state to settings
   */
  async saveState() {
    // Strip name and description from patterns - they should come from table results, not saved state
    const stripNameAndDescription = pattern => {
      if (!pattern) return null;
      const { name, description, ...rest } = pattern;
      return rest;
    };

    const state = {
      currentPattern: stripNameAndDescription(
        this.transitionManager.currentPattern?.toObject()
      ),
      targetPattern: stripNameAndDescription(
        this.transitionManager.targetPattern?.toObject()
      ),
      transitionProgress: this.transitionManager.transitionProgress,
      transitionDuration: this.transitionManager.transitionDuration,
      transitionStartTime: this.transitionManager.transitionStartTime,
      lastRoll: this.lastRoll,
      rollTableId: this.rollTableId,
      strangeWeatherRollTableIds: this.strangeWeatherRollTableIds
      // Don't save updateFrequency - it comes from settings, not state
    };

    await game.settings.set("dynamic-weather", "systemState", state);
  }

  /**
   * Load state from settings
   */
  async loadState() {
    try {
      const state = game.settings.get("dynamic-weather", "systemState");

      // Check if saved state has the old bug (name in currentPattern)
      // If so, clear everything and start fresh
      if (state.currentPattern?.name || state.targetPattern?.name) {
        console.log(
          "Dynamic Weather: Detected old saved state with stale weather names. Clearing and starting fresh."
        );
        this.transitionManager.currentPattern = null;
        this.transitionManager.targetPattern = null;
        this.transitionManager.transitionProgress = 0;
        this.lastRoll = 0; // Force immediate roll
      } else {
        // Load clean state (no names in saved patterns)
        if (state.currentPattern) {
          this.transitionManager.currentPattern = new WeatherPattern(
            state.currentPattern
          );
        }

        if (state.targetPattern) {
          this.transitionManager.targetPattern = new WeatherPattern(
            state.targetPattern
          );

          // Restore transition timing information
          this.transitionManager.transitionDuration =
            state.transitionDuration || 300000;
          this.transitionManager.transitionStartTime =
            state.transitionStartTime || null;

          // Recalculate progress based on elapsed time since transition started
          if (this.transitionManager.transitionStartTime) {
            const elapsed =
              Date.now() - this.transitionManager.transitionStartTime;
            const calculatedProgress = Math.min(
              1,
              elapsed / this.transitionManager.transitionDuration
            );
            this.transitionManager.transitionProgress = calculatedProgress;

            // If transition is complete, finalize it
            if (calculatedProgress >= 1) {
              this.transitionManager.currentPattern =
                this.transitionManager.targetPattern;
              this.transitionManager.targetPattern = null;
              this.transitionManager.transitionProgress = 0;
              this.transitionManager.transitionStartTime = null;
            }
          } else {
            // Fallback to saved progress if no start time
            this.transitionManager.transitionProgress =
              state.transitionProgress || 0;
          }

          this.transitionManager.lastUpdate = Date.now();
        }

        this.lastRoll = state.lastRoll || Date.now();
      }
      this.rollTableId =
        state.rollTableId ||
        game.settings.get("dynamic-weather", "rollTableId");
      this.strangeWeatherRollTableIds =
        state.strangeWeatherRollTableIds ||
        game.settings.get("dynamic-weather", "strangeWeatherRollTableIds") ||
        [];

      // Debug logging for table configuration
      const normalTable = game.tables.get(this.rollTableId);

      // ALWAYS read updateFrequency from settings and convert to ms
      // Don't use saved state value as it may be corrupted from old bug
      const updateFrequencyValue = game.settings.get(
        "dynamic-weather",
        "updateFrequency"
      );
      const updateFrequencyUnit = game.settings.get(
        "dynamic-weather",
        "frequencyUnit"
      );
      this.updateFrequency = convertFrequencyToMs(
        updateFrequencyValue,
        updateFrequencyUnit
      );
    } catch (error) {
      console.warn("Dynamic Weather: No saved state found, starting fresh");
      // Initialize with current time to prevent immediate roll
      this.lastRoll = Date.now();
      // Convert default setting to milliseconds
      const updateFrequencyValue = game.settings.get(
        "dynamic-weather",
        "updateFrequency"
      );
      const updateFrequencyUnit = game.settings.get(
        "dynamic-weather",
        "frequencyUnit"
      );
      this.updateFrequency = convertFrequencyToMs(
        updateFrequencyValue,
        updateFrequencyUnit
      );
    }
  }

  /**
   * Stop the weather system
   */
  stop() {
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Global instance
let weatherSystem = null;

// Hook initialization
Hooks.once("init", () => {
  console.log("Dynamic Weather: Module initializing");

  // Register settings
  game.settings.register("dynamic-weather", "weatherMode", {
    name: "Weather Mode",
    hint: "Choose between normal weather, strange/magical weather, or a hybrid of both",
    scope: "world",
    config: false,
    type: String,
    choices: {
      normal: "Normal Weather Only",
      strange: "Strange Weather Only",
      hybrid: "Hybrid (Mix of Both)"
    },
    default: "normal"
  });

  game.settings.register("dynamic-weather", "rollTableId", {
    name: "Normal Weather RollTable",
    hint: "Select the rolltable to use for generating normal weather patterns",
    scope: "world",
    config: false,
    type: String,
    default: "",
    onChange: value => {
      if (weatherSystem) {
        weatherSystem.setRollTable(value);
      }
    }
  });

  game.settings.register("dynamic-weather", "strangeWeatherRollTableIds", {
    name: "Strange Weather RollTables",
    hint: "Select the rolltables for strange/magical weather (used in Strange or Hybrid mode)",
    scope: "world",
    config: false,
    type: Array,
    default: [],
    onChange: value => {
      if (weatherSystem) {
        weatherSystem.setStrangeRollTables(value);
      }
    }
  });

  game.settings.register("dynamic-weather", "hybridChance", {
    name: "Hybrid Mode: Strange Weather Chance (%)",
    hint: "In hybrid mode, the percentage chance of rolling strange weather instead of normal",
    scope: "world",
    config: false,
    type: Number,
    range: {
      min: 0,
      max: 100,
      step: 5
    },
    default: 25
  });

  game.settings.register("dynamic-weather", "updateFrequency", {
    name: "Weather Update Frequency",
    hint: "How often to roll for new weather",
    scope: "world",
    config: true,
    type: Number,
    default: 4,
    onChange: value => {
      if (weatherSystem) {
        const unit = game.settings.get("dynamic-weather", "frequencyUnit");
        const ms = convertFrequencyToMs(value, unit);
        weatherSystem.setUpdateFrequency(ms);
      }
    }
  });

  game.settings.register("dynamic-weather", "frequencyUnit", {
    name: "Frequency Unit",
    hint: "Time unit for weather update frequency",
    scope: "world",
    config: true,
    type: String,
    choices: {
      minutes: "Minutes",
      hours: "Hours",
      days: "Days"
    },
    default: "hours",
    onChange: unit => {
      if (weatherSystem) {
        const value = game.settings.get("dynamic-weather", "updateFrequency");
        const ms = convertFrequencyToMs(value, unit);
        weatherSystem.setUpdateFrequency(ms);
      }
    }
  });

  game.settings.register("dynamic-weather", "transitionDuration", {
    name: "Base Transition Duration (minutes)",
    hint: "How long weather transitions take (actual duration varies based on pattern compatibility)",
    scope: "world",
    config: true,
    type: Number,
    default: 60,
    range: {
      min: 1,
      max: 240,
      step: 1
    }
  });

  game.settings.register("dynamic-weather", "announceWeather", {
    name: "Announce Weather Changes",
    hint: "Post a chat message when weather changes",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("dynamic-weather", "whisperToGM", {
    name: "Whisper Weather to GM Only",
    hint: "Only show weather announcements to the GM",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register("dynamic-weather", "temperatureUnit", {
    name: "Temperature Unit",
    hint: "Choose the unit for displaying temperature",
    scope: "client",
    config: true,
    type: String,
    choices: {
      celsius: "Celsius (°C)",
      fahrenheit: "Fahrenheit (°F)",
      kelvin: "Kelvin (K)"
    },
    default: "celsius"
  });

  game.settings.register("dynamic-weather", "systemState", {
    name: "System State",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Create API
  // Temperature conversion utilities
  const temperatureUtils = {
    /**
     * Convert Celsius to Fahrenheit
     */
    celsiusToFahrenheit(celsius) {
      return (celsius * 9) / 5 + 32;
    },

    /**
     * Convert Celsius to Kelvin
     */
    celsiusToKelvin(celsius) {
      return celsius + 273.15;
    },

    /**
     * Convert temperature from Celsius to the specified unit
     */
    convertTemperature(celsius, unit) {
      switch (unit) {
        case "fahrenheit":
          return this.celsiusToFahrenheit(celsius);
        case "kelvin":
          return this.celsiusToKelvin(celsius);
        case "celsius":
        default:
          return celsius;
      }
    },

    /**
     * Get the unit symbol for display
     */
    getUnitSymbol(unit) {
      switch (unit) {
        case "fahrenheit":
          return "°F";
        case "kelvin":
          return "K";
        case "celsius":
        default:
          return "°C";
      }
    },

    /**
     * Format temperature for display
     */
    formatTemperature(celsius, unit, decimals = 1) {
      const converted = this.convertTemperature(celsius, unit);
      const symbol = this.getUnitSymbol(unit);
      return `${converted.toFixed(decimals)}${symbol}`;
    }
  };

  // Create API
  game.modules.get("dynamic-weather").api = {
    WeatherPattern,
    WeatherTransitionManager,
    DynamicWeatherSystem,
    getWeatherSystem: () => weatherSystem,
    getCurrentWeather: () => weatherSystem?.getCurrentWeather(),
    rollWeather: () => weatherSystem?.forceRoll(),
    clearWeatherState: () => weatherSystem?.clearWeatherState(),
    temperatureUtils: temperatureUtils
  };

  console.log(
    "Dynamic Weather: API available at game.modules.get('dynamic-weather').api"
  );
});

// Add scene control button for weather control
Hooks.on("getSceneControlButtons", controls => {
  // Only show to GMs
  if (!game.user?.isGM) return;

  // Create a new weather control group
  controls.weather = {
    name: "weather",
    title: "Weather Controls",
    icon: "fas fa-cloud-bolt-sun",
    tools: {
      weatherControl: {
        name: "weatherControl",
        title: "Weather Control Panel",
        icon: "fas fa-cloud-sun",
        visible: true,
        button: true,
        onClick: () => {
          new WeatherControlDialog().render(true);
        }
      }
    }
  };
});

/**
 * Add custom weather tab to Roll Table Result configuration
 */
Hooks.on("renderTableResultConfig", (app, html, data) => {
  // Add Weather tab to the nav
  const nav = html.find('nav.sheet-tabs[data-group="main"]');
  if (nav.length) {
    nav.append(`
      <a class="item" data-tab="weather">
        <i class="fas fa-cloud-sun"></i> Weather
      </a>
    `);
  }

  // Get current weather data from flags
  const weatherData = app.document.flags?.["dynamic-weather"] || {};

  // Create the weather tab content
  const weatherTab = $(`
    <div class="tab" data-tab="weather" data-group="main">
      <p class="hint">Configure weather attributes for this roll table result. These values control the weather pattern generated when this result is rolled.</p>
      
      <div class="form-group">
        <label>Temperature (°C)</label>
        <div class="form-fields">
          <input type="number" name="flags.dynamic-weather.temperature" value="${weatherData.temperature ?? 20}" step="1" />
          <p class="notes">Base temperature in Celsius (-40 to 50)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Cloud Cover (%)</label>
        <div class="form-fields">
          <input type="range" name="flags.dynamic-weather.cloudCover" value="${weatherData.cloudCover ?? 0}" min="0" max="100" step="5" />
          <span class="range-value">${weatherData.cloudCover ?? 0}%</span>
          <p class="notes">Percentage of sky covered by clouds (0-100)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Precipitation (%)</label>
        <div class="form-fields">
          <input type="range" name="flags.dynamic-weather.precipitation" value="${weatherData.precipitation ?? 0}" min="0" max="100" step="5" />
          <span class="range-value">${weatherData.precipitation ?? 0}%</span>
          <p class="notes">Amount of rain, snow, or other precipitation (0-100)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Wind Speed (km/h)</label>
        <div class="form-fields">
          <input type="number" name="flags.dynamic-weather.windSpeed" value="${weatherData.windSpeed ?? 0}" min="0" max="100" step="1" />
          <p class="notes">Wind speed in kilometers per hour (0-100)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Visibility (%)</label>
        <div class="form-fields">
          <input type="range" name="flags.dynamic-weather.visibility" value="${weatherData.visibility ?? 100}" min="0" max="100" step="5" />
          <span class="range-value">${weatherData.visibility ?? 100}%</span>
          <p class="notes">How far you can see (0-100, where 100 is clear)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Intensity</label>
        <div class="form-fields">
          <input type="range" name="flags.dynamic-weather.intensity" value="${weatherData.intensity ?? 0}" min="0" max="100" step="5" />
          <span class="range-value">${weatherData.intensity ?? 0}</span>
          <p class="notes">Overall intensity of the weather pattern (0-100)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Weather Type</label>
        <div class="form-fields">
          <select name="flags.dynamic-weather.weatherType">
            <option value="normal" ${(weatherData.weatherType ?? "normal") === "normal" ? "selected" : ""}>Normal</option>
            <option value="strange" ${weatherData.weatherType === "strange" ? "selected" : ""}>Strange/Magical</option>
          </select>
          <p class="notes">Type of weather (affects special effects)</p>
        </div>
      </div>
    </div>
  `);

  // Append the tab content
  html.find(".sheet-body").append(weatherTab);

  // Update range value displays when sliders change
  html.find('input[type="range"]').on("input", function () {
    $(this)
      .siblings(".range-value")
      .text(
        $(this).val() +
          ($(this).attr("name").includes("visibility") ||
          $(this).attr("name").includes("precipitation") ||
          $(this).attr("name").includes("cloudCover")
            ? "%"
            : "")
      );
  });

  // Adjust height to fit content
  app.setPosition({ height: "auto" });
});

Hooks.once("ready", async () => {
  console.log("Dynamic Weather: Module ready");

  // Initialize weather system if GM
  if (game.user.isGM) {
    weatherSystem = new DynamicWeatherSystem();
    await weatherSystem.initialize();
  }
});

/**
 * Weather Control Dialog
 */
class WeatherControlDialog extends foundry.applications.api.ApplicationV2 {
  constructor(options = {}) {
    super(options);
    this.vueApp = null;
  }

  static DEFAULT_OPTIONS = {
    id: "dynamic-weather-control",
    classes: ["dynamic-weather-dialog"],
    tag: "div",
    window: {
      frame: true,
      positioned: true,
      title: "Dynamic Weather Control",
      icon: "fas fa-cloud-bolt-sun",
      controls: [],
      minimizable: true,
      resizable: true
    },
    position: {
      width: 500,
      height: 600,
      top: 100,
      left: 200
    }
  };

  static PARTS = {
    content: {
      id: "content",
      template: ""
    }
  };

  /**
   * Render the application HTML
   */
  async _renderHTML(_context, options) {
    const rendered = {};
    // Return the Vue component to be rendered
    rendered.content = WeatherControl;
    return rendered;
  }

  /**
   * Replace the HTML content in the application
   */
  _replaceHTML(result, content, _options) {
    // Check if the Vue Instance exists, if not create it
    if (!this.vueApp) {
      const Instance = this;

      // Create Vue app with the component and props
      this.vueApp = createApp({
        render: () =>
          Object.entries(result).map(([key, component]) =>
            h("div", { "data-application-part": key }, [
              h(component, { weatherSystem: weatherSystem })
            ])
          )
      });

      // Add mixin for auto-height
      this.vueApp.mixin({
        updated() {
          if (Instance?.options?.position?.height === "auto") {
            Instance.setPosition({ height: "auto" });
          }
          Instance.render();
        }
      });

      // Mount the Vue app to content (not this.element)
      this.vueApp.mount(content);
    }
  }

  async close(options = {}) {
    if (this.vueApp) {
      this.vueApp.unmount();
      this.vueApp = null;
    }
    return super.close(options);
  }
}

// Export for other modules
export { WeatherPattern, WeatherTransitionManager, DynamicWeatherSystem };
