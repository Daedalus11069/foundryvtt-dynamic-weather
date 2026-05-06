# Weather Modes Guide

The Dynamic Weather Patterns module supports three different weather modes, allowing you to mix realistic and game-specific strange/magical weather.

## Weather Modes

### 🌤️ Normal Weather Only

Uses only the Normal Weather RollTable for realistic, mundane weather patterns.

**Best for:**

- Realistic campaigns
- Low-fantasy settings
- Historical games
- Survival-focused adventures

**Example weather:**

- Clear skies
- Cloudy
- Rain
- Thunderstorm
- Fog
- Snow

---

### ✨ Strange Weather Only

Uses only the Strange Weather RollTable for magical, unusual, or game-system-specific weather.

**Best for:**

- High-fantasy campaigns
- Post-apocalyptic settings
- Planar adventures
- Magical worlds
- System-specific weather effects

**Example weather:**

- Arcane mist
- Crimson rain
- Gravity flux
- Temporal distortion
- Reality storm
- Astral winds

---

### 🌗 Hybrid (Mix of Both)

Randomly switches between Normal and Strange weather tables based on a configurable percentage.

**Best for:**

- Most fantasy campaigns
- Adding unpredictability
- Worlds with wild magic zones
- Seasonal magical events
- Dynamic storytelling

**Configuration:**

- Set the "Strange Weather Chance" slider (0-100%)
- 25% = Mostly normal weather with occasional strange events
- 50% = Equal mix of normal and strange
- 75% = Mostly strange weather

---

## Setting Up Weather Modes

### 1. Create Your RollTables

#### Normal Weather Table

Create a standard weather table with realistic patterns:

```
Clear Skies (30%)
Partly Cloudy (25%)
Overcast (20%)
Light Rain (15%)
Heavy Rain (7%)
Thunderstorm (3%)
```

See [EXAMPLE-ROLLTABLE.md](EXAMPLE-ROLLTABLE.md) for detailed examples.

#### Strange Weather Table

Create a magical/unusual weather table:

```
Arcane Mist - Shimmering magical energies fill the air, making spellcasting easier
Crimson Rain - Red rain falls from purple clouds (no ill effects but unsettling)
Gravity Flux - Gravity fluctuates, making movement unpredictable
Ethereal Wind - Winds blow through material and ethereal planes
Storm of Blades - Fierce winds that cut like knives (magical)
Temporal Distortion - Time moves strangely
```

### 2. Configure Module Settings

1. Open **Game Settings → Module Settings**
2. Find "Dynamic Weather Patterns"
3. Set **Weather Mode** to your desired mode
4. Select your **Normal Weather RollTable**
5. Select your **Strange Weather RollTable** (if using Strange or Hybrid)
6. If using Hybrid, adjust **Strange Weather Chance**

### 3. Start Rolling!

Open the Weather Control dialog and click "Roll New Weather". The system will automatically use the appropriate table(s) based on your mode.

---

## Mode Behavior Details

### Normal Mode

```
Every roll → Normal Weather Table
```

Simple and predictable. Always rolls realistic weather.

### Strange Mode

```
Every roll → Strange Weather Table
```

Every weather change is magical or unusual.

### Hybrid Mode

```
Each roll:
- Roll d100
- If roll ≤ Strange Weather Chance → Strange Weather Table
- Otherwise → Normal Weather Table
```

Creates dynamic variety. Example with 25% strange chance:

- Most rolls produce normal weather
- Roughly 1 in 4 rolls produce strange weather
- Over a 24-hour period (6 rolls at 4-hour intervals), expect 1-2 strange weather events

---

## Visual Indicators

### In Chat Announcements

- **Normal weather**: Blue accent
- **Strange weather**: Purple accent + "Strange" badge

### In Weather Control Dialog

- **Normal weather**: Standard display
- **Strange weather**: ✨ sparkle icon next to name

---

## Game System Integration

### Strange Weather by System

#### D&D 5e

- Wild Magic Surge weather
- Feywild phenomena
- Shadowfell effects
- Elemental plane crossover

#### Pathfinder

- Magical storms
- Planar convergence
- Primal magic weather
- Divine phenomena

#### Call of Cthulhu

- Unnatural fog
- Cosmic horror weather
- Reality distortions
- Eldritch phenomena

#### Generic Fantasy

- Fey crossing effects
- Curse-related weather
- Artifact interference

---

## Example Hybrid Campaign

**Setting:** Standard fantasy world with occasional magical anomalies

**Configuration:**

- Weather Mode: Hybrid
- Strange Weather Chance: 20%
- Update Frequency: 4 hours

**Expected Behavior:**

- Day 1: Clear → Cloudy → Rain → Overcast (all normal)
- Day 2: Clear → **Arcane Mist** (strange!) → Partly Cloudy → Clear
- Day 3: Overcast → Light Rain → Rain → **Gravity Flux** (strange!)

Players experience mostly normal weather with exciting magical events that create memorable moments.

---

## Creating Balanced Strange Weather Tables

### Guidelines

**1. Range of Intensity**

- Mild strange effects (30%): Unusual but not dangerous
- Moderate effects (50%): Interesting and impactful
- Severe effects (20%): Dangerous or dramatic

**2. Game Impact**

- Some weather should affect mechanics (advantage/disadvantage)
- Some should be purely atmospheric
- Some should create adventure opportunities

**3. Description Quality**
Write evocative descriptions that:

- Engage multiple senses
- Suggest mechanical effects without defining them
- Leave room for GM interpretation
- Create atmosphere and mood

### Example: Balanced Strange Weather Table

| Roll   | Weather         | Intensity | Impact                     |
| ------ | --------------- | --------- | -------------------------- |
| 1-30   | Shimmering Air  | Mild      | Atmospheric only           |
| 31-50  | Arcane Mist     | Mild      | +1 to spell DC             |
| 51-70  | Ethereal Wind   | Moderate  | Ghostly apparitions appear |
| 71-85  | Gravity Flux    | Moderate  | Movement speed ±10 ft      |
| 86-95  | Reality Ripples | Severe    | Minor reality warps        |
| 96-100 | Storm of Magic  | Severe    | Wild magic surge table     |

---

## Tips for Different Modes

### Normal Mode Tips

- Create seasonal tables for variety
- Adjust roll frequencies to match climate
- Use weather as foreshadowing for story events

### Strange Mode Tips

- Theme strange weather to current story arc
- Link weather to campaign villains or events
- Use weather to signal planar activity
- Make weather itself a mystery to investigate

### Hybrid Mode Tips

- **20-30% strange**: Occasional magical events feel special
- **40-60% strange**: Balanced for high-magic settings
- **70-80% strange**: Normal weather becomes the exception
- Adjust percentage based on campaign phase (more strange during climax)

---

## Advanced: Conditional Strange Weather

Want strange weather only in specific locations or times?

### Option 1: Multiple Tables

Create location-specific strange tables:

- "Feywild Strange Weather"
- "Shadowfell Strange Weather"
- "Material Plane Strange Weather"

Switch tables manually when players change locations.

### Option 2: Macro Integration

Create a macro that adjusts hybrid chance based on conditions:

```javascript
// Increase strange weather in wild magic zones
if (currentLocation === "Wild Magic Zone") {
  await game.settings.set("dynamic-weather", "hybridChance", 75);
} else {
  await game.settings.set("dynamic-weather", "hybridChance", 20);
}
```

### Option 3: Event-Based

Switch to Strange mode temporarily during major magical events:

```javascript
// During the ritual
await game.settings.set("dynamic-weather", "weatherMode", "strange");

// After the ritual ends
await game.settings.set("dynamic-weather", "weatherMode", "hybrid");
```

---

## Hooks for Weather Type

Use hooks to react differently based on weather type:

```javascript
Hooks.on("dynamicWeatherRolled", (pattern, result, weatherType) => {
  if (weatherType === "strange") {
    // Trigger special effects, sounds, or mechanics
    ui.notifications.info("The fabric of reality ripples...");

    // Maybe trigger a wild magic check
    if (Math.random() < 0.1) {
      ChatMessage.create({
        content: "The strange weather triggers a wild magic surge!"
      });
    }
  }
});
```

---

## Troubleshooting

**Strange weather never appears (Hybrid mode)**

- Check that Strange Weather RollTable is selected
- Verify hybrid chance is > 0%
- Try increasing the percentage

**Too much strange weather**

- Lower hybrid chance percentage
- Switch to Normal mode temporarily
- Create a larger normal weather table to dilute strange results

**Strange weather doesn't feel impactful**

- Add mechanical effects in descriptions
- Use chat messages to emphasize effects
- Integrate with combat or skill checks

---

## Example Campaign: The Convergence

**Setup:**

- Start: Normal mode (stable reality)
- Month 1: Hybrid mode at 10% (first signs)
- Month 2: Hybrid mode at 25% (growing instability)
- Month 3: Hybrid mode at 50% (reality fraying)
- Climax: Strange mode (full planar convergence)
- Resolution: Hybrid mode at 25% → 10% → Normal (reality stabilizes)

This creates a escalating sense of danger tied to weather patterns, giving players a visible indicator of campaign progress.

---

## Ready to Use!

The weather mode system is fully integrated and ready to use. Just:

1. Create two rolltables (normal and strange)
2. Select your mode
3. Configure settings
4. Start rolling!

The weather system handles everything else automatically, including smooth transitions between all weather types.

Enjoy mixing realistic and magical weather in your campaigns! 🌤️✨
