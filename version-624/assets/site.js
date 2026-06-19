const App = {
    init() {
        this.bindMenu();
        this.bindHero();
        this.bindFilters();
        this.applyQueryToSearch();
    },

    bindMenu() {
        const button = document.querySelector('.mobile-menu-button');
        const nav = document.querySelector('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    },

    bindHero() {
        const root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        const slides = Array.from(root.querySelectorAll('.hero-slide'));
        const dots = Array.from(root.querySelectorAll('.hero-dot'));
        const prev = root.querySelector('.hero-prev');
        const next = root.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        let current = 0;
        const show = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };
        prev && prev.addEventListener('click', () => show(current - 1));
        next && next.addEventListener('click', () => show(current + 1));
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => show(index));
        });
        window.setInterval(() => show(current + 1), 5000);
    },

    bindFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
            const input = scope.querySelector('.filter-input');
            const year = scope.querySelector('.filter-select');
            const category = scope.querySelector('.filter-category');
            const items = Array.from(scope.querySelectorAll('.movie-card, .rank-item'));
            const update = () => {
                const q = (input && input.value || '').trim().toLowerCase();
                const y = year && year.value || '';
                const c = category && category.value || '';
                items.forEach((item) => {
                    const text = (item.getAttribute('data-search') || '').toLowerCase();
                    const itemYear = item.getAttribute('data-year') || '';
                    const itemCategory = item.getAttribute('data-category') || '';
                    const matchQuery = !q || text.includes(q);
                    const matchYear = !y || itemYear === y;
                    const matchCategory = !c || itemCategory === c;
                    item.classList.toggle('is-hidden', !(matchQuery && matchYear && matchCategory));
                });
            };
            input && input.addEventListener('input', update);
            year && year.addEventListener('change', update);
            category && category.addEventListener('change', update);
        });
    },

    applyQueryToSearch() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (!q) {
            return;
        }
        const input = document.querySelector('.filter-input');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
        }
    },

    initPlayer(videoUrl) {
        const video = document.querySelector('.movie-player');
        const overlay = document.querySelector('.player-overlay');
        if (!video || !overlay || !videoUrl) {
            return;
        }
        let attached = false;
        const attach = () => {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ enableWorker: true });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        hls.destroy();
                    }
                });
            } else {
                overlay.innerHTML = '<span>▶</span>';
            }
        };
        const start = () => {
            attach();
            overlay.classList.add('is-hidden');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    overlay.classList.remove('is-hidden');
                });
            }
        };
        overlay.addEventListener('click', start);
        video.addEventListener('play', () => overlay.classList.add('is-hidden'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
