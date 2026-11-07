import {useFrame} from '@react-three/fiber';
import {Vector2} from 'three';
/** Opt-in evidence of the real WebGL buffer, sampled at scene boundaries. */
export function DrawingBufferProbe({frame,sampleFrames=[0]}:{frame:number;sampleFrames?:readonly number[]}) {
  // Positive R3F priorities take over rendering. A passive probe must use zero.
  useFrame(({gl})=>{if(sampleFrames.includes(frame))console.log('ODDFRAME_METRICS '+JSON.stringify({frame,drawingBuffer:gl.getDrawingBufferSize(new Vector2()).toArray()}));});
  return null;
}
