# OddFrame Engine 2.1 — source-library handoff

Read `knowledge/index.json`, `PRODUCTION_21.md`, `STYLE_GUIDE.md` and
`ANIMATION_RULES.md`. This repository is the reusable ENGINE, with engine contents
at root. The consuming production workspace has films/assets/exports elsewhere.
Paths in knowledge inventory are explicitly host-relative and do not imply that
those files are bundled here. Do not create a new film/story during engine work.

- Preserve expressive 2D illustrated people inside 3D environments. Reuse artwork,
  fixed-length connected rigs, v2 paths/lighting and approved assets. No 3D humans,
  dialogue, character voices or lip-sync. User adds English narration externally;
  production provides instrumental music/SFX with narration headroom.
- New API: `v2_1`; existing `index.ts` and `v2` defaults stay backward compatible.
  Do not silently migrate host films. `templates/film-starter` is deliberately empty.
- All animation derives from the requested GLOBAL frame. Use integer half-open
  scene intervals, frame-to-sample cues, seeded synthesis and no wall-clock state.
- i5-4310U / 8GB / Intel HD: single worker, installed Chrome/Edge ANGLE, actual
  540x960 preview buffer/output and 1080x1920 DPR1 native final. No upscaling.
  New-film full preview needs explicit approval before final. Keep HDR readiness
  and bounded browser cleanup; no unnecessary dependencies/GPU-heavy features.
- Read Film01/02 structured records before redoing an audit. Film02 final01 is
  complete in the host. Reuse valid masters/checkpoints; inspect processes and
  hashes after interruption. Never duplicate a live job or regenerate completed
  assets/audio. Active leases are not authorization to kill unrelated processes.
- Back up/SHA-256 before modifying host/shared production files. Preserve approved
  films, license records and outputs. New revisions use new folders. At most two
  focused visual correction passes before delivery; report remaining limitations.
- Audio: original seeded synthesis or verified licensed samples, 48kHz stereo
  stems, actual frame cues, measured LUFS/true peak, no voices, video-copy mux.
  Film02 -26.96LUFS/-6.99dBTP is a bed measurement, not a future narration target.
- Test focused changes: npm run check; npm test; python tests/test_audio.py. Host
  compatibility checks compare original hashes and deterministic frame samples;
  do not rerender complete films just for engine utilities/docs. Inspect decoded
  pictures/interactions and measure actual buffers for production deliveries.
- Current FFmpeg uses -fps_mode passthrough, not -vsync. PowerShell pipelines need
  explicit UTF-8 for Arabic. Keep native standing legs; order projected walking
  layers behind shirts; check camera silhouettes and button contacts.
- Review diff, allowed files, sizes and secrets before staging/pushing. No host
  src/public/out/backups, generated media/audio/caches/credentials, implicit whole-
  workspace staging, force push, history rewrite or new LFS configuration.
- Reports to the current user are Arabic. Keep structured memory/code in English.
  Use targeted reads/checks and checkpoint reuse to limit tokens and rendering.
  Do not use sub-agents unless explicitly requested.
