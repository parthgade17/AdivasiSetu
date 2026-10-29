import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, X, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { speak, stopSpeaking, listen, getAssistantReply } from '../services/voice';
import { LANGUAGES } from '../i18n';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useApp();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const langLabel = currentLangObj.native || currentLangObj.label;

  // Initialize greeting on language change
  useEffect(() => {
    const greeting = t('voiceAssistantGreeting', { lang: langLabel });
    setMessages([
      {
        id: 'initial',
        sender: 'bot',
        text: greeting,
        actionText: t('voiceNavEligibility'),
        actionRoute: '/eligibility',
      },
    ]);
  }, [lang, langLabel, t]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = (queryText) => {
    const q = (queryText || inputText).trim();
    if (!q) return;

    // Add user message
    const userMsgId = `u-${Date.now()}`;
    const botMsgId = `b-${Date.now()}`;

    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: q }]);
    setInputText('');

    // Generate reply in selected language
    const reply = getAssistantReply(q, lang, t);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: reply.answer,
          actionText: reply.actionText,
          actionRoute: reply.actionRoute,
        },
      ]);

      // Read aloud in current language
      setSpeaking(true);
      speak(reply.answer, lang, () => setSpeaking(false));
    }, 300);
  };

  const startVoiceInput = () => {
    if (listening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      setListening(false);
      return;
    }

    stopSpeaking();
    setSpeaking(false);
    setListening(true);

    const r = listen(
      lang,
      (text) => {
        setListening(false);
        handleSend(text);
      },
      () => setListening(false),
      (err) => {
        console.warn('Voice recognition error:', err);
        setListening(false);
      }
    );

    if (r) {
      recognitionRef.current = r;
    } else {
      setListening(false);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setSpeaking(false);
  };

  return (
    <>
      {/* Floating Launcher Pill / Button */}
      {!open && (
        <button
          className="voice-assistant-fab"
          onClick={() => setOpen(true)}
          title={`${t('voiceAssistant')} (${langLabel})`}
          aria-label={t('voiceAssistant')}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #003366 0%, #1A5FAD 100%)',
            color: 'white',
            border: '2px solid rgba(255, 107, 26, 0.5)',
            boxShadow: '0 8px 24px rgba(0, 33, 71, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FF6B1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 107, 26, 0.4)',
            }}
          >
            <Mic size={18} color="white" />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2px' }}>
              {t('voiceAssistant')}
            </div>
            <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 500 }}>
              {langLabel} · {t('listen')}
            </div>
          </div>
        </button>
      )}

      {/* Floating Voice Assistant Modal Window */}
      {open && (
        <div
          className="voice-assistant-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 48px)',
            background: 'white',
            borderRadius: '18px',
            boxShadow: '0 16px 48px rgba(0, 33, 71, 0.28), 0 0 0 1px rgba(0, 51, 102, 0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #002B55 0%, #004488 100%)',
              color: 'white',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #FF6B1A',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#FF6B1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                  {t('voiceAssistantTitle')}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  {t('voiceAssistantSubtitle')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {speaking ? (
                <button
                  onClick={handleStopSpeaking}
                  title="Stop speaking"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#FFD700',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Volume2 size={15} />
                </button>
              ) : null}

              <button
                onClick={() => {
                  stopSpeaking();
                  setOpen(false);
                }}
                title={t('close')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Language Selector Bar inside Assistant */}
          <div
            style={{
              padding: '8px 14px',
              background: '#F0F4FA',
              borderBottom: '1px solid #DDE1EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
            }}
          >
            <span style={{ color: '#4B5470', fontWeight: 600 }}>🌐 {t('language')}:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#003366',
                background: 'white',
                border: '1px solid #CBD2E0',
                borderRadius: 6,
                padding: '3px 8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Status Banner when listening or speaking */}
          {listening && (
            <div
              style={{
                background: '#FFF3DC',
                color: '#D4800A',
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid #FFE4B2',
                animation: 'pulse 1.5s infinite',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#FF6B1A',
                }}
              />
              {t('listeningInLang', { lang: langLabel })}
            </div>
          )}

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#FAFBFD',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius:
                      m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.sender === 'user' ? '#003366' : 'white',
                    color: m.sender === 'user' ? 'white' : '#1E2541',
                    fontSize: 13,
                    lineHeight: 1.45,
                    boxShadow:
                      m.sender === 'user'
                        ? '0 2px 6px rgba(0,51,102,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E6F0',
                  }}
                >
                  {m.text}
                </div>

                {m.actionText && m.actionRoute && (
                  <button
                    onClick={() => {
                      navigate(m.actionRoute);
                      setOpen(false);
                    }}
                    style={{
                      marginTop: 6,
                      background: 'linear-gradient(135deg, #FF6B1A, #E55A0A)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(255,107,26,0.25)',
                    }}
                  >
                    <span>{m.actionText}</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts / Chips */}
          <div
            style={{
              padding: '8px 12px',
              background: '#F4F6FB',
              borderTop: '1px solid #E2E6F0',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {[
              t('voiceQuickPrompt1'),
              t('voiceQuickPrompt2'),
              t('voiceQuickPrompt3'),
              t('voiceQuickPrompt4'),
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#003366',
                  background: 'white',
                  border: '1px solid #CBD2E0',
                  borderRadius: 14,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#003366';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#003366';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box + Voice Microphone */}
          <div
            style={{
              padding: '10px 12px',
              background: 'white',
              borderTop: '1px solid #DDE1EE',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <button
              onClick={startVoiceInput}
              title={listening ? 'Stop listening' : `Speak in ${langLabel}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: listening ? '#C0392B' : '#FF6B1A',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: listening
                  ? '0 0 12px rgba(192, 57, 43, 0.6)'
                  : '0 2px 6px rgba(255, 107, 26, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('askVoicePlaceholder', { lang: langLabel })}
              style={{
                flex: 1,
                border: '1.5px solid #DDE1EE',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                outline: 'none',
                color: '#1E2541',
              }}
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              style={{
                padding: '8px 14px',
                background: inputText.trim() ? '#003366' : '#E2E6F0',
                color: inputText.trim() ? 'white' : '#9AA3BC',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: inputText.trim() ? 'pointer' : 'default',
              }}
            >
              {t('submit')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
