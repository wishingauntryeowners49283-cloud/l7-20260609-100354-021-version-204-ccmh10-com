
(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.mobile-toggle');

    if (header && toggle) {
        toggle.addEventListener('click', function () {
            var open = header.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
        var textInput = panel.querySelector('[data-filter-text]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var list = document.querySelector('[data-filter-list]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function applyFilter() {
            var text = textInput ? textInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : ''
                ].join(' ');
                var matchText = !text || haystack.indexOf(text) !== -1;
                var matchRegion = !region || card.getAttribute('data-region') === region;
                var cardType = card.getAttribute('data-type') || '';
                var matchType = !type || cardType.indexOf(type) !== -1;
                card.classList.toggle('is-hidden', !(matchText && matchRegion && matchType));
            });
        }

        [textInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
