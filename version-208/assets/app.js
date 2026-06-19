(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var button = $('[data-mobile-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        $all('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = './search.html?q=' + encodeURIComponent(query);
                }
            });
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var tabs = $all('[data-hero-tab]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            tabs.forEach(function (tab, i) {
                tab.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initCardFilters() {
        $all('[data-card-filter]').forEach(function (input) {
            var target = input.getAttribute('data-card-filter');
            var root = target ? document.querySelector(target) : document;
            if (!root) {
                root = document;
            }
            var cards = $all('[data-movie-card]', root);
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
                });
            });
        });
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function movieResult(movie) {
        return '' +
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
                '<span class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-gradient"></span>' +
                    '<span class="quality-badge">HD</span>' +
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
                '</span>' +
                '<span class="movie-info">' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<em>' + escapeHtml(movie.oneLine) + '</em>' +
                    '<span class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></span>' +
                '</span>' +
            '</a>';
    }

    function initSearchPage() {
        var mount = $('[data-search-results]');
        var input = $('[data-search-input]');
        var form = $('[data-main-search-form]');
        if (!mount || !window.SITE_MOVIES) {
            return;
        }
        function render(query) {
            var normalized = query.trim().toLowerCase();
            if (input) {
                input.value = query;
            }
            if (!normalized) {
                mount.innerHTML = '<div class="search-empty">输入片名、地区、年份或类型，快速查找想看的内容。</div>';
                return;
            }
            var results = window.SITE_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category, movie.oneLine].join(' ').toLowerCase();
                return text.indexOf(normalized) !== -1;
            }).slice(0, 120);
            if (!results.length) {
                mount.innerHTML = '<div class="search-empty">没有找到匹配内容，可以尝试更短的关键词。</div>';
                return;
            }
            mount.innerHTML = '<div class="movie-grid dense">' + results.map(movieResult).join('') + '</div>';
        }
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render(input ? input.value : '');
            });
        }
        render(getQuery());
    }

    function initPlayers() {
        $all('[data-player]').forEach(function (player) {
            var video = $('video', player);
            var overlay = $('[data-play-button]', player);
            if (!video || !overlay) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var ready = false;
            var hlsInstance = null;
            function attach() {
                if (ready || !stream) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = stream;
            }
            function start() {
                attach();
                overlay.classList.add('is-hidden');
                video.play().catch(function () {});
            }
            overlay.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('ended', function () {
                overlay.classList.remove('is-hidden');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initSearchForms();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayers();
    });
}());
