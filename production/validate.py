"""Bounded-memory scene/full-film decode and audio validation; never renders."""
import argparse, hashlib,json,subprocess
from pathlib import Path
import numpy as np
from audio import measure_loudness

p=argparse.ArgumentParser();p.add_argument('--config',required=True);p.add_argument('--video',required=True);p.add_argument('--mode',choices=['preview','final'],required=True);p.add_argument('--audio',choices=['silent','present'],required=True);p.add_argument('--scene');p.add_argument('--metrics');p.add_argument('--out',required=True);a=p.parse_args()
c=json.loads(Path(a.config).read_text(encoding='utf8'));start=0;frames=c['frames']
if a.scene:
    s=next(s for s in c['scenes'] if s['id']==a.scene);start=s['start'];frames=s['end']-start
scale=.5 if a.mode=='preview' else 1;w=int(c['width']*scale);h=int(c['height']*scale)
out=Path(a.out)
if out.exists():raise SystemExit('Use a new validation output directory')
out.mkdir(parents=True)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',a.video]));v=next(s for s in meta['streams'] if s['codec_type']=='video');audio=[s for s in meta['streams'] if s['codec_type']=='audio']
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(w,h,'30/1',frames)
assert abs(float(meta['format']['duration'])-frames/c['fps'])<.05
assert len(audio)==(0 if a.audio=='silent' else 1)
subprocess.run(['ffmpeg','-v','error','-xerror','-i',a.video,'-f','null','-'],check=True)
expected={f for x,y in c.get('intentionalBlack',[]) for f in range(max(x,start),min(y,start+frames))};black=[];uniform=[]
with (out/'decode-errors.log').open('wb') as err:
    proc=subprocess.Popen(['ffmpeg','-v','error','-i',a.video,'-vf','scale=90:160','-an','-pix_fmt','gray','-f','rawvideo','-'],stdout=subprocess.PIPE,stderr=err)
    count=0
    try:
        while True:
            b=proc.stdout.read(90*160)
            if not b:break
            assert len(b)==90*160,'Truncated frame'
            pixels=np.frombuffer(b,np.uint8);f=count+start
            if pixels.max()<4:black.append(f)
            if pixels.std()<.5 and f not in expected:uniform.append(f)
            count+=1
    finally:proc.stdout.close();proc.wait()
    assert proc.returncode==0 and count==frames
assert set(black)==expected,(black,sorted(expected));assert not uniform,uniform
measurement=measure_loudness(a.video) if audio else None
if measurement:assert float(measurement['input_tp'])<0,'Audio clips or exceeds true-peak headroom'
metrics=None
if a.metrics:
    metrics=json.loads(Path(a.metrics).read_text());assert not metrics.get('errors');assert metrics['metrics'] and all(m['drawingBuffer']==[w,h] for m in metrics['metrics'])
elif a.mode=='final':raise AssertionError('Native final requires --metrics= render checkpoint / performance JSON')
report=dict(width=w,height=h,fps=30,frames=frames,globalFrameStart=start,duration=frames/30,audioStreams=len(audio),decodePassed=True,blackFrames=black,audioLoudness=measurement,actualBufferEvidence=bool(metrics),sha256=hashlib.sha256(Path(a.video).read_bytes()).hexdigest())
receipt=Path(a.video).with_name(Path(a.video).name+'.validated.json')
if receipt.exists():assert json.loads(receipt.read_text())['sha256']==report['sha256'],'Existing receipt is for different media; preserve it and use a new revision'
else:receipt.write_text(json.dumps(report,indent=2))
(out/'validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
