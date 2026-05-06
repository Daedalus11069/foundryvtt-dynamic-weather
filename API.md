# Dynamic Weather Patterns API Documentation

This document describes the API for developers who want to integrate with or extend the Dynamic Weather Patterns module.

## Table of Contents

- [Accessing the API](#accessing-the-api)
- [Classes](#classes)
- [Hooks](#hooks)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)

## Accessing the API

The module exposes its API through the module object:

```javascript
const weatherAPI = game.modules.get("dynamic-weather").api;
```

### API Methods

#### `getCurrentWeather()`

Returns the current weather pattern.

```javascript
const weather = weatherAPI.getCurrentWeather();
console.log(weather.name); // "Heavy Rain"
console.log(weather.temperature); // 12
console.log(weather.precipitation); // 85
```

Returns: `WeatherPattern` or `null`

#### `rollWeather()`

Manually triggers a new weather roll.

```javascript
await weatherAPI.rollWeather();
```

Returns: `Promise<void>`

#### `getWeatherSystem()`

Returns the main weather system instance.

```javascript
const system = weatherAPI.getWeatherSystem();
console.log(system.isActive); // true
console.log(system.rollTableId); // "abc123"
```

Returns: `DynamicWeatherSystem`

---

## Classes

### WeatherPattern

Represents a single weather state.

#### Constructor

```javascript
const pattern = new WeatherPattern({
  name: "Thunderstorm",
  description: "A fierce storm with lightning",
  temperature: 15,
  cloudCover: 95,
  precipitation: 80,
  windSpeed: 45,
  visibility: 40,
  intensity: 75
});
```

#### Properties

| Property        | Type   | Range     | Description                  |
| --------------- | ------ | --------- | ---------------------------- |
| `id`            | String | -         | Unique identifier            |
| `name`          | String | -         | Display name                 |
| `description`   | String | -         | Detailed description         |
| `temperature`   | Number | -50 to 50 | Temperature in Celsius       |
| `cloudCover`    | Number | 0-100     | Cloud coverage percentage    |
| `precipitation` | Number | 0-100     | Rain/snow intensity          |
| `windSpeed`     | Number | 0-150     | Wind speed in km/h           |
| `visibility`    | Number | 0-100     | Visibility percentage        |
| `intensity`     | Number | 0-100     | Overall severity             |
| `timestamp`     | Number | -         | Creation time (milliseconds) |

#### Methods

##### `compatibilityWith(otherPattern)`

Calculates how compatible this pattern is with another (0-1 scale).

```javascript
const clear = new WeatherPattern({ name: "Clear", temperature: 20 });
const storm = new WeatherPattern({ name: "Storm", temperature: 12 });

const compatibility = clear.compatibilityWith(storm);
console.log(compatibility); // 0.65 (moderately compatible)
```

Returns: `Number` (0-1)

##### `toObject()`

Converts the pattern to a plain object for serialization.

```javascript
const obj = pattern.toObject();
// { id: "...", name: "...", temperature: 20, ... }
```

Returns: `Object`

---

### WeatherTransitionManager

Manages smooth transitions between weather patterns.

#### Properties

| Property             | Type           | Description                              |
| -------------------- | -------------- | ---------------------------------------- |
| `currentPattern`     | WeatherPattern | Current weather state                    |
| `targetPattern`      | WeatherPattern | Target weather state (during transition) |
| `transitionProgress` | Number         | Progress from 0 to 1                     |
| `transitionDuration` | Number         | Duration in milliseconds                 |

#### Methods

##### `startTransition(targetPattern, duration)`

Begins a transition to a new weather pattern.

```javascript
const newPattern = new WeatherPattern({ name: "Rain" });
transitionManager.startTransition(newPattern, 3600000); // 1 hour
```

Parameters:

- `targetPattern` (WeatherPattern): Weather to transition to
- `duration` (Number, optional): Duration in milliseconds

Returns: `void`

##### `update()`

Updates the transition state. Call this periodically.

```javascript
const complete = transitionManager.update();
if (complete) {
  console.log("Transition finished!");
}
```

Returns: `Boolean` - true if transition just completed

##### `getCurrentState()`

Gets the current interpolated weather state.

```javascript
const current = transitionManager.getCurrentState();
// Returns blended state if transitioning, or current pattern if stable
```

Returns: `WeatherPattern`

##### `isTransitioning()`

Checks if a transition is in progress.

```javascript
if (transitionManager.isTransitioning()) {
  console.log("Weather is changing...");
}
```

Returns: `Boolean`

##### `getProgress()`

Gets the current transition progress (0-1).

```javascript
const progress = transitionManager.getProgress();
console.log(`${Math.round(progress * 100)}% complete`);
```

Returns: `Number` (0-1)

---

### DynamicWeatherSystem

Main system controller.

#### Properties

| Property            | Type                     | Description               |
| ------------------- | ------------------------ | ------------------------- |
| `transitionManager` | WeatherTransitionManager | Manages transitions       |
| `rollTableId`       | String                   | ID of active rolltable    |
| `updateFrequency`   | Number                   | Time between rolls (ms)   |
| `isActive`          | Boolean                  | Whether system is running |

#### Methods

##### `initialize()`

Initializes the weather system (called automatically).

```javascript
await weatherSystem.initialize();
```

Returns: `Promise<void>`

##### `setRollTable(tableId)`

Sets the rolltable to use for weather generation.

```javascript
weatherSystem.setRollTable("abc123def456");
```

Parameters:

- `tableId` (String): RollTable ID

Returns: `void`

##### `setUpdateFrequency(frequency)`

Sets how often to roll for new weather.

```javascript
weatherSystem.setUpdateFrequency(7200000); // 2 hours
```

Parameters:

- `frequency` (Number): Frequency in milliseconds

Returns: `void`

##### `getCurrentWeather()`

Gets the current weather pattern.

```javascript
const weather = weatherSystem.getCurrentWeather();
```

Returns: `WeatherPattern`

##### `forceRoll()`

Immediately rolls for new weather.

```javascript
await weatherSystem.forceRoll();
```

Returns: `Promise<void>`

##### `stop()`

Stops the weather system.

```javascript
weatherSystem.stop();
```

Returns: `void`

---

## Hooks

The module fires several hooks you can listen to.

### `dynamicWeatherUpdate`

Fires every second with the current weather state.

```javascript
Hooks.on("dynamicWeatherUpdate", weatherPattern => {
  console.log(`Current: ${weatherPattern.name}`);
  console.log(`Temp: ${weatherPattern.temperature}°C`);

  // Update your UI, effects, etc.
  updateSceneLighting(weatherPattern);
});
```

Parameters:

- `weatherPattern` (WeatherPattern): Current weather state

### `dynamicWeatherRolled`

Fires when a new weather pattern is rolled from the table.

```javascript
Hooks.on("dynamicWeatherRolled", (weatherPattern, rollTableResult) => {
  console.log(`Rolled: ${weatherPattern.name}`);
  console.log(`From result: ${rollTableResult.text}`);

  // Trigger special effects, sounds, etc.
  playWeatherSound(weatherPattern);
});
```

Parameters:

- `weatherPattern` (WeatherPattern): New weather pattern
- `rollTableResult` (TableResult): Foundry rolltable result

### `dynamicWeatherTransitionComplete`

Fires when a weather transition finishes.

```javascript
Hooks.on("dynamicWeatherTransitionComplete", weatherPattern => {
  console.log(`Transition complete: ${weatherPattern.name}`);

  // Apply final effects
  applyWeatherEffects(weatherPattern);
});
```

Parameters:

- `weatherPattern` (WeatherPattern): Final weather state

---

## Examples

### Example 1: Display Weather Widget

Create a persistent weather display:

```javascript
class WeatherWidget extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "weather-widget",
      template: "path/to/template.html",
      popOut: false
    });
  }

  getData() {
    const weather = game.modules
      .get("dynamic-weather")
      .api.getCurrentWeather();
    return { weather };
  }
}

const widget = new WeatherWidget();
widget.render(true);

// Update on weather changes
Hooks.on("dynamicWeatherUpdate", () => {
  widget.render();
});
```

### Example 2: Weather-Based Scene Effects

Adjust scene lighting based on weather:

```javascript
Hooks.on("dynamicWeatherUpdate", weather => {
  if (!canvas.ready) return;

  // Adjust ambient light based on cloud cover
  const darkness = weather.cloudCover / 200; // 0-0.5
  canvas.scene.update({ darkness });

  // Add fog based on visibility
  if (weather.visibility < 50) {
    canvas.scene.update({
      fogOverlay: "path/to/fog.png",
      fogOpacity: 1 - weather.visibility / 100
    });
  }
});
```

### Example 3: Weather-Based Token Effects

Apply conditions to tokens based on weather:

```javascript
Hooks.on("dynamicWeatherTransitionComplete", async weather => {
  // Apply effects in severe weather
  if (weather.intensity > 70) {
    for (let token of canvas.tokens.placeables) {
      if (!token.actor) continue;

      // Add a "Storm-Battered" condition
      await token.actor.createEmbeddedDocuments("ActiveEffect", [
        {
          label: "Storm-Battered",
          icon: "icons/weather/storm.png",
          changes: [
            {
              key: "system.attributes.movement.walk",
              mode: 2,
              value: "-10"
            }
          ],
          duration: { seconds: 3600 }
        }
      ]);
    }
  }
});
```

### Example 4: Weather-Dependent Encounters

Spawn encounters based on weather:

```javascript
Hooks.on("dynamicWeatherRolled", async weather => {
  // Fog brings mysterious encounters
  if (weather.name.toLowerCase().includes("fog")) {
    const table = game.tables.getName("Fog Encounters");
    if (table) {
      const result = await table.roll();
      ChatMessage.create({
        content: `The fog brings something unexpected: ${result.results[0].text}`
      });
    }
  }
});
```

### Example 5: Custom Weather Pattern

Create and apply a custom weather pattern:

```javascript
const weatherAPI = game.modules.get("dynamic-weather").api;
const system = weatherAPI.getWeatherSystem();

// Create a magical weather pattern
const arcaneMist = new weatherAPI.WeatherPattern({
  name: "Arcane Mist",
  description: "Shimmering magical energies fill the air",
  temperature: 18,
  cloudCover: 60,
  precipitation: 20,
  windSpeed: 5,
  visibility: 40,
  intensity: 45
});

// Apply it immediately
system.transitionManager.startTransition(arcaneMist, 1800000); // 30 min
```

### Example 6: Weather Forecast

Predict upcoming weather:

```javascript
async function forecastWeather(hoursAhead = 4) {
  const system = game.modules
    .get("dynamic-weather")
    .api.getWeatherSystem();

  const table = game.tables.get(system.rollTableId);
  if (!table) return null;

  // Simulate future rolls
  const roll = await table.roll();
  return system.parseWeatherFromResult(roll.results[0]);
}

// Use it
const forecast = await forecastWeather();
console.log(`Forecast: ${forecast.name}`);
```

### Example 7: Weather-Based Skill Checks

Modify skill checks based on weather:

```javascript
Hooks.on("preRollSkillCheck", (actor, skillData) => {
  const weather = game.modules
    .get("dynamic-weather")
    .api.getCurrentWeather();

  // Perception checks harder in fog/rain
  if (skillData.name === "Perception") {
    if (weather.visibility < 50) {
      skillData.modifier -= 2;
      ui.notifications.info("Poor visibility affects perception!");
    }
  }

  // Athletics harder in storms
  if (skillData.name === "Athletics") {
    if (weather.intensity > 70) {
      skillData.modifier -= 1;
      ui.notifications.info("The storm makes movement difficult!");
    }
  }
});
```

---

## Advanced Usage

### Creating Custom Rolltable Parsers

Override the default parsing logic:

```javascript
const originalParse = DynamicWeatherSystem.prototype.parseWeatherFromResult;

DynamicWeatherSystem.prototype.parseWeatherFromResult = function (result) {
  // Try your custom parsing first
  const customData = result.flags?.["my-module"]?.weather;
  if (customData) {
    return new WeatherPattern(customData);
  }

  // Fall back to default
  return originalParse.call(this, result);
};
```

### Extending WeatherPattern

Add custom properties to weather patterns:

```javascript
class ExtendedWeatherPattern extends WeatherPattern {
  constructor(data) {
    super(data);
    this.humidity = data.humidity || 50;
    this.pressure = data.pressure || 1013;
    this.uvIndex = data.uvIndex || 5;
  }

  toObject() {
    return {
      ...super.toObject(),
      humidity: this.humidity,
      pressure: this.pressure,
      uvIndex: this.uvIndex
    };
  }
}

// Use it
const weather = new ExtendedWeatherPattern({
  name: "Sunny",
  humidity: 30,
  uvIndex: 9
});
```

### Weather Zones

Create different weather for different regions:

```javascript
class WeatherZoneManager {
  constructor() {
    this.zones = new Map();
  }

  registerZone(zoneId, rollTableId) {
    const system = new DynamicWeatherSystem();
    system.setRollTable(rollTableId);
    system.initialize();
    this.zones.set(zoneId, system);
  }

  getWeatherForZone(zoneId) {
    return this.zones.get(zoneId)?.getCurrentWeather();
  }
}

// Use it
const zoneManager = new WeatherZoneManager();
zoneManager.registerZone("desert", "desert-weather-table-id");
zoneManager.registerZone("forest", "forest-weather-table-id");
```

### Seasonal Weather System

Automatically switch tables based on season:

```javascript
class SeasonalWeatherSystem {
  constructor() {
    this.seasons = {
      spring: "spring-weather-table-id",
      summer: "summer-weather-table-id",
      autumn: "autumn-weather-table-id",
      winter: "winter-weather-table-id"
    };
    this.currentSeason = "spring";
  }

  setSeason(season) {
    this.currentSeason = season;
    const tableId = this.seasons[season];
    const system = game.modules
      .get("dynamic-weather")
      .api.getWeatherSystem();
    system.setRollTable(tableId);
    system.forceRoll();
  }
}
```

---

## Best Practices

1. **Listen to Hooks**: Use hooks rather than polling for efficiency
2. **Check null**: Always check if weather exists before accessing properties
3. **Cache References**: Cache the API reference instead of repeatedly accessing it
4. **Use Transitions**: Let the transition system handle changes smoothly
5. **Test Compatibility**: Ensure your code works with and without the module
6. **Document Integration**: Tell users how your module works with weather

## Troubleshooting

**Weather is null:**

```javascript
const weather = weatherAPI.getCurrentWeather();
if (!weather) {
  console.log("No weather active yet");
  return;
}
```

**Hook not firing:**

```javascript
// Make sure hook is registered after module is ready
Hooks.once("ready", () => {
  Hooks.on("dynamicWeatherUpdate", handleWeather);
});
```

**Module not found:**

```javascript
const module = game.modules.get("dynamic-weather");
if (!module?.active) {
  console.log("Dynamic Weather module not active");
  return;
}
```

---

## Support

For questions about the API or integration help:

- Check the examples above
- Review the source code
- Ask in [Discord/Forum]
- Open an issue on [GitHub]

Happy integrating! 🌦️
