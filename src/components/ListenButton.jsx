import { useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speak, stopSpeaking } from '../services/voice';

export default function ListenButton({ scheme, small = true }) {
  const { t, lang, toast } = useApp();
  const [playing, setPlaying] = useState(false);

  const onClick = (e) => {
    e.stopPropagation();
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const text = t('ttsScheme', {
      name: scheme.name || '',
      amount: scheme.amount || '',
      period: scheme.period || '',
      deadline: scheme.deadline || '',
      description: scheme.description || '',
    });

    if (speak(text, lang, () => setPlaying(false))) {
      setPlaying(true);
    } else {
      toast(t('voiceUnsupported'), 'error');
    }
  };

  return (
    <button
      className={`btn ${playing ? 'btn-saffron' : 'btn-outline'} ${small ? 'btn-sm' : ''}`}
      onClick={onClick}
      aria-pressed={playing}
      title={playing ? t('stop') : `${t('listen')} (${lang.toUpperCase()})`}
      style={{display:'inline-flex', alignItems:'center', gap:6, transition:'all 0.2s'}}
    >
      {playing ? <Square size={13} /> : <Volume2 size={13} />}
      <span>{playing ? t('stop') : t('listen')}</span>
      {playing && (
        <span className="soundwave-container" style={{height:12, marginLeft:2}}>
          <span className="soundwave-bar" style={{background:'white', width:2}}/>
          <span className="soundwave-bar" style={{background:'white', width:2}}/>
          <span className="soundwave-bar" style={{background:'white', width:2}}/>
        </span>
      )}
    </button>
  );
}
