/** Film03-derived technical helpers. Horizontal surface / world XY insert only. */
import {ease,type V3} from '../math';
export type SurfacePressSpec={frame:number;surface:V3;travel:number;anticipation:number;down:number;hold:number;release:number;recovery:number;hoverHeight:number;hoverX:number;clearance:number};
export type SurfacePressState={depression:number;lift:number;tip:V3;active:boolean};
const finite=(values:number[])=>values.every(Number.isFinite);
export function sampleSurfacePress(spec:SurfacePressSpec,frame:number):SurfacePressState{
 const durations=[spec.anticipation,spec.down,spec.release,spec.recovery];
 if(!Number.isInteger(frame)||frame<0||!Number.isInteger(spec.frame)||spec.frame<0||durations.some(n=>!Number.isInteger(n)||n<1)||!Number.isInteger(spec.hold)||spec.hold<0||spec.surface.length!==3||!finite([...spec.surface,spec.travel,spec.hoverHeight,spec.hoverX,spec.clearance])||spec.travel<=0||spec.hoverHeight<0||spec.clearance<=0)throw Error('Invalid horizontal surface press');
 const age=frame-spec.frame,approach=ease((age+spec.down+spec.anticipation)/spec.anticipation),recovery=ease((age-spec.hold-spec.release)/spec.recovery);
 const depression=spec.travel*ease((age+spec.down)/spec.down)*(1-ease((age-spec.hold)/spec.release));
 const lift=spec.hoverHeight*(1-approach+recovery),offset=spec.hoverX*(1-approach+recovery);
 return {depression,lift,tip:[spec.surface[0]+offset,spec.surface[1]-depression+lift+spec.clearance,spec.surface[2]],active:age>=-spec.down-spec.anticipation&&age<spec.hold+spec.release+spec.recovery};
}
export type PixelTip={x:number;y:number};
/** Full RGBA silhouette, including outline. Coordinates are pixel boundaries, not centers. */
export function lowestOpaquePoint(rgba:ArrayLike<number>,width:number,height:number,threshold=16):PixelTip{
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||rgba.length!==width*height*4||!Number.isInteger(threshold)||threshold<0||threshold>254)throw Error('Invalid RGBA silhouette');
 for(let y=height-1;y>=0;y--){let left=width,right=-1;
  for(let x=0;x<width;x++)if(rgba[(y*width+x)*4+3]>threshold){left=Math.min(left,x);right=Math.max(right,x);}
  if(right>=0)return {x:(left+right+1)/2,y:y+1};
 }
 throw Error('Empty contact silhouette');
}
/** Anchor an upright XY plane. No perspective-only contact or general collision claim. */
export function alignContactPlane(tip:V3,pixelTip:PixelTip,width:number,height:number,unitsPerPixel:number):V3{
 if(tip.length!==3||!finite([...tip,pixelTip.x,pixelTip.y,width,height,unitsPerPixel])||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||unitsPerPixel<=0||pixelTip.x<0||pixelTip.x>width||pixelTip.y<0||pixelTip.y>height)throw Error('Invalid contact plane');
 return [tip[0]+(width/2-pixelTip.x)*unitsPerPixel,tip[1]+(pixelTip.y-height/2)*unitsPerPixel,tip[2]];
}
