<template>
  <div class="dynamic-weather-control">
    <div class="current-weather">
      <template v-if="weather">
        <h2>
          Current Weather: {{ weatherName }}
          <span
            v-if="weather.weatherType === 'strange'"
            class="strange-weather-badge"
            title="Strange Weather"
            >✨</span
          >
        </h2>
        <div class="weather-details">
          <div class="weather-stat">
            <label>Temperature:</label>
            <span>{{ weather.temperature }}{{ weather.temperatureUnit }}</span>
          </div>
          <div class="weather-stat">
            <label>Cloud Cover:</label>
            <span>{{ weather.cloudCover }}%</span>
          </div>
          <div class="weather-stat">
            <label>Precipitation:</label>
            <span>{{ weather.precipitation }}%</span>
          </div>
          <div class="weather-stat">
            <label>Wind Speed:</label>
            <span>{{ weather.windSpeed }} km/h</span>
          </div>
          <div class="weather-stat">
            <label>Visibility:</label>
            <span>{{ weather.visibility }}%</span>
          </div>
        </div>

        <div v-if="weather.description" class="weather-description">
          <p v-html="weather.description"></p>
        </div>

        <div v-if="isTransitioning" class="weather-transition">
          <p>Transitioning... {{ progress }}%</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <p>No weather pattern active. Roll for weather to begin.</p>
      </template>
    </div>

    <div class="weather-controls">
      <div class="form-group">
        <label for="weatherMode">Weather Mode:</label>
        <select
          v-model="localWeatherMode"
          name="weatherMode"
          @change="onWeatherModeChange"
        >
          <option value="normal">Normal Weather Only</option>
          <option value="strange">Strange Weather Only</option>
          <option value="hybrid">Hybrid (Mix of Both)</option>
        </select>
      </div>

      <div v-if="localWeatherMode !== 'strange'" class="form-group">
        <label for="rollTable">Normal Weather RollTable:</label>
        <select
          v-model="localRollTable"
          name="rollTable"
          @change="onRollTableChange"
        >
          <option value="">-- Select RollTable --</option>
          <option v-for="table in rollTables" :key="table.id" :value="table.id">
            {{ table.name }}
          </option>
        </select>
      </div>

      <div v-if="localWeatherMode !== 'normal'" class="form-group">
        <label>Strange Weather RollTables:</label>
        <div
          class="strange-tables-list"
          style="
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid var(--color-border-dark);
            padding: 0.5rem;
            border-radius: 3px;
          "
        >
          <label
            v-for="table in rollTables"
            :key="table.id"
            style="display: block; margin-bottom: 0.25rem"
          >
            <input
              type="checkbox"
              :value="table.id"
              :checked="localStrangeTables.includes(table.id)"
              @change="onStrangeTableToggle(table.id, $event)"
            />
            {{ table.name }}
          </label>
        </div>
      </div>

      <div v-if="localWeatherMode === 'hybrid'" class="form-group">
        <label for="hybridChance">
          Strange Weather Chance:
          <span class="hybrid-chance-value">{{ localHybridChance }}%</span>
        </label>
        <input
          type="range"
          v-model.number="localHybridChance"
          name="hybridChance"
          min="0"
          max="100"
          step="5"
          @change="onHybridChanceChange"
        />
      </div>

      <div class="form-group">
        <label for="updateFrequency">Weather Update Frequency:</label>
        <div style="display: flex; gap: 0.5rem">
          <input
            type="number"
            v-model.number="localUpdateFrequency"
            name="updateFrequency"
            :min="0.1"
            style="flex: 1"
            @change="onUpdateFrequencyChange"
          />
          <select
            v-model="localFrequencyUnit"
            name="frequencyUnit"
            style="flex: 1"
            @change="onFrequencyUnitChange"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      <div class="button-group">
        <button type="button" @click="onRollWeather">
          <i class="fas fa-dice"></i> Roll New Weather
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  weatherSystem: {
    type: Object,
    required: true
  }
});

// Reactive state
const weather = ref(null);
const isTransitioning = ref(false);
const progress = ref(0);
const rollTables = ref([]);
const localWeatherMode = ref("normal");
const localRollTable = ref("");
const localStrangeTables = ref([]);
const localHybridChance = ref(30);
const localUpdateFrequency = ref(1);
const localFrequencyUnit = ref("hours");

const weatherName = computed(() => {
  if (!weather.value?.name) return "";
  // Strip HTML tags from weather name
  const div = document.createElement("div");
  div.innerHTML = weather.value.name;
  return div.textContent || div.innerText || "";
});

// Update weather display data
function updateWeatherDisplay() {
  const currentWeather = props.weatherSystem?.getCurrentWeather();
  const temperatureUnit = game.settings.get(
    "dynamic-weather",
    "temperatureUnit"
  );

  if (currentWeather) {
    const tempUtils = game.modules.get("dynamic-weather").api.temperatureUtils;
    weather.value = {
      ...currentWeather,
      temperature: tempUtils
        .convertTemperature(currentWeather.temperature, temperatureUnit)
        .toFixed(1),
      temperatureUnit: tempUtils.getUnitSymbol(temperatureUnit),
      precipitation: Math.round(currentWeather.precipitation),
      visibility: Math.round(currentWeather.visibility),
      cloudCover: Math.round(currentWeather.cloudCover),
      windSpeed: Math.round(currentWeather.windSpeed)
    };
  } else {
    weather.value = null;
  }
}

// Update transition state (called frequently during transitions)
function updateTransitionState() {
  const isTransitioningValue =
    props.weatherSystem?.transitionManager.isTransitioning() || false;
  const rawProgress =
    (props.weatherSystem?.transitionManager.getProgress() || 0) * 100;
  // Show 1 decimal place for progress under 10%, otherwise whole number
  const progressValue =
    rawProgress < 10
      ? Math.round(rawProgress * 10) / 10
      : Math.round(rawProgress);

  console.log("WeatherControl: updateTransitionState", {
    isTransitioning: isTransitioningValue,
    progress: progressValue,
    rawProgress
  });

  isTransitioning.value = isTransitioningValue;
  progress.value = progressValue;
}

// Load initial data
function loadData() {
  updateWeatherDisplay();
  updateTransitionState();

  rollTables.value = game.tables.map(t => ({
    id: t.id,
    name: t.name
  }));

  localWeatherMode.value = game.settings.get("dynamic-weather", "weatherMode");
  localRollTable.value = props.weatherSystem?.rollTableId || "";
  localStrangeTables.value =
    props.weatherSystem?.strangeWeatherRollTableIds || [];
  localHybridChance.value = game.settings.get(
    "dynamic-weather",
    "hybridChance"
  );
  localUpdateFrequency.value = game.settings.get(
    "dynamic-weather",
    "updateFrequency"
  );
  localFrequencyUnit.value = game.settings.get(
    "dynamic-weather",
    "frequencyUnit"
  );
}

// Event handlers
async function onRollWeather() {
  await props.weatherSystem.forceRoll();
}

function onRollTableChange() {
  props.weatherSystem.setRollTable(localRollTable.value);
}

function onStrangeTableToggle(tableId, event) {
  if (event.target.checked) {
    if (!localStrangeTables.value.includes(tableId)) {
      localStrangeTables.value.push(tableId);
    }
  } else {
    localStrangeTables.value = localStrangeTables.value.filter(
      id => id !== tableId
    );
  }
  props.weatherSystem.setStrangeRollTables(localStrangeTables.value);
}

async function onWeatherModeChange() {
  await game.settings.set(
    "dynamic-weather",
    "weatherMode",
    localWeatherMode.value
  );
}

async function onHybridChanceChange() {
  await game.settings.set(
    "dynamic-weather",
    "hybridChance",
    localHybridChance.value
  );
}

async function onUpdateFrequencyChange() {
  if (localUpdateFrequency.value > 0) {
    await game.settings.set(
      "dynamic-weather",
      "updateFrequency",
      localUpdateFrequency.value
    );
  }
}

async function onFrequencyUnitChange() {
  await game.settings.set(
    "dynamic-weather",
    "frequencyUnit",
    localFrequencyUnit.value
  );
}

// Hook callbacks
function onWeatherUpdate() {
  console.log("WeatherControl: dynamicWeatherUpdate hook fired");
  // Update both transition state AND weather display to show interpolated values
  updateTransitionState();
  updateWeatherDisplay();
}

function onWeatherRolled() {
  console.log("WeatherControl: dynamicWeatherRolled hook fired");
  // Full update when new weather is rolled
  loadData();
}

function onTransitionComplete() {
  console.log("WeatherControl: dynamicWeatherTransitionComplete hook fired");
  // Full update when transition completes
  loadData();
}

// Lifecycle
onMounted(() => {
  loadData();

  // Register hooks
  Hooks.on("dynamicWeatherUpdate", onWeatherUpdate);
  Hooks.on("dynamicWeatherRolled", onWeatherRolled);
  Hooks.on("dynamicWeatherTransitionComplete", onTransitionComplete);
});

onUnmounted(() => {
  // Cleanup hooks
  Hooks.off("dynamicWeatherUpdate", onWeatherUpdate);
  Hooks.off("dynamicWeatherRolled", onWeatherRolled);
  Hooks.off("dynamicWeatherTransitionComplete", onTransitionComplete);
});
</script>

<style scoped>
.dynamic-weather-control {
  padding: 1rem;
}

.current-weather {
  margin-bottom: 1.5rem;
}

.current-weather h2 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strange-weather-badge {
  font-size: 1.2rem;
  cursor: help;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.weather-stat {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.weather-stat label {
  font-weight: bold;
  margin-right: 0.5rem;
}

.weather-description {
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.weather-transition {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9eff, #7ec8ff);
  transition: width 0.3s ease;
}

.weather-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.button-group button {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.hybrid-chance-value {
  float: right;
}

input[type="range"] {
  width: 100%;
}
</style>
