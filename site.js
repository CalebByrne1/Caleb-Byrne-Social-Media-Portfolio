const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const emailAddress = 'calebbyrne2@gmail.com';

document.querySelectorAll('[data-current-year]').forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

// Full-screen menu
const header = document.querySelector('.site-header');
const menu = document.getElementById('site-menu');
const menuToggle = document.querySelector('.menu-toggle');
const menuLabel = document.querySelector('.menu-toggle-label');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Close' : 'Menu';
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menu.querySelector('a').focus();
  } else {
    menu.classList.remove('is-open');
    window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduceMotion ? 0 : 350);
  }
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});

// Header background once scrolled past the promo bar
function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 40);
}
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Copy email
const emailCopyButton = document.querySelector('[data-email-action="copy"]');
if (emailCopyButton) {
  const copyLabel = emailCopyButton.textContent;
  let resetTimer = null;
  emailCopyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      emailCopyButton.textContent = 'Copied ✓';
    } catch (error) {
      window.prompt('Copy this email address:', emailAddress);
    }
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => { emailCopyButton.textContent = copyLabel; }, 1800);
  });
}

// Scroll reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Stat count-up when the stats band scrolls into view
const statNums = Array.from(document.querySelectorAll('[data-count]'));
if (!reduceMotion && statNums.length) {
  const fmt = new Intl.NumberFormat('en-US');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 1100, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt.format(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach((el) => statObserver.observe(el));
}

// Viewfinder timecode runs like a camera recording (24fps)
const timecode = document.querySelector('[data-timecode]');
if (timecode && !reduceMotion) {
  const pad = (n) => String(n).padStart(2, '0');
  const startedAt = performance.now();
  let lastFrame = -1;
  const runTimecode = (now) => {
    const frames = Math.floor((now - startedAt) / (1000 / 24));
    if (frames !== lastFrame) {
      lastFrame = frames;
      const secs = Math.floor(frames / 24);
      timecode.textContent = `00:${pad(Math.floor(secs / 60) % 60)}:${pad(secs % 60)}:${pad(frames % 24)}`;
    }
    requestAnimationFrame(runTimecode);
  };
  requestAnimationFrame(runTimecode);
}
