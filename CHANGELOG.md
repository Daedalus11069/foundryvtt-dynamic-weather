# Changelog

All notable changes to the Dynamic Weather Patterns module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-01

### Added

- Initial release of Dynamic Weather Patterns module
- **Included Weather Tables Compendium**: Two ready-to-use weather tables
  - Standard Weather Patterns (d20): 10 realistic weather types for temperate climates
  - Strange Weather Patterns (d12): 12 magical/unusual weather phenomena
  - All tables include complete weather attribute data for smooth transitions
- Core weather pattern system with realistic attribute modeling
- Smooth weather transitions with compatibility-based duration
- **Weather Modes System**: Three distinct modes for different campaign styles
  - Normal Mode: Realistic weather only
  - Strange Mode: Magical/unusual weather only
  - Hybrid Mode: Dynamic mix of both with configurable probability
- **Temperature Unit System**: Per-player preference for temperature display
  - Celsius, Fahrenheit, and Kelvin support
  - Client-scoped settings for individual player preferences
  - Automatic conversion while maintaining internal consistency
- Strange Weather RollTable support
- Hybrid Mode chance slider (0-100%) in settings and control dialog
- Weather type tracking (normal vs strange) on WeatherPattern objects
- Support for special weather effects (magical storms, dimensional rifts, etc.)
- Visual indicators for strange weather:
  - Purple-themed chat announcements for strange weather
  - ✨ sparkle badge in weather control dialog
  - "Strange" label in chat messages
- **Weather Control Button**: Fixed-position UI button in top-right corner
  - Always accessible for GMs
  - Opens Weather Control Dialog
  - Styled with hover effects
- RollTable integration for weather generation
- Time-based automatic weather updates
- Weather Control Dialog for GM management with:
  - Weather mode selector dropdown
  - Conditional display of rolltable selectors based on mode
  - Hybrid chance slider for real-time adjustment
  - Live weather stats display
  - Transition progress bar
  - Manual weather rolling
- Module settings for customization:
  - Weather Mode - choose between normal/strange/hybrid
  - Normal Weather RollTable selection
  - Strange Weather RollTable - configure magical weather table
  - Hybrid Mode: Strange Weather Chance - set probability (0-100%)
  - Update frequency configuration
  - Transition duration control
  - Chat announcement options
  - GM whisper mode
- Developer API with hooks:
  - `dynamicWeatherUpdate` - fires every second with current state
  - `dynamicWeatherRolled` - fires when new weather is rolled (includes weatherType parameter)
  - `dynamicWeatherTransitionComplete` - fires when transitions finish
- Public API methods:
  - `getCurrentWeather()` - get current weather pattern
  - `rollWeather()` - manually trigger a roll
  - `getWeatherSystem()` - access system instance
- Automatic weather attribute parsing from rolltable text
- Support for custom weather attributes via flags
- State persistence between sessions
- Chat announcements for weather changes
- Scene controls toolbar button for quick access
- Comprehensive documentation:
  - README with quick start guide
  - Example rolltable creation guide
  - Complete API documentation for developers
  - Weather modes documentation (WEATHER-MODES.md)
  - Game system integration examples for strange weather
  - Campaign progression examples using mode switching

### Technical Details

- ES Module architecture
- Smooth interpolation using cubic easing
- Efficient update loop (1 second intervals)
- Compatibility calculation algorithm
- Automatic state saving and loading
- Weather mode logic integrated into roll system
- Probabilistic table selection for hybrid mode
- Backward compatible design
- State persistence includes all weather mode settings
- Support for Foundry VTT v11-v12
  - `dynamicWeatherTransitionComplete` - fires when transitions finish
- Public API methods:
  - `getCurrentWeather()` - get current weather pattern
  - `rollWeather()` - manually trigger a roll
  - `getWeatherSystem()` - access system instance
- Automatic weather attribute parsing from rolltable text
- Support for custom weather attributes via flags
- State persistence between sessions
- Chat announcements for weather changes
- Scene controls toolbar button for quick access
- Comprehensive documentation:
  - README with quick start guide
  - Example rolltable creation guide
  - Complete API documentation for developers

### Technical Details

- ES Module architecture
- Smooth interpolation using cubic easing
- Efficient update loop (1 second intervals)
- Compatibility calculation algorithm
- Automatic state saving and loading
- Support for Foundry VTT v11-v12

### Known Limitations

- Weather system runs on GM client only
- No built-in particle or sound effects (use hooks for integration)
- Single global weather pattern (use API for multi-zone support)

---

## Future Roadmap

### Version 1.1.0 (Planned)

- Weather effects integration (optional particles/sounds)
- Season system with automatic table switching
- Weather history tracking
- Enhanced UI with weather forecast
- Mobile/tablet optimized controls

### Version 1.2.0 (Planned)

- Multi-zone weather support
- Climate system with biome definitions
- Weather-based scene effects presets
- Import/export weather profile packs
- Compendium of pre-made weather tables

### Version 2.0.0 (Ideas)

- Integration with Simple Calendar module
- Weather-based combat effects
- Procedural weather pattern generation
- Machine learning for realistic patterns
- 3D weather visualization
- VTT audio integration
- Weather forecast mechanics

---

## Version History

- **1.0.0** (2026-05-01) - Initial Release

---

[1.0.0]: https://github.com/yourusername/dynamic-weather/releases/tag/v1.0.0
