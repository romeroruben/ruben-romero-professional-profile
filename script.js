'use strict';

/**
 * Small progressive enhancements for the portfolio.
 * Content and navigation remain available when JavaScript is disabled.
 */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const navigation = document.querySelector('[data-navigation]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const progressBar = document.querySelector('.scroll-progress span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  const readSavedTheme = () => {
    try {
      return localStorage.getItem('rr-theme');
    } catch (error) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem('rr-theme', theme);
    } catch (error) {
      // Local storage can be unavailable in strict privacy modes.
    }
  };

  const syncThemeControl = () => {
    if (!themeToggle) return;
    const isDark = root.dataset.theme === 'dark';
    const label = isDark ? 'Activar tema claro' : 'Activar tema oscuro';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  };

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    if (persist) saveTheme(theme);
    syncThemeControl();
  };

  syncThemeControl();

  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  systemTheme.addEventListener('change', (event) => {
    if (!readSavedTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  const setMenu = (isOpen) => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    navigation.dataset.open = String(isOpen);
    body.classList.toggle('menu-open', isOpen);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 832) setMenu(false);
  });

  const revealElements = document.querySelectorAll('.reveal');

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08,
    });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleSections.length) return;
      const activeId = `#${visibleSections[0].target.id}`;

      navLinks.forEach((link) => {
        if (link.getAttribute('href') === activeId) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, {
      rootMargin: '-25% 0px -58% 0px',
      threshold: [0, 0.1, 0.3],
    });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  let ticking = false;

  const updateScrollState = () => {
    const scrollTop = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;

    header?.classList.toggle('is-scrolled', scrollTop > 16);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollState);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateScrollState();

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
