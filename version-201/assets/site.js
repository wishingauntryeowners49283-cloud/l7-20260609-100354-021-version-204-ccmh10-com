(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var menu = qs('[data-menu-panel]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  qsa('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var carousel = qs('[data-hero-carousel]');
  if (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var filterInput = qs('[data-filter-input]');
  var grid = qs('[data-card-grid]');
  var emptyState = qs('[data-empty-state]');
  var sortSelect = qs('[data-sort-select]');
  var clearButton = qs('[data-clear-filter]');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilter() {
    if (!grid) {
      return;
    }
    var cards = qsa('[data-movie-card]', grid);
    var keyword = normalize(filterInput ? filterInput.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }
    var cards = qsa('[data-movie-card]', grid);
    var mode = sortSelect.value;
    if (mode === 'year') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
    } else if (mode === 'views') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      });
    } else {
      cards.sort(function (a, b) {
        return Number(a.getAttribute('data-year') || 0) === Number(b.getAttribute('data-year') || 0) ? 0 : 0;
      });
    }
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    applyFilter();
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      applyFilter();
      filterInput.focus();
    });
  }
})();
