export {Human} from './characters/Human';
export type {ActorProps} from './characters/Human';
export {Billboard} from './characters/Billboard';
export {drawHuman,drawRigLeg,HUMAN_W,HUMAN_H,HUMAN_WORLD,HUMAN_SOLE} from './characters/humanArt';
export type {Person,Emotion,Gesture,HumanState,HumanRig,RigArm,P} from './characters/humanArt';
export {HUMAN_EXPRESSIONS,RIG_POSES} from './characters/expressions';
export {buildHumanRig} from './animation/rig';
export {buildConnectedHumanRig,solveConnectedArm,ARM_LENGTHS} from './animation/connectedRig';
export {sampleWalk} from './animation/walk';
export type {WalkKey} from './animation/walk';
export {GroundedLegs} from './animation/GroundedLegs';
export {Office,OFFICE_DESK_TOP} from './environments/Office';
export {Beach} from './environments/Beach';
export {Exterior} from './environments/Exterior';
export {Contact} from './environments/Contact';
export {MaterialLibrary,Block,GlowPatch} from './environments/Materials';
export {CinematicLighting} from './lighting/CinematicLighting';
export {CameraRig,sampleCameraShot} from './cameras/CameraRig';
export type {CameraShot,CameraState} from './cameras/CameraRig';
export {FastFlyThrough,CrashZoom,WhipPan,SpeedRamp,CinematicReveal,SmoothOrbit} from './cameras/CinematicPresets';
export {DepthFinish} from './rendering/DepthFinish';
export {SHORT_FORMAT,LOW_POWER_CANVAS,PREVIEW_RENDER,CAMERA_CLIP} from './rendering/presets';
export {ease,mix,mix3,clamp} from './math';
export type {V3} from './math';

// Opt-in production capabilities; existing film imports retain their defaults.
export * as CinematicV2 from './v2';
