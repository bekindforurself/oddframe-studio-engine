import type {Emotion,Gesture} from './humanArt';
/** Existing human-art expression names; not the earlier geometric-character system. */
export const HUMAN_EXPRESSIONS=['tired','hopeful','happy','asleep','yawn','angry','confused','shocked','relaxed'] as const satisfies readonly Emotion[];
/** Poses supported by the extracted improved arm solver. */
export const RIG_POSES=['idle','desk','walk','point','pay','receive','self','sleep','shrug','offer','tap','storm','freeze','yawn'] as const satisfies readonly Gesture[];
