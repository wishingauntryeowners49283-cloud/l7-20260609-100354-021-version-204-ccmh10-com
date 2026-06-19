(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.hasAttribute("hidden") === false;
      if (isOpen) {
        mobilePanel.setAttribute("hidden", "");
        menuButton.setAttribute("aria-expanded", "false");
      } else {
        mobilePanel.removeAttribute("hidden");
        menuButton.setAttribute("aria-expanded", "true");
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(slideTimer);
    slideTimer = setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-slide"), 10);
      showSlide(index);
      startSlider();
    });
  });

  startSlider();

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupCardFilter(scope) {
    var root = scope || document;
    var input = root.querySelector(".card-filter-input");
    var typeSelect = root.querySelector(".card-filter-type");
    var yearSelect = root.querySelector(".card-filter-year");
    var regionSelect = root.querySelector(".card-filter-region");
    var grid = root.querySelector(".filter-grid");

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "没有找到匹配的影片";

    if (input && input.id === "searchBox") {
      input.value = getQueryValue("q");
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var match = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          match = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          match = false;
        }

        if (year && cardYear !== year) {
          match = false;
        }

        if (region && cardRegion !== region) {
          match = false;
        }

        card.hidden = !match;

        if (match) {
          visible += 1;
        }
      });

      if (visible === 0 && empty.parentNode !== grid) {
        grid.appendChild(empty);
      }

      if (visible > 0 && empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  setupCardFilter(document);
})();

function initVideoPlayer(videoUrl) {
  var video = document.getElementById("moviePlayer");
  var overlay = document.getElementById("playOverlay");

  if (!video || !videoUrl) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attachVideo() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = videoUrl;
  }

  function playVideo() {
    attachVideo();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
