(function() {
  'use strict';

  // Модалки
  const modals = document.querySelectorAll('.modal');
  const modalCallback = document.getElementById('modal-callback');
  const modalGallery = document.getElementById('modal-gallery');
  const modalGalleryImg = modalGallery?.querySelector('.modal-gallery-img');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    modals.forEach(m => closeModal(m));
  }

  // Кнопки відкриття модалок
  document.querySelectorAll('[data-modal="callback"]').forEach(btn => {
    btn.addEventListener('click', () => openModal(modalCallback));
  });

  document.querySelectorAll('[data-modal="consult"]').forEach(btn => {
    btn.addEventListener('click', () => openModal(modalCallback));
  });

  // Закриття по overlay або кнопці
  modals.forEach(modal => {
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    if (overlay) overlay.addEventListener('click', () => closeModal(modal));
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
  });

  // ESC для закриття
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Галерея — збільшення фото в модалці (тільки зображення)
  document.querySelectorAll('[data-gallery]').forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalGalleryImg) {
        modalGalleryImg.src = item.href || img.src;
        modalGalleryImg.alt = img.alt;
        modalGallery.querySelector('img').style.display = 'block';
        modalGallery.querySelector('.modal-video-wrap')?.remove();
        openModal(modalGallery);
      }
    });
  });

  // Відео — повноекранний режим по кліку
  document.querySelectorAll('[data-video-fullscreen]').forEach(wrap => {
    const video = wrap.querySelector('video');
    if (!video) return;
    wrap.style.cursor = 'pointer';
    wrap.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        video.muted = false;
        video.requestFullscreen().then(() => video.play()).catch(() => {});
      } else {
        document.exitFullscreen();
      }
    });
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.querySelectorAll('[data-video-fullscreen] video').forEach(v => {
        v.pause();
        v.muted = true;
        v.currentTime = 0;
      });
    }
  });

  // Бургер-меню
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      burger.classList.toggle('is-active');
    });
  }

  // Плавна прокрутка для якорів
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Закриття меню при кліку на посилання
  if (nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger?.classList.remove('is-active');
      });
    });
  }

  // Форми — відправка в Telegram
  const SUCCESS_MSG = 'Заявку відправлено! Ми вам передзвонимо ✅';
  const API_URL = '/api/send-telegram';

  document.querySelectorAll('.telegram-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const origText = btn?.textContent;
      if (btn) btn.disabled = true;
      if (btn && origText) btn.textContent = 'Відправка...';
      try {
        const fd = new FormData(form);
        const body = {
          name: fd.get('name') || '',
          phone: fd.get('phone') || '',
          message: fd.get('message') || ''
        };
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) {
          const modal = form.closest('.modal');
          if (modal) closeModal(modal);
          alert(SUCCESS_MSG);
          form.reset();
        } else {
          throw new Error(data.error || 'Помилка відправки');
        }
      } catch (err) {
        alert(err.message || 'Помилка. Спробуйте зателефонувати: +38 (093) 871-70-25');
      }
      if (btn) btn.disabled = false;
      if (btn && origText) btn.textContent = origText;
    });
  });

  // Коментарі (localStorage)
  const COMMENTS_KEY = 'almazne_comments';
  const commentsList = document.querySelector('.comments-list');
  const commentForm = document.querySelector('.comment-form');

  function loadComments() {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const comments = raw ? JSON.parse(raw) : [];
    if (!commentsList) return;
    commentsList.innerHTML = comments.map(c => `
      <div class="review-card">
        <p class="review-text">${escapeHtml(c.text)}</p>
        <div class="review-author">
          <strong>${escapeHtml(c.author)}</strong>
          <span>${formatDate(c.date)}</span>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = commentForm.author.value.trim();
      const text = commentForm.comment.value.trim();
      if (!author || !text) return;
      const raw = localStorage.getItem(COMMENTS_KEY);
      const comments = raw ? JSON.parse(raw) : [];
      comments.unshift({ author, text, date: Date.now() });
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
      commentForm.reset();
      loadComments();
    });
  }

  loadComments();

  // Sticky header
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 50));
  }
})();
