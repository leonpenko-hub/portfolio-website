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
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        const next = document.body.classList.contains('light') ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        applyTheme(next);
      });
    }
  });

  window.addEventListener('scroll', function() {
    const nav = document.getElementById('site-nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  });
})();
