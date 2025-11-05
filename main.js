// 使用 fetch API 请求当前域名下的 /build-version 文件，然后将内容写入 id 为 build-time 的元素中
function initBuildTime() {
  const buildTimeElement = document.getElementById('build-time');

  if (!buildTimeElement) {
    return;
  }

  fetch('/build-version')
    .then(response => response.text())
    .then(data => {
      buildTimeElement.textContent = `Build time: ${data}`;
    })
    .catch(error => {
      console.error('Error fetching build version:', error);
      // set build time to now if fetch fails
      const now = new Date();
      const formattedNow = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
      buildTimeElement.textContent = `Build time: ${formattedNow}`;
    });
}

function initRunTime() {
  let intervalId;

  function updateTime() {
    const date1 = "2019/07/17 00:00:00";
    const date2 = new Date();
    const date3 = date2.getTime() - new Date(date1).getTime();
    const days = Math.floor(date3 / (24 * 3600 * 1000));
    const leave1 = date3 % (24 * 3600 * 1000);
    const hours = Math.floor(leave1 / (3600 * 1000));
    const leave2 = leave1 % (3600 * 1000);
    const minutes = Math.floor(leave2 / (60 * 1000));
    const leave3 = leave2 % (60 * 1000);
    const seconds = Math.round(leave3 / 1000);
    const element = document.getElementById("run-time");
    if (element) {
      element.innerHTML =
        "Run   time: " + days + "d " + hours.toString().padStart(2, '0') + "h " + minutes.toString().padStart(2, '0') + "m " + seconds.toString().padStart(2, '0') + "s";
    } else if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // 如果已经initialized，则不再初始化
  if (window.runTimeInitialized) {
    return;
  }
  window.runTimeInitialized = true;
  intervalId = setInterval(updateTime, 1000);
}

function initTheme() {
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
initRunTime();
initBuildTime();
