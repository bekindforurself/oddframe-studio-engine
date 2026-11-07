"""Add the original instrumental bed without re-encoding locked picture."""
import argparse,json,subprocess
from pathlib import Path
from audio import measure_loudness

def probe(p):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
def video_hash(p):return subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).decode().strip()
p=argparse.ArgumentParser();p.add_argument('--video',required=True);p.add_argument('--audio',required=True);p.add_argument('--out',required=True);a=p.parse_args()
out=Path(a.out);record=out.with_suffix('.mux.json')
if out.exists() or record.exists():raise SystemExit('Existing output/checkpoint preserved; choose a new revision')
v=probe(a.video);s=probe(a.audio)
assert not any(x['codec_type']=='audio' for x in v['streams']),'Input must be the silent master'
tracks=[x for x in s['streams'] if x['codec_type']=='audio'];assert len(tracks)==1 and tracks[0]['channels']==2 and tracks[0]['sample_rate']=='48000'
duration=float(v['format']['duration']);assert abs(float(s['format']['duration'])-duration)<1/48000+.00001,'Audio must match picture duration'
before=video_hash(a.video);out.parent.mkdir(parents=True,exist_ok=True)
subprocess.run(['ffmpeg','-hide_banner','-nostats','-n','-i',a.video,'-i',a.audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-t',str(duration),'-movflags','+faststart',str(out)],check=True)
after=video_hash(out);assert before==after,'Picture essence changed'
loud=measure_loudness(out);assert float(loud['input_tp'])<0,'Clipping in encoded mix'
record.write_text(json.dumps(dict(videoEssence=after,pictureUnchanged=True,duration=duration,audioMeasurement=loud,narrationIncluded=False),indent=2))
print('Stream-copy picture identity verified:',out)
