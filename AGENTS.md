# Project instructions

- Keep domain calculations in `src/features/**/domain` or `src/lib`, not in UI components.
- Do not invent poultry-management recommendations. Every technical coefficient must carry source, version, applicable housing system, age range, unit, and review status.
- Clearly label demonstration data. Do not present sample values as real flock measurements or validated engineering recommendations.
- Never assume a weighing scale protocol from its brand/model. Add a connector only after the device's protocol is documented and tested with real hardware.
- Validate all user input at runtime. Treat imported manuals and device payloads as untrusted input.
- Keep secrets out of source control. Never overwrite existing `.env*` files.
- For Three.js resources, dispose geometries/materials/textures and provide a non-WebGL fallback.
- Run `npm run typecheck`, `npm test`, and `npm run build` before delivery when dependencies are available.
