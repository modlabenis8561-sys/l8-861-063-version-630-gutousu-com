(function () {
    const toggle = document.querySelector('.nav-toggle');
    const panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dots button'));
    let current = 0;

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

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot && Array.isArray(window.SEARCH_MOVIES)) {
        const queryInput = searchRoot.querySelector('[data-search-input]');
        const typeSelect = searchRoot.querySelector('[data-type-filter]');
        const yearSelect = searchRoot.querySelector('[data-year-filter]');
        const resultBox = searchRoot.querySelector('[data-search-results]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        queryInput.value = initialQuery;

        function card(movie) {
            const tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<a class="movie-card" href="' + movie.file + '">' +
                '<figure class="poster-frame">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">' +
                '<figcaption>' + escapeHtml(movie.category) + '</figcaption>' +
                '</figure>' +
                '<div class="movie-card-body compact">' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>' +
                '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
                '</a>';
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch() {
            const query = queryInput.value.trim().toLowerCase();
            const type = typeSelect.value;
            const year = yearSelect.value;
            const list = window.SEARCH_MOVIES.filter(function (movie) {
                const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
                const queryMatch = !query || text.indexOf(query) !== -1;
                const typeMatch = !type || movie.type.indexOf(type) !== -1 || movie.genre.indexOf(type) !== -1 || movie.category.indexOf(type) !== -1;
                const yearMatch = !year || movie.year === year;
                return queryMatch && typeMatch && yearMatch;
            }).slice(0, 120);

            if (!list.length) {
                resultBox.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
                return;
            }
            resultBox.innerHTML = '<div class="movie-grid">' + list.map(card).join('') + '</div>';
        }

        [queryInput, typeSelect, yearSelect].forEach(function (element) {
            element.addEventListener('input', runSearch);
            element.addEventListener('change', runSearch);
        });

        runSearch();
    }
}());
