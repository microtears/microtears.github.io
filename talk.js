const dateRegex = /\d{4}\/\d{1,2}\/\d{1,2}/;

globalThis.addEventListener('load', function () {
  document.querySelectorAll('p').forEach(function (p) {
    const text = p.textContent.trim();
    if (dateRegex.test(text)) {
      p.classList.add('date');
    } else if (text.startsWith('#')) {
      p.classList.add('tag');
    }
  });
});