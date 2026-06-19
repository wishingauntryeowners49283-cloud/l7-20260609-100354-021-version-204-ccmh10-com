(function () {
    function initMoviePlayer(source) {
        var video = document.getElementById('moviePlayer');
        var poster = document.getElementById('playerPoster');
        var button = document.getElementById('playButton');
        var ready = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                ready = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }
            video.src = source;
            ready = true;
        }

        function hidePoster() {
            if (poster) {
                poster.classList.add('is-hidden');
            }
        }

        function startPlayback() {
            loadSource();
            hidePoster();
            video.controls = true;
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (poster) {
            poster.addEventListener('click', function () {
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', hidePoster);

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
