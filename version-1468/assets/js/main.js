(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));

    panels.forEach(function (panel) {
        var scope = document.querySelector(panel.getAttribute('data-search-panel')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var count = document.querySelector(panel.getAttribute('data-count-target'));
        var empty = document.querySelector(panel.getAttribute('data-empty-target'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var q = normalize(keyword && keyword.value);
            var selectedYear = normalize(year && year.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }

                if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
                    ok = false;
                }

                if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
                    ok = false;
                }

                if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';

                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }

            if (empty) {
                empty.style.display = visible === 0 ? 'block' : 'none';
            }
        }

        [keyword, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });
})();

function setupMoviePlayer(sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');

    if (!video || !overlay) {
        return;
    }

    var initialized = false;

    function startPlayback() {
        if (!initialized) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            initialized = true;
        }

        overlay.classList.add('hidden');
        video.controls = true;
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                overlay.classList.remove('hidden');
            });
        }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (!initialized || video.paused) {
            startPlayback();
        }
    });
}
