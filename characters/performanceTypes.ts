export type FacePerformance={gazeX:number;gazeY:number;brow:number;asymmetry:number;eyeOpen:number;mouth:'neutral'|'awe'|'worry'|'resolve'};
export type IllustrationPerformance={lean:number;sway:number;headTilt:number;headNod:number;face:FacePerformance;clothingDetail?:boolean};
