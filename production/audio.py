"""Reusable kernels extracted from the original Film02 synth; no film timing/data.
NumPy/SciPy and FFmpeg are existing host tools. No voices, samples or network I/O.
"""
import json, math, subprocess, wave
from pathlib import Path
import numpy as np
from scipy import signal

def frame_to_sample(frame, fps=30, sample_rate=48000):
    if not math.isfinite(frame) or frame<0 or fps<=0 or sample_rate<=0:
        raise ValueError('Invalid frame clock')
    return math.floor(frame*sample_rate/fps+.5)

def envelope(n, sample_rate=48000, attack=.01, release=.08):
    if n<1 or attack<0 or release<0: raise ValueError('Invalid envelope')
    x=np.ones(n,np.float32);a=min(int(attack*sample_rate),n//2);r=min(int(release*sample_rate),n//2)
    if a:x[:a]=np.sin(np.linspace(0,np.pi/2,a))**2
    if r:x[-r:]=np.cos(np.linspace(0,np.pi/2,r))**2
    return x

def tone(duration,frequency,sample_rate=48000,decay=None,harmonics=(1,.25,.08)):
    if duration<=0 or frequency<=0 or frequency*len(harmonics)>=sample_rate/2:raise ValueError('Invalid/aliased oscillator')
    t=np.arange(round(duration*sample_rate))/sample_rate
    x=sum(a*np.sin(2*np.pi*frequency*(i+1)*t) for i,a in enumerate(harmonics))
    if decay is not None:
        if decay<=0:raise ValueError('Invalid decay')
        x*=np.exp(-t/decay)
    return x.astype(np.float32)

def filtered_noise(duration,rng,sample_rate=48000,low=100,high=5000):
    if not 0<low<high<sample_rate/2:raise ValueError('Invalid filter band')
    sos=signal.butter(2,[low,high],btype='bandpass',fs=sample_rate,output='sos')
    x=signal.sosfilt(sos,rng.standard_normal(round(duration*sample_rate))).astype(np.float32)
    return x/max(.2,float(np.std(x)))

def write_pcm24(path,x,sample_rate=48000):
    x=np.asarray(x)
    if x.ndim!=2 or x.shape[1]!=2 or not np.isfinite(x).all() or np.max(np.abs(x))>=1:
        raise ValueError('Expected finite unclipped stereo audio')
    v=np.rint(x*8388607).astype('<i4');packed=v.view(np.uint8).reshape(-1,4)[:,:3].copy().tobytes()
    with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(3);w.setframerate(sample_rate);w.writeframes(packed)

def measure_loudness(path):
    r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(path),'-vn','-af','loudnorm=I=-24:TP=-7:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    return json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1])

def narration_gain(measured,target_lufs=-24,ceiling_dbtp=-7):
    i=float(measured['input_i']);peak=float(measured['input_tp'])
    if not math.isfinite(i) or not math.isfinite(peak):raise ValueError('Cannot normalize a silent/nonfinite mix')
    return min(target_lufs-i,ceiling_dbtp-peak)

class AudioSession:
    def __init__(self,frames,fps=30,sample_rate=48000,seed=0):
        if not isinstance(frames,int) or frames<=0 or fps<=0 or sample_rate<22050:raise ValueError('Invalid session')
        self.frames=frames;self.fps=fps;self.sr=sample_rate;self.seed=seed
        self.samples=frame_to_sample(frames,fps,sample_rate);self.rng=np.random.default_rng(seed)
        self.buses={k:np.zeros((self.samples,2),np.float32) for k in ['music','sfx']};self.events=[]

    def add(self,bus,frame,x,gain=1.,pan=0.,cue_id=''):
        if bus not in self.buses or not 0<=frame<self.frames or not math.isfinite(gain) or gain<0 or not -1<=pan<=1:raise ValueError('Invalid audio event')
        start=frame_to_sample(frame,self.fps,self.sr);x=np.asarray(x,np.float32)
        if not np.isfinite(x).all():raise ValueError('Nonfinite audio')
        if x.ndim==1:x=np.column_stack((x*np.cos((pan+1)*np.pi/4),x*np.sin((pan+1)*np.pi/4)))
        if x.ndim!=2 or x.shape[1]!=2:raise ValueError('Expected mono or stereo audio')
        end=start+len(x)
        if end>self.samples:raise ValueError('Cue extends past film; trim explicitly')
        self.buses[bus][start:end]+=x*gain
        self.events.append(dict(id=cue_id,bus=bus,frame=frame,sample=start,durationSamples=len(x),gain=gain,pan=pan))

    def effect(self,kind,duration=.18,frequency=880):
        sr=self.sr;n=round(duration*sr);t=np.arange(n)/sr
        noise=lambda low=100,high=5000:filtered_noise(duration,self.rng,sr,low,high)
        osc=lambda f,decay=None:tone(duration,f,sr,decay)
        if kind in ['footstep','running-step']:
            x=(.7*osc(105 if kind=='running-step' else 84,.032)+.15*noise(450,4200)*np.exp(-t/.018)+.07*noise(180,1200)*np.exp(-((t-.045)/.025)**2))
        elif kind=='button':x=.25*noise(1000,7500)*np.exp(-t/.004)+.28*osc(frequency,.036)
        elif kind=='door':x=.22*noise(220,2600)+.10*osc(72)
        elif kind=='motor':x=.34*osc(48)+.12*noise(45,650)
        elif kind=='spark':x=noise(1400,min(10500,sr*.45))*np.exp(-t/.023)
        elif kind=='wind':x=.3*noise(90,2300)
        elif kind=='vehicle':
            phase=2*np.pi*np.cumsum(270-80*t/duration)/sr
            x=(.23*noise(100,1900)+.28*np.sin(phase)+.08*np.sin(phase*2))*np.exp(-((t-duration/2)/(duration*.22))**2)
        elif kind=='robot':x=.22*np.sin(2*np.pi*(610*t+130*t*t))+.07*noise(600,3500)
        elif kind=='impact':x=.7*np.sin(2*np.pi*(57*t-12*t*t))*np.exp(-t/.17)+.16*noise(120,5500)*np.exp(-t/.05)
        else:raise ValueError('Unsupported non-vocal effect '+kind)
        return (x*envelope(n,sr,.001 if kind in ['button','spark','footstep','running-step','impact'] else min(.18,duration/4),min(.15,duration/4))).astype(np.float32)

    def chord(self,duration,notes):
        if not notes or any(not isinstance(n,(int,float)) or n<12 or n>100 for n in notes):raise ValueError('Explicit instrumental MIDI notes required')
        n=round(duration*self.sr);t=np.arange(n)/self.sr;x=np.zeros((n,2),np.float32)
        for note in notes:
            f=440*2**((note-69)/12)
            for side,detune in enumerate([-.0017,.0017]):
                phase=2*np.pi*f*(1+detune)*t
                x[:,side]+=(np.sin(phase)+.18*np.sin(phase*2)+.035*np.sin(phase*3))/(len(notes)*1.2)
        return x*envelope(n,self.sr,min(.8,duration/3),min(.75,duration/3))[:,None]

    def finish(self,cut_frame=None):
        if cut_frame is not None:
            if not 0<cut_frame<=self.frames:raise ValueError('Invalid cut')
            cut=frame_to_sample(cut_frame,self.fps,self.sr);fade=min(240,cut)
            for x in self.buses.values():x[cut-fade:cut]*=np.linspace(1,0,fade)[:,None];x[cut:]=0
        return self.buses['music']+self.buses['sfx']
