# Example Weather RollTable

This document provides a complete example of a weather rolltable you can use with the Dynamic Weather Patterns module.

## Creating the RollTable

1. In Foundry VTT, go to the **Items Sidebar**
2. Click the **RollTables** tab
3. Click **Create RollTable**
4. Name it "Standard Weather Patterns"
5. Set the formula to `1d100`

## Basic Weather Table

Add these results to your rolltable:

| Roll Range | Weight | Result Name   | Description                                                                                                                                         |
| ---------- | ------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-25       | 25     | Clear Skies   | A beautiful day with clear blue skies and gentle sunshine. Perfect weather for travel and outdoor activities.                                       |
| 26-45      | 20     | Partly Cloudy | White fluffy clouds drift lazily across the sky. The sun peeks through intermittently, creating shifting patterns of light and shadow.              |
| 46-60      | 15     | Overcast      | A solid blanket of gray clouds covers the entire sky. The light is diffuse and flat, with no shadows.                                               |
| 61-75      | 15     | Light Rain    | A gentle drizzle falls steadily from gray clouds above. The rain is light enough that travel continues, though everything becomes wet and slippery. |
| 76-85      | 10     | Heavy Rain    | Sheets of rain pour down from dark, heavy clouds. Visibility is reduced and the sound of rain is overwhelming.                                      |
| 86-92      | 7      | Fog           | Thick fog rolls in, reducing visibility to just a few meters. Sounds are muffled and distances are impossible to judge.                             |
| 93-97      | 5      | Thunderstorm  | Dark clouds unleash torrential rain, lightning flashes across the sky, and thunder rumbles ominously. Wind whips through the area.                  |
| 98-100     | 3      | Severe Storm  | A powerful storm with driving rain, fierce winds, frequent lightning, and deafening thunder. Travel becomes dangerous.                              |

## Seasonal Variations

Create multiple tables for different seasons:

### Spring Weather Table

| Roll Range | Result Name    | Description                                                                                                |
| ---------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| 1-20       | Spring Showers | Brief, intermittent rain showers with periods of sunshine between. Flowers bloom and the air smells fresh. |
| 21-50      | Mild & Cloudy  | Comfortable temperatures with scattered clouds. A perfect spring day.                                      |
| 51-70      | Sunny & Warm   | Clear skies and warming temperatures. The sun shines brightly.                                             |
| 71-85      | Windy          | Strong spring winds blow across the landscape, clearing away clouds and carrying pollen through the air.   |
| 86-95      | Rainstorm      | Heavy spring rains that feed rivers and promote growth.                                                    |
| 96-100     | Late Frost     | Unexpectedly cold temperatures bring frost despite the spring season.                                      |

### Summer Weather Table

| Roll Range | Result Name   | Description                                                                                              |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| 1-40       | Hot & Sunny   | Blazing sunshine and high temperatures. The heat becomes oppressive by midday.                           |
| 41-65      | Hot & Humid   | High temperatures combined with heavy humidity make the air feel thick and uncomfortable.                |
| 66-80      | Partly Cloudy | Some relief from the heat as clouds provide intermittent shade.                                          |
| 81-90      | Summer Storm  | Sudden, intense thunderstorms roll in during the afternoon, bringing brief but heavy rain and lightning. |
| 91-97      | Heat Wave     | Extreme temperatures with no relief. The sun beats down mercilessly.                                     |
| 98-100     | Hailstorm     | A severe storm brings dangerous hail along with rain and wind.                                           |

### Autumn Weather Table

| Roll Range | Result Name     | Description                                                                              |
| ---------- | --------------- | ---------------------------------------------------------------------------------------- |
| 1-25       | Crisp & Clear   | Cool, comfortable temperatures with clear skies. Leaves rustle in gentle breezes.        |
| 26-50      | Overcast & Cool | Gray skies and cooling temperatures signal the coming of winter.                         |
| 51-70      | Autumn Rain     | Steady rain falls from leaden skies, creating puddles and making fallen leaves slippery. |
| 71-85      | Foggy Morning   | Morning fog that burns off by midday, revealing clear skies.                             |
| 86-95      | Windy           | Strong autumn winds scatter leaves and clouds across the sky.                            |
| 96-100     | Early Snow      | The first snowflakes of the season fall unexpectedly.                                    |

### Winter Weather Table

| Roll Range | Result Name     | Description                                                                                         |
| ---------- | --------------- | --------------------------------------------------------------------------------------------------- |
| 1-30       | Light Snow      | Gentle snowflakes drift down from gray skies, gradually accumulating.                               |
| 31-50      | Heavy Snow      | Thick snowfall reduces visibility and quickly covers everything in white.                           |
| 51-65      | Blizzard        | Fierce winds drive snow horizontally. Visibility drops to near zero and travel becomes treacherous. |
| 66-80      | Clear & Cold    | Clear skies allow temperatures to plummet. The air is crisp and still.                              |
| 81-90      | Overcast & Cold | Gray skies and bitter cold. Snow feels imminent.                                                    |
| 91-97      | Ice Storm       | Freezing rain coats everything in a layer of ice, making surfaces extremely dangerous.              |
| 98-100     | Extreme Cold    | Dangerously cold temperatures with clear skies. Exposed skin freezes quickly.                       |

## Advanced: Custom Weather Attributes

For precise control over weather attributes, you can add custom flags to rolltable results using macros or the console.

### Adding Flags to Results

Open the browser console (F12) and run:

```javascript
// Get your rolltable
const table = game.tables.getName("Standard Weather Patterns");

// Find a specific result
const result = table.results.find(r => r.text.includes("Clear Skies"));

// Add weather data to flags
await result.update({
  "flags.dynamic-weather": {
    temperature: 22,
    cloudCover: 10,
    precipitation: 0,
    windSpeed: 8,
    visibility: 100,
    intensity: 5
  }
});
```

### Complete Example with Flags

```javascript
// Example: Setting up "Heavy Rain" with precise attributes
const table = game.tables.getName("Standard Weather Patterns");
const heavyRain = table.results.find(r => r.text.includes("Heavy Rain"));

await heavyRain.update({
  "flags.dynamic-weather": {
    temperature: 12, // Cool temperature
    cloudCover: 95, // Almost completely cloudy
    precipitation: 85, // Heavy rainfall
    windSpeed: 30, // Moderate wind
    visibility: 50, // Reduced visibility
    intensity: 70 // High intensity weather event
  }
});
```

### Attribute Guidelines

Use these ranges as a guide:

**Temperature** (°C)

- Extreme Cold: -20 to -5
- Cold: -5 to 5
- Cool: 5 to 15
- Mild: 15 to 25
- Warm: 25 to 35
- Hot: 35+

**Cloud Cover** (0-100%)

- Clear: 0-20
- Partly Cloudy: 20-50
- Mostly Cloudy: 50-80
- Overcast: 80-100

**Precipitation** (0-100%)

- None: 0
- Light: 1-30
- Moderate: 30-60
- Heavy: 60-85
- Severe: 85-100

**Wind Speed** (km/h)

- Calm: 0-10
- Light Breeze: 10-20
- Moderate: 20-35
- Strong: 35-50
- Gale: 50-75
- Storm: 75+

**Visibility** (0-100%)

- Zero: 0-10 (blizzard/thick fog)
- Poor: 10-30
- Reduced: 30-60
- Fair: 60-85
- Good: 85-95
- Excellent: 95-100

**Intensity** (0-100 overall severity)

- Calm: 0-20
- Mild: 20-40
- Moderate: 40-60
- Severe: 60-80
- Extreme: 80-100

## Fantasy Weather Table

For fantasy settings, you can add magical or unusual weather:

| Roll Range | Result Name         | Description                                                                       |
| ---------- | ------------------- | --------------------------------------------------------------------------------- |
| 1-30       | Normal Weather      | Standard weather appropriate to the season.                                       |
| 31-60      | Partly Cloudy       | Unremarkable weather with some clouds.                                            |
| 61-70      | Arcane Mists        | Shimmering, magical mists that make spellcasting easier but obscure vision.       |
| 71-80      | Crimson Rain        | Strange red rain falls from purple-tinged clouds. No ill effects, but unsettling. |
| 81-87      | Gravity Flux        | Intermittent fluctuations in gravity make movement unpredictable.                 |
| 88-93      | Ethereal Wind       | Winds that blow through the material and ethereal planes simultaneously.          |
| 94-97      | Storm of Blades     | Fierce winds that seem to cut like knives. Magical in nature.                     |
| 98-99      | Temporal Distortion | Time moves strangely - sometimes faster, sometimes slower.                        |
| 100        | Reality Storm       | The very fabric of reality becomes unstable. Anything can happen.                 |

## Testing Your Table

Once created, test your rolltable:

1. Open the Dynamic Weather control panel
2. Select your newly created table
3. Click "Roll New Weather" several times
4. Observe how different weather patterns transition
5. Adjust weights and descriptions as needed

## Tips for Great Weather Tables

1. **Balance Common vs. Rare**: Make pleasant weather more common (60-70% of rolls)
2. **Progressive Intensity**: Order results from mild to severe
3. **Descriptive Text**: Write evocative descriptions that GMs can read aloud
4. **Seasonal Appropriateness**: Create season-specific tables
5. **Regional Variation**: Desert, ocean, mountain, and forest tables
6. **Narrative Hooks**: Include weather that creates adventure opportunities

## Importing/Exporting Tables

You can share your weather tables with others:

1. Right-click on the rolltable
2. Select "Export Data"
3. Share the JSON file
4. Others can import it via "Import Data"

## Compendium Integration

For permanent storage:

1. Create a compendium: "Weather Tables"
2. Drag your tables into the compendium
3. Share the compendium pack
4. Other users can import from your pack

---

Now you're ready to create dynamic, realistic weather for your Foundry VTT games!
