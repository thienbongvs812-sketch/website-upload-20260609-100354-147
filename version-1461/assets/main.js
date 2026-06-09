(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
      dot.setAttribute('aria-pressed', dotIndex === currentSlide ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 6500);
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var searchInput = document.querySelector('[data-search-input]');

  if (searchInput && query) {
    searchInput.value = query;
  }

  function applyFiltering(scope) {
    var input = scope.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
    var items = Array.prototype.slice.call(scope.querySelectorAll('.searchable-item'));
    var empty = scope.querySelector('.empty-state');

    if (!input && !selects.length) {
      return;
    }

    function update() {
      var value = input ? input.value.trim().toLowerCase() : '';
      var visibleCount = 0;

      items.forEach(function (item) {
        var searchText = (item.getAttribute('data-search') || '').toLowerCase();
        var matchedText = !value || searchText.indexOf(value) !== -1;
        var matchedSelects = selects.every(function (select) {
          var selected = select.value;
          return !selected || item.getAttribute(select.getAttribute('data-filter-select')) === selected;
        });
        var visible = matchedText && matchedSelects;
        item.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener('input', update);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', update);
    });

    update();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(applyFiltering);
})();
