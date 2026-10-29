// All calls to the FastAPI backend go through here.
// Same-origin by default (the production server serves both the app and /api).
// Set VITE_API_URL only when the API lives on a different domain.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

let token = localStorage.getItem('as_token');
export const setToken = (t) => {
  token = t;
  if (t) localStorage.setItem('as_token', t);
  else localStorage.removeItem('as_token');
};

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, { method = 'GET', body, params, form, blob } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
  }
  if (blob) {
    if (!res.ok) throw new ApiError(res.status === 404 ? 'No file stored for this document' : `Request failed (${res.status})`, res.status);
    return res.blob();
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const d = data?.detail;
    const msg = Array.isArray(d) ? d.map((x) => x.msg).join('; ') : d;
    throw new ApiError(msg || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  config: () => request('/config'),
  sendOtp: (phone, role) => request('/auth/send-otp', { method: 'POST', body: { phone, role } }),
  verifyOtp: (phone, otp, role) => request('/auth/verify-otp', { method: 'POST', body: { phone, otp, role } }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  schemes: (params) => request('/schemes', { params }),
  checkEligibility: (profile, params) => request('/eligibility/check', { method: 'POST', body: { profile, save: true }, params }),
  getProfile: (params) => request('/profile', { params }),
  saveProfile: (profile, params) => request('/profile', { method: 'PUT', body: { profile }, params }),

  applications: (params) => request('/applications', { params }),
  apply: (scheme_id, client_ref, params) => request('/applications', { method: 'POST', body: { scheme_id, client_ref }, params }),
  refreshApplication: (code) => request(`/applications/${code}/refresh`, { method: 'POST' }),

  documents: (params) => request('/documents', { params }),
  uploadDocument: (docType, file, studentId) => {
    const f = new FormData();
    f.append('doc_type', docType);
    f.append('file', file);
    if (studentId) f.append('student_id', studentId);
    return request('/documents/upload', { method: 'POST', form: f });
  },
  documentFile: (docType, params) => request(`/documents/${docType}/file`, { params, blob: true }),
  digilocker: (params) => request('/documents/digilocker', { method: 'POST', params }),
  deleteDocument: (docType, params) => request(`/documents/${docType}`, { method: 'DELETE', params }),

  notifications: (params) => request('/notifications', { params }),
  readNotification: (id, params) => request(`/notifications/${id}/read`, { method: 'POST', params }),
  readAllNotifications: (params) => request('/notifications/read-all', { method: 'POST', params }),

  assistedStudents: () => request('/assisted/students'),
  createStudent: (name, phone) => request('/assisted/students', { method: 'POST', body: { name, phone } }),
  saveNotes: (id, notes) => request(`/assisted/students/${id}/notes`, { method: 'PUT', body: { notes } }),

  adminSummary: () => request('/admin/summary'),
  adminApplications: (status = 'open') => request('/admin/applications', { params: { status } }),
  adminAdvance: (code) => request(`/admin/applications/${code}/advance`, { method: 'POST' }),
  adminReject: (code, reason) => request(`/admin/applications/${code}/reject`, { method: 'POST', body: { reason } }),
  adminSchemes: () => request('/schemes', { params: { include_inactive: true } }),
  adminToggleScheme: (id) => request(`/admin/schemes/${id}/toggle`, { method: 'POST' }),
  adminSaveScheme: (id, body) => (id
    ? request(`/admin/schemes/${id}`, { method: 'PUT', body })
    : request('/admin/schemes', { method: 'POST', body })),
  adminOperators: () => request('/admin/operators'),
  adminAddOperator: (body) => request('/admin/operators', { method: 'POST', body }),
  adminToggleOperator: (id) => request(`/admin/operators/${id}/toggle`, { method: 'POST' }),
  demoReset: () => request('/demo/reset', { method: 'POST' }),
};
