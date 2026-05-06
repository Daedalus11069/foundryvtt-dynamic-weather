# Dynamic Weather Patterns for Foundry VTT

A sophisticated weather system module that creates realistic, time-based weather pattern transitions using Foundry VTT's native rolltable system.

## Features

### 🌦️ **Realistic Weather Transitions**

- Smooth, gradual transitions between weather states
- Transition speed adapts based on weather pattern compatibility
- No sudden, jarring weather changes

### ✨ **Multiple Weather Modes**

- **Normal Mode**: Realistic, mundane weather only
- **Strange Mode**: Magical/unusual weather for fantasy settings
- **Hybrid Mode**: Dynamic mix of both with configurable probability
- Perfect for any campaign style from low to high fantasy

### 📊 **RollTable Integration**

- Uses Foundry VTT's native RollTable system
- Flexible: works with any rolltable structure
- Automatic parsing of weather attributes from table results
- Support for separate normal and strange weather tables

### ⏰ **Time-Based Evolution**

- Configurable update frequency (default: every 4 hours)
- Weather persists between sessions
- Continues to evolve even when you're not looking

### 🎛️ **Full GM Control**

- Easy-to-use control panel
- Manual weather rolls on demand
- Configurable transition speeds
- Weather mode switching on the fly
- Optional chat announcements

### 🔧 **Developer-Friendly API**

- Hooks for weather updates and transitions
- Programmatic weather control
- Integration with other modules

## Installation

### Method 1: Manifest URL

1. Open Foundry VTT
2. Go to "Add-on Modules" tab
3. Click "Install Module"
4. Paste this manifest URL: `[YOUR_MANIFEST_URL]`
5. Click "Install"

### Method 2: Manual Installation

1. Download the latest release
2. Extract to `Data/modules/dynamic-weather`
3. Restart Foundry VTT
4. Enable the module in your world

## Quick Start Guide

### Step 1: Import Weather Tables (Recommended)

The module includes two ready-to-use weather tables in the **Weather Tables** compendium:

1. **Standard Weather Patterns** - Realistic temperate climate weather (Clear, Rain, Fog, Snow, etc.)
2. **Strange Weather Patterns** - Magical/unusual weather for fantasy settings (Magic Storms, Blood Rain, Dimensional Rifts, etc.)

**To import:**

1. Open the **Compendium** tab
2. Find "Weather Tables" (Dynamic Weather module)
3. Drag a table into your RollTables sidebar

### Step 1 (Alternative): Create Your Own Weather RollTable

If you prefer custom weather, create a new RollTable in Foundry VTT:

1. Items Sidebar → RollTables → Create RollTable
2. Add weather patterns as table results
3. Each result should have:
   - A descriptive name (e.g., "Heavy Rain", "Clear Skies")
   - Optional description text
   - Optional weather attributes in flags (see Advanced Usage)

**Example Table Results:**

```
- Clear Skies (Description: "A beautiful sunny day with blue skies")
- Partly Cloudy (Description: "White puffy clouds drift across the sky")
- Overcast (Description: "Gray clouds cover the sky completely")
- Light Rain (Description: "A gentle drizzle falls from the clouds")
- Heavy Rain (Description: "Sheets of rain pour down from dark clouds")
- Thunderstorm (Description: "Lightning flashes and thunder rumbles")
- Fog (Description: "Thick fog reduces visibility to a few meters")
- Snow (Description: "Soft snowflakes fall gently from the sky")
```

See [EXAMPLE-ROLLTABLE.md](EXAMPLE-ROLLTABLE.md) for a complete example.

### Step 2: Configure the Module

1. Go to **Game Settings → Module Settings**
2. Find "Dynamic Weather Patterns" settings
3. Configure:
   - **Weather RollTable**: Select your weather table
   - **Update Frequency**: How often to roll (default: 4 hours)
   - **Transition Duration**: Base time for transitions (default: 60 minutes)
   - **Announce Weather**: Show chat messages for weather changes
   - **Whisper to GM**: Only GM sees announcements

### Step 3: Start Using

1. As GM, look for the weather icon in the scene controls toolbar
2. Click it to open the Weather Control dialog
3. Click "Roll New Weather" to generate your first weather pattern
4. The system will automatically continue rolling at your configured interval

## Weather Control Dialog

The control dialog shows:

- **Current Weather**: Name and detailed statistics
- **Weather Stats**: Temperature, cloud cover, precipitation, wind, visibility
- **Transition Progress**: Live progress bar when weather is changing
- **RollTable Selector**: Change the active weather table
- **Roll Button**: Manually trigger a new weather roll

## Weather Attributes

Each weather pattern has these attributes:

- **Temperature**: Degrees Celsius
- **Cloud Cover**: 0-100%
- **Precipitation**: 0-100% (rain/snow intensity)
- **Wind Speed**: km/h
- **Visibility**: 0-100%
- **Intensity**: 0-100 (overall severity)

### Automatic Parsing

The module automatically interprets weather attributes from rolltable result text using keywords:

- "rain" or "storm" → High precipitation and cloud cover
- "heavy" or "severe" → High intensity and wind
- "cloud" → Moderate cloud cover
- "clear" or "sunny" → Low clouds, high visibility
- "fog" → Low visibility, high cloud cover
- "snow" → Precipitation, low temperature
- "wind" → High wind speed

### Advanced: Custom Attributes

For precise control, add weather data to rolltable result flags:

```javascript
{
  "dynamic-weather": {
    "temperature": 15,
    "cloudCover": 80,
    "precipitation": 60,
    "windSpeed": 25,
    "visibility": 70,
    "intensity": 50
  }
}
```

## Integration with Other Modules

### Hooks

Listen for weather events in your own modules:

```javascript
// When weather is updated (fires every second during transitions)
Hooks.on("dynamicWeatherUpdate", weatherPattern => {
  console.log("Current weather:", weatherPattern.name);
  console.log("Temperature:", weatherPattern.temperature);
});

// When a new weather pattern is rolled
Hooks.on("dynamicWeatherRolled", (weatherPattern, rollTableResult) => {
  console.log("New weather rolled:", weatherPattern.name);
});

// When a transition completes
Hooks.on("dynamicWeatherTransitionComplete", weatherPattern => {
  console.log("Transition complete:", weatherPattern.name);
});
```

### API

Access the module API:

```javascript
const api = game.modules.get("dynamic-weather").api;

// Get current weather
const weather = api.getCurrentWeather();
console.log(weather.name, weather.temperature);

// Trigger a manual roll
await api.rollWeather();

// Get the weather system instance
const system = api.getWeatherSystem();
```

See [API.md](API.md) for complete API documentation.

## Realistic Transitions

The module uses a sophisticated transition system:

1. **Compatibility Calculation**: Weather patterns are compared to determine how "compatible" they are
2. **Adaptive Duration**: Less compatible patterns (e.g., Clear → Thunderstorm) take longer to transition
3. **Smooth Interpolation**: All weather attributes gradually blend using easing curves
4. **No Discontinuities**: Weather changes feel natural and realistic

Example:

- Clear Skies → Partly Cloudy: ~60 minutes
- Clear Skies → Thunderstorm: ~90 minutes
- Light Rain → Heavy Rain: ~45 minutes

## Configuration Options

### Update Frequency (Default: 4 hours)

How often the system rolls on the weather table. Set this based on your game's pacing:

- **1-2 hours**: Rapidly changing weather
- **4-6 hours**: Moderate weather changes
- **8-12 hours**: Slow, seasonal weather

### Transition Duration (Default: 60 minutes)

Base time for weather transitions. Actual duration varies by compatibility:

- **15-30 minutes**: Fast-paced games
- **45-90 minutes**: Realistic pacing
- **120+ minutes**: Slow, cinematic changes

### Announcements

Enable/disable chat messages when weather changes. Choose whether all players see them or just the GM.

## Weather Modes

The module supports three different weather modes to suit any campaign style:

### 🌤️ Normal Mode

Uses realistic, mundane weather patterns from your Normal Weather RollTable. Perfect for:

- Low-fantasy campaigns
- Realistic/historical settings
- Survival-focused games

### ✨ Strange Mode

Uses magical or unusual weather from your Strange Weather RollTable. Ideal for:

- High-fantasy worlds
- Planar adventures
- Post-apocalyptic settings
- System-specific magical weather

### 🌗 Hybrid Mode

Randomly mixes both normal and strange weather based on a configurable percentage. Great for:

- Most fantasy campaigns
- Adding unpredictability
- Wild magic zones
- Dynamic storytelling

**Example:** Set Strange Weather Chance to 25% for mostly normal weather with occasional magical events.

**Configuration:**

1. Set **Weather Mode** in module settings
2. Configure **Normal Weather RollTable** (for Normal/Hybrid modes)
3. Configure **Strange Weather RollTable** (for Strange/Hybrid modes)
4. Adjust **Hybrid Mode: Strange Weather Chance** slider (for Hybrid mode only)

See [WEATHER-MODES.md](WEATHER-MODES.md) for detailed information, examples, and campaign integration ideas.

## Tips & Best Practices

### Creating Weather Tables

- Include 6-12 different weather patterns
- Balance common vs. rare weather (adjust roll ranges)
- Group similar patterns together in the table
- Add seasonal variations with multiple tables

### Pacing

- Match update frequency to your session length
- For 4-hour sessions: 2-hour updates give 2-3 weather changes
- For long campaigns: 4-6 hour updates feel natural

### Immersion

- Enable chat announcements for player awareness
- Use weather descriptions in your narrative
- Combine with lighting and sound effects
- Adjust scene ambience based on weather

### Performance

- The module is lightweight and efficient
- Updates run every second but only calculate transitions
- No performance impact on player clients
- Safe to use with other weather/lighting modules

## Troubleshooting

**Weather isn't changing:**

- Ensure a RollTable is selected in settings
- Check that the table has valid results
- Verify update frequency isn't too long
- Click "Roll New Weather" to force an update

**Transitions seem instant:**

- Increase the Transition Duration in settings
- Check that weather patterns are significantly different
- Very similar patterns transition quickly (this is intentional)

**Module not appearing:**

- Ensure module is enabled in world settings
- Check browser console for errors
- Verify installation in Data/modules folder

**Control button missing:**

- Only GMs see the control button
- Check that module loaded correctly (see console)
- Try refreshing the page

## Compatibility

- **Foundry VTT Version**: v11 minimum, v12 verified
- **System**: Universal (works with any game system)
- **Conflicts**: None known

## Credits

Developed for the Foundry VTT community.

## License

[Your License Here]

## Changelog

### Version 1.0.0

- Initial release
- Core weather system with realistic transitions
- RollTable integration
- Time-based updates
- GM control dialog
- Chat announcements
- Module API and hooks

## Support

- **Issues**: [GitHub Issues Link]
- **Discord**: [Discord Link]
- **Documentation**: [Wiki Link]

## Roadmap

Future enhancements being considered:

- Weather effects integration (particles, sounds)
- Season system
- Climate zones
- Weather forecasting
- Historical weather data
- Multi-day weather patterns
- Weather-based scene effects
- Import/export weather profiles
