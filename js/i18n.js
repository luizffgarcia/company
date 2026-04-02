/**
 * i18n.js — Bilingual toggle (PT / EN)
 *
 * Strategy:
 *  - Every translatable element has `data-pt` and `data-en` attributes.
 *  - Input/textarea placeholders use `data-placeholder-pt` / `data-placeholder-en`.
 *  - The current language is stored in localStorage under "lang".
 *  - On init, the stored (or default PT) language is applied.
 *  - The #lang-toggle button cycles between "PT" and "EN".
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'lang';
  const DEFAULT_LANG = 'pt';

  /**
   * Apply `lang` to the DOM:
   *  1. Set <html lang> attribute.
   *  2. Walk every element with data-pt/data-en and set textContent.
   *  3. Walk inputs/textareas with placeholder variants.
   *  4. Update the toggle button label.
   */
  function applyLang(lang) {
    // 1. html lang attribute
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    // 2. Translatable text nodes
    document.querySelectorAll('[data-pt][data-en]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text !== null) {
        // Preserve child elements (e.g. <br>) — use innerHTML only if needed
        if (text.includes('<')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // 3. Placeholders
    document.querySelectorAll('[data-placeholder-pt][data-placeholder-en]').forEach(function (el) {
      var ph = el.getAttribute('data-placeholder-' + lang);
      if (ph !== null) el.placeholder = ph;
    });

    // 4. Toggle button label — show the OTHER language as the action label
    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.textContent = lang === 'pt' ? 'EN' : 'PT';
      toggle.setAttribute('aria-label', lang === 'pt' ? 'Switch to English' : 'Mudar para Português');
    }

    // 5. Persist
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /**
   * Read saved or default language.
   */
  function getSavedLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return DEFAULT_LANG;
  }

  /**
   * Init on DOMContentLoaded.
   */
  document.addEventListener('DOMContentLoaded', function () {
    var currentLang = getSavedLang();
    applyLang(currentLang);

    var toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = getSavedLang() === 'pt' ? 'en' : 'pt';
        applyLang(next);
      });
    }
  });

  // Expose for potential external use
  window.i18n = { apply: applyLang, current: getSavedLang };
})();
