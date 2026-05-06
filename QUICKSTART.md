# Quick Start Guide - Dynamic Weather Patterns

Get your weather system running in 5 minutes!

## Step 1: Enable the Module (30 seconds)

1. Open Foundry VTT
2. Go to your world
3. Click "Manage Modules"
4. Find "Dynamic Weather Patterns" and enable it
5. Click "Save Module Settings"
6. Refresh your browser (F5)

## Step 2: Create a Weather Table (2 minutes)

1. Click the **Items** tab in the sidebar
2. Switch to **RollTables**
3. Click **Create RollTable**
4. Name it: "Basic Weather"
5. Set formula to: `1d100`
6. Add these results (click + button):

| Range  | Name   | Description           |
| ------ | ------ | --------------------- |
| 1-40   | Clear  | Beautiful clear skies |
| 41-70  | Cloudy | Gray clouds overhead  |
| 71-90  | Rain   | Steady rainfall       |
| 91-100 | Storm  | Severe thunderstorm   |

## Step 3: Configure the Module (1 minute)

1. Click **Game Settings** (gear icon)
2. Find "Module Settings" tab
3. Scroll to "Dynamic Weather Patterns"
4. Set **Weather RollTable** to "Basic Weather"
5. Set **Update Frequency** to `4` hours
6. Check **Announce Weather Changes**
7. Click **Save Changes**

## Step 4: Start the Weather (30 seconds)

1. Look for the **weather icon** (☁️🌤️) in the scene controls toolbar (left side)
2. Click it to open the Weather Control dialog
3. Click **"Roll New Weather"**
4. Your first weather pattern appears!

## Done! 🎉

The weather system is now active and will:

- Automatically roll for new weather every 4 hours
- Smoothly transition between patterns
- Announce changes in chat
- Remember state between sessions

## What's Next?

### View Current Weather

- Click the weather icon anytime to see current conditions
- Watch the progress bar during transitions

### Manual Weather Changes

- Open Weather Control dialog
- Click "Roll New Weather" whenever you want

### Improve Your Weather Table

- Add more weather types (fog, snow, etc.)
- Write better descriptions
- Adjust roll ranges for rarity
- Create seasonal tables

### Customize Settings

- **Update Frequency**: Change how often weather rolls
- **Transition Duration**: Make changes faster/slower
- **Announcements**: Control who sees weather messages

## Advanced: Seasonal Tables (Optional)

Create 4 tables: Spring Weather, Summer Weather, Autumn Weather, Winter Weather

Switch between them in settings to match your campaign's season.

## Need Help?

- Read the full [README.md](README.md)
- Check [EXAMPLE-ROLLTABLE.md](EXAMPLE-ROLLTABLE.md) for better tables
- Review [API.md](API.md) if you're a developer

## Common Issues

**"No weather pattern active"**
→ Click "Roll New Weather" to start

**Weather isn't changing**
→ Check that Update Frequency isn't too long (try 1 hour)

**Can't find the weather button**
→ Only GMs can see it. Make sure you're logged in as GM.

**Weather changes instantly**
→ Increase Transition Duration in settings

---

**That's it! Enjoy your dynamic weather!** 🌦️⛈️🌈
