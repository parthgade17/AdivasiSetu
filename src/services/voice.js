// Enhanced Multilingual Voice Services for AdivasiSetu - SIH 2026
// Supports Web Speech API Text-to-Speech (TTS) and Speech-to-Text (STT) across all Indian languages.

export const SPEECH_LANG = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  as: 'as-IN',
  sat: 'hi-IN', // Browser STT/TTS fallback for Santali
  ur: 'ur-IN',
  mai: 'hi-IN',
  kok: 'mr-IN',
  doi: 'hi-IN',
  ne: 'ne-NP',
  sd: 'hi-IN',
  sa: 'sa-IN',
  brx: 'as-IN',
  ks: 'ur-IN',
  mni: 'bn-IN',
};

// Warm up speech synthesis voices on load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try { window.speechSynthesis.getVoices(); } catch (e) {
      console.warn('Voice load issue:', e);
    }
  };
}

export function speak(text, lang = 'en', onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel();
    if (!text) {
      if (onEnd) onEnd();
      return true;
    }
    const u = new SpeechSynthesisUtterance(text);
    const targetCode = SPEECH_LANG[lang] || 'en-IN';
    u.lang = targetCode;
    u.rate = 0.95;
    u.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = targetCode.split('-')[0].toLowerCase();
      const exact = voices.find((v) => v.lang.replace('_', '-').toLowerCase() === targetCode.toLowerCase());
      const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      const indianVoice = voices.find((v) => v.lang.toLowerCase().includes('in'));
      const voice = exact || prefixMatch || (lang !== 'en' ? indianVoice : null) || voices[0];
      if (voice) u.voice = voice;
    }

    u.onend = () => { if (onEnd) onEnd(); };
    u.onerror = (e) => {
      console.warn('TTS error/interrupted:', e);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(u);
    return true;
  } catch (err) {
    console.error('TTS failure:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function listen(lang, onText, onEnd, onError) {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  try {
    const r = new SR();
    r.lang = SPEECH_LANG[lang] || 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onresult = (e) => {
      if (e.results && e.results[0] && e.results[0][0]) {
        onText(e.results[0][0].transcript);
      }
    };

    r.onend = () => {
      if (onEnd) onEnd();
    };

    r.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      if (onError) onError(e.error);
      else if (onEnd) onEnd();
    };

    r.start();
    return r;
  } catch (err) {
    console.error('Speech recognition start failed:', err);
    if (onEnd) onEnd();
    return null;
  }
}

// AI Voice Assistant Query Engine
// Responds to user queries across all languages and directs them to the right feature
export function getAssistantReply(query, lang = 'en', t) {
  const q = (query || '').toLowerCase().trim();

  // Keyword check helper
  const matches = (keywords) => keywords.some((k) => q.includes(k.toLowerCase()));

  // 1. Eligibility Check
  if (
    matches([
      'eligib', 'qualif', 'check', 'पात्रता', 'पात्र', 'योग्य', 'अर्ह', 'যোজ্য', 'যোগ্যতা',
      'అర్హత', 'தகுதி', 'પાત્રતા', 'ಅರ್ಹತೆ', 'യോഗ്യത', 'ଯୋଗ୍ୟତା', 'ਯੋਗਤਾ', 'পাতেয়'
    ])
  ) {
    return {
      answer: t ? t('voiceReplyEligible') : 'Check your eligibility by entering class, state, and income in the Eligibility Checker.',
      actionText: t ? t('voiceNavEligibility') : 'Check Eligibility',
      actionRoute: '/eligibility',
    };
  }

  // 2. Documents & DigiLocker
  if (
    matches([
      'doc', 'certif', 'digilocker', 'caste', 'income', 'domicile', 'दस्तावेज़', 'कागजात',
      'प्रमाण पत्र', 'कागदपत्रे', 'নথি', 'సర్టిఫికెట్', 'పత్రాలు', 'ஆவணங்கள்', 'દસ્તાવેજ',
      'ದಾಖಲೆ', 'രേഖകൾ', 'ଦଲିଲ', 'ਦਸਤਾਵੇਜ਼', 'কাকত', 'ᱠᱟᱜᱚᱡᱽ'
    ])
  ) {
    return {
      answer: t ? t('voiceReplyDocs') : 'Required documents include ST caste certificate, income certificate, domicile, marksheet and bank passbook.',
      actionText: t ? t('voiceNavDocs') : 'Go to Documents',
      actionRoute: '/documents',
    };
  }

  // 3. Schemes / Scholarships
  if (
    matches([
      'scheme', 'scholarship', 'list', 'amount', 'money', 'छात्रवृत्ति', 'योजना', 'शिष्यवृत्ती',
      'স্কলারশিপ', 'స్కాలర్‌షిప్', 'உதவித்தொகை', 'શિષ્યવૃત્તિ', 'ವಿದ್ಯಾರ್ಥಿವೇತನ', 'സ്കോളർഷിപ്പ്',
      'ବୃତ୍ତି', 'ਵਜ਼ੀਫ਼ਾ', 'জলপানী', 'ᱥᱠᱚᱞᱟᱨᱥᱤᱯ'
    ])
  ) {
    return {
      answer: t ? t('voiceReplySchemes') : 'AdivasiSetu offers 47+ schemes including Pre-Matric, Post-Matric, and National Fellowships for ST students.',
      actionText: t ? t('voiceNavSchemes') : 'View Scholarships',
      actionRoute: '/scholarships',
    };
  }

  // 4. Offline Mode
  if (
    matches([
      'offline', 'internet', 'network', 'signal', 'ऑफ़लाइन', 'इंटरनेट', 'नेटवर्क', 'ऑफलाइन',
      'অফলাইন', 'ఆఫ్‌లైన్', 'ஆஃப்லைன்', 'ઑફલાઇન', 'ಆಫ್‌ಲೈನ್', 'ഓഫ്‌ലൈൻ', 'ଅଫଲାଇନ୍', 'ਔਫਲਾਈਨ', 'ᱚᱯᱷᱞᱟᱭᱤᱱ'
    ])
  ) {
    return {
      answer: t ? t('voiceReplyOffline') : 'AdivasiSetu works 100% offline! Forms are saved on your phone and submit automatically when signal returns.',
      actionText: null,
      actionRoute: null,
    };
  }

  // 5. Default General Greeting / Help
  return {
    answer: t ? t('voiceReplyGeneral') : 'I can help you find ST scholarships, check eligibility, upload documents, or track your application.',
    actionText: t ? t('voiceNavSchemes') : 'View Scholarships',
    actionRoute: '/scholarships',
  };
}
