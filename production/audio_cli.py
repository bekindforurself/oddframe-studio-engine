"""Render only explicitly authored music/SFX cues. No implicit Film02 story."""
import argparse,json
from pathlib import Path
from audio import AudioSession,write_pcm24,measure_loudness,narration_gain

p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--out',required=True);a=p.parse_args()
c=json.loads(Path(a.config).read_text(encoding='utf8'))
if c.get('status')!='ready' or not c.get('audioCues'):raise SystemExit('Ready production and authored audio cues required')
out=Path(a.out)
if out.exists():raise SystemExit('Use a new output revision; existing audio is preserved')
session=AudioSession(c['frames'],c['fps'],seed=c.get('audioSeed',0))
for cue in c['audioCues']:
    duration=cue.get('durationFrames',6)/c['fps']
    x=session.chord(duration,cue['notes']) if cue['effect']=='chord' else session.effect(cue['effect'],duration,cue.get('frequency',880))
    session.add(cue['bus'],cue['frame'],x,cue.get('gain',.1),cue.get('pan',0),cue['id'])
mix=session.finish(c.get('audioCutFrame'));out.mkdir(parents=True)
write_pcm24(out/'unleveled.wav',mix,session.sr)
measured=measure_loudness(out/'unleveled.wav');db=narration_gain(measured);gain=10**(db/20)
for bus,x in session.buses.items():write_pcm24(out/(bus+'.wav'),x*gain,session.sr)
write_pcm24(out/'music-and-sfx.wav',mix*gain,session.sr)
(out/'audio-checkpoint.json').write_text(json.dumps(dict(seed=session.seed,sampleRate=session.sr,frames=c['frames'],gainDb=db,rawMeasurement=measured,events=session.events,source='Original deterministic synthesis; no voice or third-party recordings'),indent=2))
print('Original music/SFX completed:',out)
