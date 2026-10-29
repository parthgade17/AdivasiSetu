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
      className={`btn btn-outline ${small ? 'btn-sm' : ''}`}
      onClick={onClick}
      aria-pressed={playing}
      title={playing ? t('stop') : `${t('listen')} (${lang.toUpperCase()})`}
    >
      {playing ? <Square size={13} /> : <Volume2 size={13} />} {playing ? t('stop') : t('listen')}
    </button>
  );
}
