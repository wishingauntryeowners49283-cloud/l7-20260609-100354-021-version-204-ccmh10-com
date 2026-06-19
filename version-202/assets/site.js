(function () {
  var root = document.documentElement;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('[data-menu-toggle]');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = header.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', opened);
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('.site-search');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  function setupFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalized(input && input.value);
      var typeValue = normalized(typeSelect && typeSelect.value);
      var yearValue = normalized(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var textValue = normalized(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
        var matchKeyword = !keyword || textValue.indexOf(keyword) !== -1;
        var matchType = !typeValue || normalized(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
        var matchYear = !yearValue || normalized(card.getAttribute('data-year')) === yearValue;
        var show = matchKeyword && matchType && matchYear;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = document.querySelectorAll('.player-box[data-stream]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || video.dataset.ready === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.dataset.ready = 'true';
      }

      function start() {
        attach();
        player.classList.add('is-playing');
        if (video) {
          var playback = video.play();
          if (playback && playback.catch) {
            playback.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
