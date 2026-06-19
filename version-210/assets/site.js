(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('siteNav');
    var search = document.querySelector('.nav-search');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = !nav.classList.contains('is-open');
            nav.classList.toggle('is-open', open);
            if (search) {
                search.classList.toggle('is-open', open);
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showSlide(index);
            startHero();
        });
    });

    startHero();

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getCardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' '));
    }

    function matchYear(cardYear, selectedYear) {
        if (!selectedYear) {
            return true;
        }
        if (selectedYear === 'older') {
            var number = parseInt(cardYear, 10);
            return Number.isFinite(number) && number < 2020;
        }
        return cardYear === selectedYear;
    }

    function applyFilters() {
        if (!filterInputs.length || !cards.length) {
            return;
        }
        var values = {};
        filterInputs.forEach(function (input) {
            values[input.getAttribute('data-filter-field')] = normalize(input.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
            var text = getCardText(card);
            var year = normalize(card.getAttribute('data-year'));
            var type = normalize(card.getAttribute('data-type'));
            var genre = normalize(card.getAttribute('data-genre'));
            var category = normalize(card.getAttribute('data-category'));
            var matched = true;

            if (values.query && text.indexOf(values.query) === -1) {
                matched = false;
            }
            if (values.year && !matchYear(year, values.year)) {
                matched = false;
            }
            if (values.type && type.indexOf(values.type) === -1 && genre.indexOf(values.type) === -1) {
                matched = false;
            }
            if (values.category && category.indexOf(values.category) === -1) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (filterInputs.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            filterInputs.forEach(function (input) {
                if (input.getAttribute('data-filter-field') === 'query') {
                    input.value = query;
                }
            });
        }
        filterInputs.forEach(function (input) {
            input.addEventListener('input', applyFilters);
            input.addEventListener('change', applyFilters);
        });
        applyFilters();
    }
})();
