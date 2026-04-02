/**
 * main.js — Core UI behaviors
 *
 * - Sticky navbar: adds .scrolled class after scroll
 * - Hamburger menu toggle (mobile)
 * - Close mobile menu on nav link click
 * - Contact form: AJAX submit to Formspree, loading state, success/error feedback
 * - Scroll-reveal animation for section children
 */

(function () {
  'use strict';

  /* --------------------------------------------------------
     NAVBAR — scroll state
  -------------------------------------------------------- */
  var navbar = document.getElementById('navbar');

  function onScroll() {
    if (navbar) {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* --------------------------------------------------------
     HAMBURGER / MOBILE MENU
  -------------------------------------------------------- */
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('open', isOpen);
    });

    // Close when a link inside the menu is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Close menu if viewport widens past mobile breakpoint
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) closeMobileMenu();
  });

  /* --------------------------------------------------------
     CONTACT FORM — AJAX submit to Formspree
  -------------------------------------------------------- */
  var form       = document.getElementById('contact-form');
  var formStatus = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn    = form.querySelector('[type="submit"]');
      var btnLabel     = submitBtn ? submitBtn.querySelector('.btn-label')   : null;
      var btnSpinner   = submitBtn ? submitBtn.querySelector('.btn-loading') : null;

      // Get current language for status messages
      var lang = 'pt';
      try { lang = localStorage.getItem('lang') || 'pt'; } catch (_) {}

      var messages = {
        pt: {
          success: 'Mensagem enviada! Entraremos em contato em breve.',
          error:   'Ocorreu um erro. Por favor, tente novamente.'
        },
        en: {
          success: 'Message sent! We\'ll get back to you soon.',
          error:   'An error occurred. Please try again.'
        }
      };

      // Loading state
      if (submitBtn)  submitBtn.disabled = true;
      if (btnLabel)   btnLabel.style.opacity = '0';
      if (btnSpinner) btnSpinner.removeAttribute('hidden');

      // Clear previous status
      if (formStatus) {
        formStatus.className = '';
        formStatus.textContent = '';
        formStatus.setAttribute('hidden', '');
      }

      var data = new FormData(form);

      fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          if (formStatus) {
            formStatus.textContent = messages[lang].success;
            formStatus.className   = 'success';
            formStatus.removeAttribute('hidden');
          }
          form.reset();
        } else {
          return res.json().then(function (json) {
            throw new Error(json.error || 'Server error');
          });
        }
      })
      .catch(function () {
        if (formStatus) {
          formStatus.textContent = messages[lang].error;
          formStatus.className   = 'error';
          formStatus.removeAttribute('hidden');
        }
      })
      .finally(function () {
        if (submitBtn)  submitBtn.disabled = false;
        if (btnLabel)   btnLabel.style.opacity = '1';
        if (btnSpinner) btnSpinner.setAttribute('hidden', '');
      });
    });
  }

  /* --------------------------------------------------------
     SCROLL-REVEAL — lightweight fade-in on scroll
  -------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var revealStyle = document.createElement('style');
    revealStyle.textContent = [
      '.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.55s ease, transform 0.55s ease; }',
      '.reveal.visible { opacity: 1; transform: none; }'
    ].join('');
    document.head.appendChild(revealStyle);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Observe cards and step items
    var selectors = [
      '.value-card',
      '.service-card',
      '.step-item',
      '.hero-inner > *',
      '.contact-text > *',
      '.contact-form'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4 * 80) + 'ms';
      observer.observe(el);
    });
  }

})();
