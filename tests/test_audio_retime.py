import copy,json,sys,unittest
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'production'))
from audio_retime import retime_sfx_cues,mix_preserved_music

class AudioRetimeTests(unittest.TestCase):
    def test_sync_and_nonmutation(self):
        cues=[dict(id='click',bus='sfx',frame=10,durationFrames=3),dict(id='erase',bus='sfx',frame=14,durationFrames=8),dict(id='bed',bus='music',frame=0,durationFrames=60)]
        before=copy.deepcopy(cues);out=retime_sfx_cues(cues,{'erase':28},60)
        self.assertEqual(out[0],cues[0]);self.assertEqual(out[1]['frame'],28);self.assertEqual(out[2],cues[2]);self.assertEqual(cues,before)
        self.assertEqual(out[1]['frame']*1600,44800)
    def test_invalid_changes_fail_closed(self):
        cues=[dict(id='bed',bus='music',frame=0),dict(id='erase',bus='sfx',frame=4,durationFrames=10)]
        for change in [{'bed':2},{'absent':3},{'erase':-1},{'erase':51},{'erase':True},{'erase':1.5}]:
            with self.assertRaises(ValueError):retime_sfx_cues(cues,change,60)
        with self.assertRaises(ValueError):retime_sfx_cues(cues+cues,{},60)
    def test_retained_music_stereo_gain_and_clipping(self):
        music=np.array([[.03,.02],[-.02,.01]],np.float32);sfx=np.array([[.1,-.1],[.05,.02]],np.float32)
        before=music.copy();mix=mix_preserved_music(music,sfx,-6)
        np.testing.assert_array_equal(music,before);np.testing.assert_array_equal(mix_preserved_music(music,np.zeros_like(music)),music)
        np.testing.assert_allclose(mix-music,sfx*10**(-6/20),atol=1e-8)
        for x,y,db in [(music,sfx[:1],0),(music,np.ones_like(music),6),(music,sfx,float('nan')),(music,sfx,100000)]:
            with self.assertRaises(ValueError):mix_preserved_music(x,y,db)
    def test_film03_recipe_retains_music_and_click_clock(self):
        base=Path(__file__).resolve().parents[2];original=base/'backups/film03-refinement-before/source/production.json';current=base/'src/oddframe/film03-production/production.json'
        if not original.exists() or not current.exists():self.skipTest('Host source/backup not published')
        a=json.loads(original.read_text());b=json.loads(current.read_text());changes={c['id']:c['frame'] for c in b['audioCues'] if c['id'].startswith(('erase-','suction-'))}
        self.assertEqual(retime_sfx_cues(a['audioCues'],changes,960),b['audioCues'])
        self.assertEqual([c for c in a['audioCues'] if c['bus']=='music'],[c for c in b['audioCues'] if c['bus']=='music'])

if __name__=='__main__':unittest.main()
