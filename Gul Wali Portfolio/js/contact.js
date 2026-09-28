/* ==========================================================================
   contact.js — contact form validation, storage and optional backend
   ========================================================================== */

import { loadData } from './data.js';
import { t } from './language.js';
import storage from './storage.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MESSAGES_KEY = 'messages';

function setFieldError(input, message) {
  const field = input.closest('.field');
  const errorEl = field ? field.querySelector('.field__error') : null;
  if (errorEl) errorEl.textContent = message || '';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearErrors(form) {
  form.querySelectorAll('.field__error').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
}

function validate(form) {
  const name = form.elements.name;
  const email = form.elements.email;
  const subject = form.elements.subject;
  const message = form.elements.message;

  let valid = true;

  if (!name.value.trim() || name.value.trim().length < 2) {
    setFieldError(name, t('contact.errName'));
    valid = false;
  } else setFieldError(name, '');

  if (!EMAIL_RE.test(email.value.trim())) {
    setFieldError(email, t('contact.errEmail'));
    valid = false;
  } else setFieldError(email, '');

  if (!subject.value.trim() || subject.value.trim().length < 3) {
    setFieldError(subject, t('contact.errSubject'));
    valid = false;
  } else setFieldError(subject, '');

  if (!message.value.trim() || message.value.trim().length < 20) {
    setFieldError(message, t('contact.errMessage'));
    valid = false;
  } else setFieldError(message, '');

  return valid;
}

function setStatus(el, type, text) {
  el.className = `form-status is-visible is-${type}`;
  el.textContent = text;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
}

export async function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : '';

  // Load endpoint config (may be empty)
 let endpoint = '';
let accessKey = '';
try {
  const profile = await loadData('profile');
  endpoint = (profile && profile.contactEndpoint) || '';
  accessKey = (profile && profile.contactAccessKey) || '';
} catch {
  endpoint = '';
  accessKey = '';
}

  // Live validation on blur
  ['name', 'email', 'subject', 'message'].forEach((fieldName) => {
    const input = form.elements[fieldName];
    if (!input) return;
    input.addEventListener('blur', () => {
      if (input.value.trim() === '') return;
      validate(form);
    });
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      const errorEl = field ? field.querySelector('.field__error') : null;
      if (errorEl && errorEl.textContent) {
        input.setAttribute('aria-invalid', 'false');
        errorEl.textContent = '';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    if (!validate(form)) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

   const payload = {
  id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: form.elements.name.value.trim(),
  email: form.elements.email.value.trim(),
  subject: form.elements.subject.value.trim(),
  message: form.elements.message.value.trim(),
  date: new Date().toISOString(),
  read: false
};

// Web3Forms access key (which is not a secret — it identifies the recipient)
if (accessKey) {
  payload.access_key = accessKey;
}

    // Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t('contact.sending');
    }
    setStatus(status, 'loading', t('contact.sending'));

    let delivered = false;
    let backendUsed = false;

    if (endpoint) {
      // A real backend endpoint has been configured by the owner.
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        delivered = true;
        backendUsed = true;
      } catch (err) {
        delivered = false;
      }
    }

    // Always keep a local record so the owner can review messages in the admin demo.
    try {
      const existing = storage.get(MESSAGES_KEY, []);
      const list = Array.isArray(existing) ? existing : [];
      list.unshift({ ...payload, delivered, backendUsed });
      storage.set(MESSAGES_KEY, list.slice(0, 200));
    } catch {
      /* storage full or unavailable — the form still reports honestly */
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }

    if (backendUsed && delivered) {
      setStatus(status, 'success', t('contact.success'));
      form.reset();
      return;
    }

    if (!endpoint) {
      // Honest message: no backend configured.
      setStatus(status, 'success', t('contact.savedLocally'));
      form.reset();
      return;
    }

    setStatus(status, 'error', t('contact.error'));
  });

  // React to language changes in error text
  document.addEventListener('gw:language', () => {
    clearErrors(form);
    if (status && status.classList.contains('is-visible')) {
      status.classList.remove('is-visible');
    }
  });
}