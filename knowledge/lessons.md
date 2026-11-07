# Proven production lessons / 2.1

1. **Recover before producing.** Inspect processes, ffprobe metadata, checkpoints
   and input hashes. A missing MP4 differs from a live encoder or a completed file
   with another name. Film02 recovered from backup-only, not an imaginary partial
   master. Preserve failed attempts; do not redownload existing assets.
2. **Keep picture locked during audio.** Cue sheets guide; actual foot touchdown,
   door travel and button contact frames determine sync. At 30FPS/48kHz a frame
   equals 1600 samples. Verify decoded AAC alignment after container priming.
3. **Reuse source, not scaled clips.** Film02 adapters retimed approved sets and
   paths. Scene segments keep global frames. Asset/HDR readiness barriers stay.
4. **Measure the buffer.** ThreeCanvas DPR and output scale must agree. Native
   Film02 took 557.96s vs its 274.04s preview source render; single production runs
   are not controlled benchmarks. Node RSS excludes Chromium and GPU allocations.
5. **Optimize visible work.** Review05 reduced sampled triangles about 52% but
   added signs/activity made capture about 10% slower. Draw calls, texture updates,
   shadows and postprocessing matter. Favor cached assets and visible instancing.
6. **Respect illustrated anatomy.** Keep native standing legs; moving projected
   legs go behind shirts with controlled depth order. Use the fixed-length solver
   and camera projection for contacts. Running is simplified, rear-shoulder art
   is not a rear rig. Camera blends need their own geometry-clearance checks.
7. **Sound remains instrumental.** Seeded synthesis is reproducible, not recorded
   orchestral/Foley performance. Export stems with common gain so they sum back.
   Constant gain respects both true peak and LUFS. Film02's -26.96LUFS bed leaves
   room for external narration; it is not a mastered voice-led mix.
8. **Check delivered media.** Decode final MP4/AAC, all frames and intended black
   intervals, then inspect actual contacts/displays/cuts. Objective audio checks
   do not imply human listening; report the difference accurately.
9. **Portability fixes.** Current FFmpeg removed -vsync: use -fps_mode passthrough.
   Avoid duplicate frame keys when merging cue metadata. PowerShell pipelines can
   corrupt Arabic unless UTF-8 is explicit. Bound browser shutdown. Webpack cache
   warnings were non-blocking; an old API403 did not invalidate the hashed HDR.
10. **Spend computation once.** Run targeted tests, then continue. No full-film
    rerender for an engine release. Keep generated artifacts out of Git. Publish
    against the existing remote parent in its established root layout; never
    force-push the unborn local host branch over remote history.

Engine2.1 validation also caught a new passive WebGL probe accidentally taking
over R3F drawing: positive useFrame priorities disable automatic rendering. Use
zero/negative priority for passive observations. A metadata-valid MP4 can still
be entirely black; require decoded-frame validation before checkpoint reuse.
