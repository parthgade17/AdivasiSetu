// Automatic DOM Full-Page Translator Synchronization for AdivasiSetu
// Ensures the entire website's content changes language, not just key labels.

const GOOGLE_LANG_MAP = {
  en: 'en',
  hi: 'hi',
  mr: 'mr',
  bn: 'bn',
  te: 'te',
  ta: 'ta',
  gu: 'gu',
  kn: 'kn',
  ml: 'ml',
  or: 'or',
  pa: 'pa',
  as: 'as',
  sat: 'hi', // Ol Chiki fallback to Hindi for web translator if needed
  ur: 'ur',
  mai: 'hi',
  kok: 'mr',
  doi: 'hi',
  ne: 'ne',
  sd: 'sd',
  sa: 'sa',
  brx: 'as',
  ks: 'ur',
  mni: 'bn',
};

export function syncDOMTranslation(langCode) {
  if (typeof document === 'undefined') return;

  try {
    document.documentElement.lang = langCode;

    const targetLang = GOOGLE_LANG_MAP[langCode] || langCode;
    const isEnglish = targetLang === 'en';
    const cookieVal = isEnglish ? '/en/en' : `/en/${targetLang}`;

    // Set translation cookies
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${cookieVal}; domain=${window.location.hostname}; path=/;`;
    }

    // Trigger Google Translate combo if loaded
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      if (select.value !== targetLang) {
        select.value = isEnglish ? '' : targetLang;
        select.dispatchEvent(new Event('change'));
      }
    }
  } catch (err) {
    console.warn('DOM translation sync failed:', err);
  }
}

// Ensures Google Translate script is embedded cleanly without disturbing UI
export function initGoogleTranslateScript() {
  if (typeof window === 'undefined') return;
  if (window.google && window.google.translate) return;
  if (document.getElementById('google-translate-script')) return;

  window.googleTranslateElementInit = () => {
    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,bn,te,ta,gu,kn,ml,or,pa,as,ur,ne,sa,sd',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    } catch (e) {
      console.warn('Translate element init skipped:', e);
    }
  };

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
}
