# OddFrame cinematic capabilities v2 ? first quality gate

Opt in with `import {CinematicV2} from "../../engine"` or import from `engine/v2` directly. Existing Human, rig, camera presets and film sources keep their defaults.

## Assets

`validateAssetRecord` / `loadLicensedModel` require identity, source/license URLs, SHA-256 and a byte budget. The licensed loader fetches and checks the main file before parsing. The demonstrated GLB embeds every dependency. For external-resource GLTF, keep a license/hash record for every buffer and image, as the source download manifest does. Loading a model never establishes its license automatically.

`loadModel` is the low-level GLTF/GLB promise cache. `loadTexture(url, "color" | "data")` caches color-space-specific textures. Rejected loads are evicted. GLTFLoader manages embedded texture roles. No CDN decoder is configured: Draco/Meshopt/KTX2 imports need deliberately configured local decoders and separate testing.

`Model` clones hierarchy/materials, shares geometry/textures, supports position/rotation/scale, an optional ground-centered placement anchor, and deterministic `AnimationMixer.setTime(frame / fps)` for a selected clip. `ModelInstances` batches a named static node by primitive/material, including nested transforms. It rejects skinned nodes. `configureMaterial` clones before applying overrides; it never mutates shared originals. `assetMetrics` counts instance multiplicity as well as prototype geometry. Cache resources live for the render page; clones dispose only their owned materials.

Run `scripts/engine20/optimize-gltf.py --help`. The static subset optimizer preserves the selected mesh geometry, prunes unused geometry buffers, strips kit layout transforms and embeds bounded textures. JPEG textures are lossy; transparency is retained as PNG. Normal maps are renormalized after resizing. It rejects skinning, animation, sparse accessors and compressed input instead of silently corrupting them. Source GLTF is retained and protected; use a new output path for each derivative. No decimation or topology repair is claimed.

`ArchitecturalFacade` builds real modeled doors, frames, wall openings and cornices from the imported kit using instancing. `TransitCourtyard` is a reusable lighting/architecture test environment. The present asset is an ordinary apartment facade; final futuristic art direction and additional building families remain a separate design task.

## Illustrated performances

`sampleLocomotion({start,end,points,stride}, frame)` maps time to distance along a polyline. Stance anchors remain in world coordinates, including around turns. Swing height eases to the floor over the final eight frames so the endpoint cannot freeze a raised foot. `cinematicPerformance(actor, phase, speed, mood)` keeps the worker identity and connected FK bone lengths, adds shoulder movement, delayed wrist/arm motion, body sway/lean, counter-motion of the head and blended silent facial states.

Render `CinematicHuman` plus `<GroundedLegs actor={actor} feet={walk.feet} lit segmentLength={.465} />` when separateLegs is selected. Idle performance can keep separate legs to retain the planted ending stance. Preserve the 3.2-world-unit calibration; the old GroundedLegs scale limitation still applies. Faces have gaze, eyebrow, eye openness and closed narrative expressions; there is no speech or lip-sync input. New hand shapes remain anchored at the wrist.

Lighting uses a rough diffuse illustrated plane with an emissive floor for legibility, alpha-tested silhouette shadows and real shadow receivers. This improves integration but is an artistic compromise, not volumetric anatomy. The character remains front-facing; a convincing rear view or over-the-shoulder foreground needs authored alternate 2D artwork. Body lean, three-quarter anatomy and running extremes require shot review.

## Cameras

`makeShot`, `overShoulder`, `sampleShot` support tracking, dolly-in/out, fly-through, crash zoom, shortest-arc whip pan, orbit, over-shoulder framing and reveal. Use purposefully authored endpoints, focus targets and FOV; a preset name alone does not design a good shot.

Curved paths use a 128-sample arc-length table and quintic speed ramps. Define shot objects outside React renders or memoize them. No elapsed-time motion or accumulated spring simulation is used.

`validateShot(shot, obstacles)` tests each frame and the swept segment between frame positions against conservative padded AABBs, accounting for a near-plane enclosing radius. It is a validation tool, not obstacle avoidance or navigation. Supply every relevant collider. A frame callback can provide moving AABBs; the validator unions consecutive boxes conservatively. It cannot prove clearance for unspecified geometry. `CameraPath` draws the sampled route; the lab also emits path samples and an overhead plan.

## Lighting and finishing

`CinematicLightRig` uses the existing local HDR through PMREM, fixed ACES exposure, fill/rim lights and a 1024px PCF shadow map. The HDR delay resolves only after a deterministic render. Faces retain a small emissive contribution. Environment reflections are static HDR reflections; they do not reflect local moving buildings/actors. The lab camera uses controlled bloom only (0.08 intensity, 1.4 threshold). Depth of field and temporal motion blur are disabled for these gates: preserve face/display readability and random-access frame stability. The legacy DepthFinish near/far assumptions are not reused.

## Quality review and limits

Sources/compositions: `src/oddframe/engine20-lab/`; outputs: `out/oddframe-engine20/`. Comparisons are six seconds at 360x640, 30 fps, with 540x960 representative stills. All production compositions remain 1080x1920 source dimensions. The lab qualityScale defaults to 1, and preview renderers explicitly set both output scale and WebGL DPR (1/3 for 360x640, 1/2 for stills). Runtime metrics assert the actual drawing buffer is 360x640 for preview videos. Reducing output scale alone does not reduce ThreeCanvas internal buffers. No full film or final-resolution movie is rendered. Every demo is silent; existing music and SFX files remain separate and unchanged.

Run root and engine TypeScript checks, `node scripts/engine20/validate.cjs`, `node scripts/engine20/render-lab.mjs --all`, then `python scripts/engine20/review.py`. Review evidence and measured performance are in the Arabic reports at repository root. Performance FPS means offline capture-and-encode throughput, not interactive playback. Node RSS excludes Chromium and GPU allocations. No 1080p timing is extrapolated as a measured fact.
