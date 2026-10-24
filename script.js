(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const dialog = document.querySelector('.booking-dialog');
  const bookingForm = document.querySelector('.booking-form');
  const bookingResult = document.querySelector('.booking-result');
  const telegramSend = document.querySelector('.telegram-send');

  // Светлая тема — по умолчанию. Сохраняем выбор пользователя между визитами.
  try {
    const savedTheme = localStorage.getItem('apex-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
  } catch (_) { /* localStorage может быть недоступен в приватном режиме. */ }

  const updateThemeButton = () => {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#111210' : '#f4f3ef');
  };
  updateThemeButton();

  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    updateThemeButton();
    try { localStorage.setItem('apex-theme', root.dataset.theme); } catch (_) { /* Игнорируем недоступное хранилище. */ }
  });

  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', isOpen);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 600) closeMenu(); });

  // Ненавязчивое появление контента по мере прокрутки.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.revealDelay || 0);
        entry.target.style.setProperty('--reveal-delay', `${delay}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Окно записи формирует готовый текст и передаёт его Telegram Share.
  // Для прямого диалога замените ссылку Telegram студии в index.html.
  const openBooking = () => {
    closeMenu();
    bookingResult.hidden = true;
    bookingForm.hidden = false;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  document.querySelectorAll('[data-open-booking]').forEach(button => button.addEventListener('click', openBooking));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const message = [
      'Здравствуйте! Хочу записаться в Apex Detailing.',
      `Имя: ${data.get('name')}`,
      `Телефон: ${data.get('phone')}`,
      `Услуга: ${data.get('service')}`,
      `Страница: ${window.location.href.split('#')[0]}`
    ].join('\n');
    telegramSend.href = `https://t.me/share/url?url=${encodeURIComponent(window.location.href.split('#')[0])}&text=${encodeURIComponent(message)}`;
    bookingForm.hidden = true;
    bookingResult.hidden = false;
  });

  const year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();