"""Film03-derived cue retiming and retained-music mixing. No I/O, synthesis or voices."""
import copy,math
import numpy as np

def retime_sfx_cues(cues, changes, frames):
    if type(frames) is not int or frames<1 or not isinstance(changes,dict):
        raise ValueError('Invalid cue clock')
    result=copy.deepcopy(cues);seen=set()
    for cue in result:
        cue_id=cue.get('id')
        if not isinstance(cue_id,str) or not cue_id or cue_id in seen or cue.get('bus') not in ['music','sfx']:
            raise ValueError('Invalid or duplicate cue')
        seen.add(cue_id)
        if cue_id in changes:
            if cue['bus']!='sfx':raise ValueError('Retained music cannot be retimed')
            cue['frame']=changes[cue_id]
        frame=cue.get('frame');duration=cue.get('durationFrames',1)
        if type(frame) is not int or frame<0 or type(duration) is not int or duration<1 or frame+duration>frames:
            raise ValueError('Cue outside film')
    if set(changes)-seen:raise ValueError('Unknown cue ID')
    return result

def mix_preserved_music(music,sfx,gain_db=0):
    music=np.asarray(music);sfx=np.asarray(sfx)
    if music.ndim!=2 or music.shape[1]!=2 or music.shape[0]<1 or sfx.shape!=music.shape or not np.isfinite(music).all() or not np.isfinite(sfx).all() or not math.isfinite(gain_db):
        raise ValueError('Expected finite matching stereo buses')
    try:gain=10**(gain_db/20)
    except OverflowError as exc:raise ValueError('Invalid SFX gain') from exc
    mix=music+sfx*gain
    if not np.isfinite(mix).all() or np.max(np.abs(mix))>=1:raise ValueError('Clipped or nonfinite mix')
    return mix
