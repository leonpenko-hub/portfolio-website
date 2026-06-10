(function() {
  const saved = localStorage.getItem('theme') || 'light';

  function applyTheme(t) {
    if (t === 'dark') {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }

  applyTheme(saved);

  document.addEventListener('DOMContentLoaded', function() {
    // Desktop toggle
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        const next = document.body.classList.contains('light') ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        applyTheme(next);
      });
    }

    // Mobile toggle (inside hamburger menu)
    const toggleMobile = document.getElementById('theme-toggle-mobile');
    if (toggleMobile) {
      toggleMobile.addEventListener('click', function() {
        const next = document.body.classList.contains('light') ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        applyTheme(next);
      });
    }

    // Hamburger open/close
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
      });
      mobileMenu.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
        });
      });
    }
  });

  window.addEventListener('scroll', function() {
    const nav = document.getElementById('site-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  });
})();
