import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, setToken } from '../services/api';
import { evaluateLocal } from '../services/eligibility';
import { makeT } from '../i18n';
import { syncDOMTranslation, initGoogleTranslateScript } from '../utils/translator';

const Ctx = createContext(null);
const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const CACHE_KEYS = ['as_user', 'as_acting', 'as_queue', 'as_c_schemes', 'as_c_apps', 'as_c_docs', 'as_c_notifs', 'as_c_profile'];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => read('as_user', null));
  const [lang, setLangState] = useState(() => localStorage.getItem('as_lang') || 'en');
  const [acting, setActingState] = useState(() => read('as_acting', null));
  const [netOnline, setNetOnline] = useState(navigator.onLine);
  const [simOffline, setSimOffline] = useState(() => read('as_sim_offline', false));
  const [queue, setQueue] = useState(() => read('as_queue', []));
  const [schemes, setSchemes] = useState(() => read('as_c_schemes', []));
  const [apps, setApps] = useState(() => read('as_c_apps', []));
  const [documents, setDocuments] = useState(() => read('as_c_docs', []));
  const [notifications, setNotifications] = useState(() => read('as_c_notifs', []));
  const [profile, setProfile] = useState(() => read('as_c_profile', {}));
  const [config, setConfig] = useState(() => read('as_config', { demoMode: false, otpResendSeconds: 30 }));
  const [loading, setLoading] = useState(false);
  const [toastState, setToastState] = useState(null);

  const online = netOnline && !(config.demoMode && simOffline);
  const t = useMemo(() => makeT(lang), [lang]);
  const role = user?.role;
  const studentParams = useMemo(
    () => (role === 'student' ? {} : acting ? { student_id: acting.id } : null),
    [role, acting]
  );

  // Persist caches so the app opens with data even without network.
  useEffect(() => write('as_queue', queue), [queue]);
  useEffect(() => write('as_c_schemes', schemes), [schemes]);
  useEffect(() => write('as_c_apps', apps), [apps]);
  useEffect(() => write('as_c_docs', documents), [documents]);
  useEffect(() => write('as_c_notifs', notifications), [notifications]);
  useEffect(() => write('as_c_profile', profile), [profile]);
  useEffect(() => write('as_sim_offline', simOffline), [simOffline]);

  useEffect(() => {
    initGoogleTranslateScript();
    syncDOMTranslation(lang);
  }, [lang]);

  useEffect(() => {
    api.config().then((c) => { setConfig(c); write('as_config', c); }).catch(() => {});
  }, []);

  useEffect(() => {
    const on = () => setNetOnline(true), off = () => setNetOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const toastTimer = useRef();
  const toast = useCallback((msg, kind = 'info') => {
    setToastState({ msg, kind });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(null), 3800);
  }, []);

  const clearLocal = useCallback(() => {
    setToken(null);
    CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
    setUser(null); setActingState(null); setQueue([]); setSchemes([]); setApps([]);
    setDocuments([]); setNotifications([]); setProfile({});
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const tasks = [api.schemes(studentParams || {}).then(setSchemes)];
    if (studentParams) {
      tasks.push(api.applications(studentParams).then(setApps));
      tasks.push(api.documents(studentParams).then(setDocuments));
      tasks.push(api.notifications(studentParams).then(setNotifications));
      tasks.push(api.getProfile(studentParams).then((r) => setProfile(r.profile || {})));
    } else {
      setApps([]); setDocuments([]); setNotifications([]); setProfile({});
    }
    const results = await Promise.allSettled(tasks);
    setLoading(false);
    if (results.some((r) => r.status === 'rejected' && r.reason?.status === 401)) {
      clearLocal();
      toast('Your session expired. Please sign in again.', 'error');
    }
  }, [user, studentParams, clearLocal, toast]);

  useEffect(() => { if (online) loadAll(); }, [loadAll, online]);

  // Send applications that were saved while offline.
  const syncing = useRef(false);
  useEffect(() => {
    if (!online || !user || !queue.length || syncing.current) return;
    syncing.current = true;
    (async () => {
      let remaining = [...queue];
      let sent = 0;
      for (const item of queue) {
        try {
          await api.apply(item.schemeId, item.clientRef, item.studentId ? { student_id: item.studentId } : {});
          sent++;
          remaining = remaining.filter((x) => x.clientRef !== item.clientRef);
        } catch (e) {
          if (e.status === 0) break; // still no network
          remaining = remaining.filter((x) => x.clientRef !== item.clientRef); // rejected by server (e.g. duplicate)
          toast(`${item.schemeName}: ${e.message}`, 'error');
        }
      }
      syncing.current = false;
      setQueue(remaining);
      if (sent) { toast(t('synced', { n: sent }), 'success'); loadAll(); }
    })();
  }, [online, user, queue, loadAll, toast, t]);

  // Applications saved offline appear in the tracker straight away.
  const applications = useMemo(() => {
    const mine = queue.filter((q) => (role === 'student' ? !q.studentId : q.studentId === acting?.id));
    const pending = mine.map((q) => ({
      id: 'OFFLINE', clientRef: q.clientRef, schemeId: q.schemeId, scheme: q.schemeName, ministry: q.ministry,
      submittedDate: new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: '—', status: 'queued', paymentStatus: null, documents: [],
      history: [{ date: 'Saved on device', status: 'Saved offline', note: 'Will be submitted automatically when the device is online', done: true, active: true }],
    }));
    return [...pending, ...apps];
  }, [queue, apps, role, acting]);

  const login = useCallback(async (phone, otp, loginRole) => {
    const r = await api.verifyOtp(phone, otp, loginRole);
    setToken(r.token);
    write('as_user', r.user);
    localStorage.removeItem('as_acting');
    setActingState(null);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* offline logout is fine */ }
    clearLocal();
  }, [clearLocal]);

  const setLang = useCallback((code) => {
    localStorage.setItem('as_lang', code);
    setLangState(code);
    syncDOMTranslation(code);
  }, []);
  const setActing = useCallback((s) => { s ? write('as_acting', s) : localStorage.removeItem('as_acting'); setActingState(s); }, []);

  const requireStudent = useCallback(() => {
    if (!studentParams) { toast(t('selectStudentFirst'), 'error'); return false; }
    return true;
  }, [studentParams, toast, t]);

  const isApplied = useCallback(
    (schemeId) => applications.some((a) => a.schemeId === schemeId && a.status !== 'rejected'),
    [applications]
  );

  const applyToScheme = useCallback(async (scheme) => {
    if (!requireStudent()) return null;
    if (isApplied(scheme.id)) { toast(t('alreadyApplied'), 'info'); return null; }
    if (!online) {
      setQueue((q) => [...q, { clientRef: uid(), schemeId: scheme.id, schemeName: scheme.name, ministry: scheme.ministry,
        studentId: studentParams.student_id || null, createdAt: Date.now() }]);
      toast(t('savedOffline'), 'info');
      return { queued: true };
    }
    try {
      const app = await api.apply(scheme.id, uid(), studentParams);
      toast(t('applied', { id: app.id }), 'success');
      loadAll();
      return app;
    } catch (e) { toast(e.message, 'error'); return null; }
  }, [requireStudent, isApplied, online, studentParams, toast, t, loadAll]);

  const checkEligibility = useCallback(async (form) => {
    if (online && studentParams) {
      try {
        const r = await api.checkEligibility(form, studentParams);
        setProfile((p) => ({ ...p, ...form }));
        setSchemes(r.all);
        return r.eligible;
      } catch (e) { if (e.status !== 0) { toast(e.message, 'error'); return []; } }
    }
    // Offline (or admin preview): evaluate locally with cached scheme rules.
    return schemes.map((s) => ({ ...s, ...evaluateLocal(s.rules, form) })).filter((s) => s.eligible);
  }, [online, studentParams, schemes, toast]);

  const guardOnline = useCallback(() => {
    if (!online) { toast(t('needsInternet'), 'error'); return false; }
    return requireStudent();
  }, [online, toast, t, requireStudent]);

  const saveProfile = useCallback(async (p) => {
    if (!guardOnline()) return false;
    try { const r = await api.saveProfile(p, studentParams); setProfile(r.profile); toast('Profile saved', 'success'); loadAll(); return true; }
    catch (e) { toast(e.message, 'error'); return false; }
  }, [guardOnline, studentParams, toast, loadAll]);

  const uploadDocument = useCallback(async (docType, file) => {
    if (!guardOnline()) return null;
    try {
      const r = await api.uploadDocument(docType, file, studentParams.student_id);
      setDocuments(r.documents);
      api.notifications(studentParams).then(setNotifications).catch(() => {});
      return r.result;
    } catch (e) { toast(e.message, 'error'); return null; }
  }, [guardOnline, studentParams, toast]);

  const fetchDigiLocker = useCallback(async () => {
    if (!guardOnline()) return false;
    try { setDocuments(await api.digilocker(studentParams)); api.notifications(studentParams).then(setNotifications); return true; }
    catch (e) { toast(e.message, 'error'); return false; }
  }, [guardOnline, studentParams, toast]);

  const deleteDocument = useCallback(async (docType) => {
    if (!guardOnline()) return;
    try { setDocuments(await api.deleteDocument(docType, studentParams)); } catch (e) { toast(e.message, 'error'); }
  }, [guardOnline, studentParams, toast]);

  const refreshApplication = useCallback(async (code) => {
    if (!online) { toast(t('needsInternet'), 'error'); return; }
    try { await api.refreshApplication(code); loadAll(); } catch (e) { toast(e.message, 'error'); }
  }, [online, toast, t, loadAll]);

  const markRead = useCallback((id) => {
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
    if (online && studentParams) api.readNotification(id, studentParams).catch(() => {});
  }, [online, studentParams]);

  const markAllRead = useCallback(() => {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    if (online && studentParams) api.readAllNotifications(studentParams).catch(() => {});
  }, [online, studentParams]);

  const value = {
    user, role, config, lang, setLang, t, online, netOnline, simOffline, setSimOffline, acting, setActing, studentParams,
    schemes, applications, documents, notifications, profile, loading, queue,
    login, logout, loadAll, applyToScheme, isApplied, checkEligibility, saveProfile, uploadDocument,
    fetchDigiLocker, deleteDocument, refreshApplication, markRead, markAllRead, toast, toastState,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
