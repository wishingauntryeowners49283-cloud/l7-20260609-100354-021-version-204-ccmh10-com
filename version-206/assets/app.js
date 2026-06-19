(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  ready(function() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        nav.classList.toggle('open');
      });
    }

    var searchForms = document.querySelectorAll('[data-header-search]');
    searchForms.forEach(function(form) {
      form.addEventListener('submit', function(event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    document.querySelectorAll('[data-search-scope]').forEach(function(scope) {
      var input = scope.querySelector('[data-search-input]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var url = new URL(window.location.href);
      var initial = url.searchParams.get('q');

      if (input && initial) {
        input.value = initial;
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function(card) {
          var text = normalize(card.getAttribute('data-search'));
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
        applyFilter();
      }
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function(slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dot'));
      var prev = slider.querySelector('[data-slider-prev]');
      var next = slider.querySelector('[data-slider-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function move(step) {
        show(current + step);
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function() {
          move(1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function() {
          move(-1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function() {
          move(1);
          restart();
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          show(index);
          restart();
        });
      });

      show(0);
      restart();
    });
  });

  window.initializeMoviePlayer = function(streamUrl) {
    var video = document.querySelector('[data-player]');
    var layer = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attachStream();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (layer) {
      layer.addEventListener('click', start);
    }
    video.addEventListener('click', function() {
      if (!attached) {
        start();
      }
    });
  };
})();
