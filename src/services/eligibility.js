// Same rules as backend/app/services/eligibility.py — used when the device is offline.
const lakh = (n) => `₹${n / 100000} Lakh`;

export function evaluateLocal(rules = {}, profile = {}) {
  const reasons = [], failed = [];
  if ((profile.category || 'ST').toUpperCase() === 'ST') reasons.push('ST category confirmed');
  else failed.push('Only for Scheduled Tribe students');
  if (rules.courses) {
    if (rules.courses.includes(profile.course)) reasons.push('Your course matches');
    else failed.push(`Course not covered (${profile.course || 'not given'})`);
  }
  if (rules.max_income) {
    const income = parseInt(String(profile.income || 0).replace(/,/g, ''), 10) || 0;
    if (income <= rules.max_income) reasons.push(`Income under ${lakh(rules.max_income)}`);
    else failed.push(`Family income above ${lakh(rules.max_income)}`);
  }
  if (rules.states && rules.states !== 'all') {
    if (rules.states.includes(profile.state)) reasons.push(`${profile.state} domicile`);
    else failed.push(`Only for ${rules.states.join(', ')} residents`);
  }
  return { eligible: failed.length === 0, reasons, failed };
}
