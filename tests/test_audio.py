import ast,sys,tempfile,unittest,wave
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'production'))
from audio import AudioSession,envelope,tone,frame_to_sample,write_pcm24,narration_gain

class AudioTests(unittest.TestCase):
    def test_frame_alignment_determinism_and_stem_sum(self):
        def make():
            s=AudioSession(30,seed=2126)
            for frame in [2,10,20]:s.add('sfx',frame,s.effect('button',.08),.1,cue_id=str(frame))
            s.add('music',0,s.chord(.8,[48,55,62]),.01)
            return s,s.finish(29)
        a,x=make();b,y=make();np.testing.assert_array_equal(x,y)
        np.testing.assert_array_equal(x,a.buses['music']+a.buses['sfx'])
        self.assertEqual([e['sample'] for e in a.events[:3]],[3200,16000,32000]);self.assertFalse(np.any(x[29*1600:]));self.assertEqual(frame_to_sample(327),523200)
        self.assertEqual(frame_to_sample(.0003125,30,48000),1)
    def test_headroom_guard_and_pcm(self):
        self.assertEqual(narration_gain({'input_i':-31.33,'input_tp':-11.40}),4.4)
        with self.assertRaises(ValueError):narration_gain({'input_i':'-inf','input_tp':'-inf'})
        with self.assertRaises(ValueError):write_pcm24('unused.wav',np.ones((10,2)))
        s=AudioSession(30);x=s.effect('footstep');s.add('sfx',0,x,.1)
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'audio.wav';write_pcm24(p,s.finish())
            with wave.open(str(p)) as w:self.assertEqual((w.getnchannels(),w.getsampwidth(),w.getframerate(),w.getnframes()),(2,3,48000,48000))
        with self.assertRaises(ValueError):s.add('sfx',29,x)
        with self.assertRaises(ValueError):s.effect('voice')
    def test_all_non_vocal_presets(self):
        for effect in ['footstep','running-step','button','door','motor','spark','wind','vehicle','robot','impact']:
            x=AudioSession(30,seed=7).effect(effect,.15)
            self.assertEqual(len(x),7200);self.assertTrue(np.isfinite(x).all());self.assertGreater(float(np.std(x)),0)
    def test_film02_extraction_parity_when_host_available(self):
        # Compare proven kernel output without executing the film's audio script.
        source=Path(__file__).resolve().parents[2]/'scripts/film02-final-audio.py'
        if not source.exists():self.skipTest('Film02 host source is intentionally not published')
        tree=ast.parse(source.read_text());nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['env','tone']]
        scope={'np':np,'SR':48000};exec(compile(ast.Module(body=nodes,type_ignores=[]),str(source),'exec'),scope)
        np.testing.assert_array_equal(envelope(9600),scope['env'](9600))
        np.testing.assert_array_equal(tone(.2,880,decay=.036),scope['tone'](.2,880,.036))

if __name__=='__main__':unittest.main()
