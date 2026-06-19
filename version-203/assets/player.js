
(function () {
    var players = document.querySelectorAll('.player-shell');

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-button');
        var source = video ? video.querySelector('source') : null;
        var stream = source ? source.getAttribute('src') : '';
        var hlsInstance = null;
        var initialized = false;

        function initialize() {
            if (!video || initialized || !stream) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                if (source && source.parentNode) {
                    source.parentNode.removeChild(source);
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            initialize();
            video.controls = true;
            shell.classList.add('is-playing');

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button && video) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!initialized || video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.controls) {
                    shell.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
