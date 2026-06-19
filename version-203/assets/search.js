
(function () {
    var input = document.getElementById('searchInput');
    var region = document.getElementById('searchRegion');
    var type = document.getElementById('searchType');
    var results = document.getElementById('searchResults');
    var params = new URLSearchParams(window.location.search);

    if (!input || !results || !window.SEARCH_MOVIES) {
        return;
    }

    input.value = params.get('q') || '';

    function render() {
        var keyword = input.value.trim().toLowerCase();
        var selectedRegion = region ? region.value : '';
        var selectedType = type ? type.value : '';
        var movies = window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' ')].join(' ').toLowerCase();
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchRegion = !selectedRegion || movie.region === selectedRegion;
            var matchType = !selectedType || movie.type.indexOf(selectedType) !== -1;
            return matchKeyword && matchRegion && matchType;
        }).slice(0, 120);

        results.innerHTML = movies.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a href="' + movie.file + '" class="card-poster" aria-label="观看' + escapeHtml(movie.title) + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
                '        <span class="card-play">▶</span>',
                '    </a>',
                '    <div class="card-body">',
                '        <h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="card-meta">',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.year) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '        </div>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[character];
        });
    }

    [input, region, type].forEach(function (control) {
        if (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        }
    });

    render();
})();
