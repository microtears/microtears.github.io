function setTheme(isDark) {
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;

  const hljsLink = document.getElementById('hljs-theme');
  if (hljsLink) {
    const HLJS_LIGHT = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/a11y-light.min.css';
    const HLJS_DARK = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/a11y-dark.min.css';
    hljsLink.setAttribute('href', isDark ? HLJS_DARK : HLJS_LIGHT);
  }
}

function initTheme() {
  const e = window.matchMedia('(prefers-color-scheme: dark)');

  e.addEventListener('change', function (e) {
    setTheme(e.matches);
  });

  Array.from(document.getElementsByClassName('theme-toggle'))
    .forEach(element => {
      element.addEventListener('click', function () {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
      });
    });

  setTheme(e.matches);
}

initTheme();

