(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        start();
    }

    function initSearch() {
        var page = document.querySelector('[data-search-page]');
        var results = document.querySelector('[data-search-results]');
        if (!page || !results) {
            return;
        }
        var keyword = page.querySelector('[data-filter-keyword]');
        var region = page.querySelector('[data-filter-region]');
        var type = page.querySelector('[data-filter-type]');
        var year = page.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(results.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        if (params.get('q') && keyword) {
            keyword.value = params.get('q');
        }
        function match(card) {
            var k = (keyword && keyword.value || '').trim().toLowerCase();
            var r = region && region.value || '';
            var t = type && type.value || '';
            var y = year && year.value || '';
            var text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();
            if (k && text.indexOf(k) === -1) {
                return false;
            }
            if (r && card.dataset.region !== r) {
                return false;
            }
            if (t && card.dataset.type !== t) {
                return false;
            }
            if (y && card.dataset.year !== y) {
                return false;
            }
            return true;
        }
        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !match(card));
            });
        }
        [keyword, region, type, year].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('player-start');
        var config = document.getElementById('play-config');
        if (!video || !config) {
            return;
        }
        var url = '';
        var loaded = false;
        var hls = null;
        try {
            url = JSON.parse(config.textContent).url || '';
        } catch (error) {
            url = '';
        }
        function playVideo() {
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }
        function begin() {
            if (!url) {
                return;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    loaded = true;
                    playVideo();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    loaded = true;
                } else {
                    video.src = url;
                    loaded = true;
                    playVideo();
                }
            } else {
                playVideo();
            }
        }
        if (button) {
            button.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
})();
