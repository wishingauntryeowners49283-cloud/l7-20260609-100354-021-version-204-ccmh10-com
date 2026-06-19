(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var started = false;
  var hlsInstance = null;

  function hideButton() {
    button.classList.add('is-hidden');
  }

  function showButton() {
    if (video.paused && !video.ended) {
      button.classList.remove('is-hidden');
    }
  }

  function loadStream() {
    if (started) {
      return Promise.resolve();
    }
    started = true;
    if (!stream) {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1800);
      });
    }
    video.src = stream;
    return Promise.resolve();
  }

  function playMovie() {
    hideButton();
    loadStream().then(function () {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          showButton();
        });
      }
    });
  }

  button.addEventListener('click', playMovie);
  video.addEventListener('click', function () {
    if (video.paused) {
      playMovie();
    }
  });
  video.addEventListener('play', hideButton);
  video.addEventListener('pause', showButton);
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
