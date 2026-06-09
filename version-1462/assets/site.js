import { H as Hls } from './hls.js';

function setupMobileNavigation() {
  const button = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let index = 0;
  let timer = null;

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(() => showSlide(index + 1), 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      startTimer();
    });
  });

  previous?.addEventListener('click', () => {
    showSlide(index - 1);
    startTimer();
  });

  next?.addEventListener('click', () => {
    showSlide(index + 1);
    startTimer();
  });

  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', startTimer);
  startTimer();
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function setupFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const container = panel.parentElement;
    const input = panel.querySelector('[data-live-search]');
    const buttons = Array.from(panel.querySelectorAll('[data-filter-category]'));
    const count = panel.querySelector('[data-filter-count]');
    const cards = Array.from(container.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    let activeCategory = 'all';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function update() {
      const query = normalizeText(input?.value || '');
      let visible = 0;

      cards.forEach((card) => {
        const searchText = normalizeText(card.dataset.search || card.textContent);
        const category = card.dataset.category || '';
        const matchesQuery = !query || searchText.includes(query);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;
        const shouldShow = matchesQuery && matchesCategory;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
      }
    }

    input?.addEventListener('input', update);

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.filterCategory || 'all';
        buttons.forEach((item) => item.classList.toggle('is-active', item === button));
        update();
      });
    });

    update();
  });
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const status = player.querySelector('[data-player-status]');
    const source = player.dataset.src;
    let hls = null;
    let attached = false;

    if (!video || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;
      setStatus('正在加载播放源...');

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('播放源加载完成，正在播放');
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data?.fatal) {
            setStatus('播放源暂时无法加载，请刷新后重试');
            try {
              hls.destroy();
            } catch (error) {
              console.warn(error);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('使用浏览器原生 HLS 播放');
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
      }
    }

    async function playVideo() {
      attachSource();
      video.controls = true;

      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        setStatus('浏览器需要再次点击确认播放');
        console.warn(error);
      }
    }

    button?.addEventListener('click', playVideo);

    video.addEventListener('play', () => {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', () => {
      if (!video.ended) {
        player.classList.remove('is-playing');
        setStatus('已暂停，点击继续播放');
      }
    });

    video.addEventListener('ended', () => {
      player.classList.remove('is-playing');
      setStatus('播放结束，可点击重新播放');
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

setupMobileNavigation();
setupHeroSlider();
setupFilters();
setupPlayers();
