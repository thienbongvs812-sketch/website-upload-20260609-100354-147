(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      slides[index].classList.remove('active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('active');
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(index + 1);
      });
    }

    window.setInterval(function() {
      showSlide(index + 1);
    }, 6200);
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = filterScope.querySelector('[data-filter-search]');
    var yearSelect = filterScope.querySelector('[data-filter-year]');
    var regionSelect = filterScope.querySelector('[data-filter-region]');
    var typeSelect = filterScope.querySelector('[data-filter-type]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';

      cards.forEach(function(card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var matchesType = !type || card.getAttribute('data-type') === type;
        card.classList.toggle('is-filtered', !(matchesKeyword && matchesYear && matchesRegion && matchesType));
      });
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }
})();
