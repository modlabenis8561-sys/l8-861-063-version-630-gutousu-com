(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (value) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[value];
    });
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!input || !grid) {
      return;
    }
    var items = Array.prototype.slice.call(grid.children);
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      items.forEach(function (item) {
        var haystack = normalize((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '') + ' ' + item.textContent);
        item.setAttribute('data-filter-hidden', query && haystack.indexOf(query) === -1 ? 'true' : 'false');
      });
    });
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card card-hover">' +
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">' +
      '<span class="movie-year">' + escapeHtml(movie.year || movie.type) + '</span>' +
      '</a>' +
      '<div class="movie-card-content">' +
      '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
      '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p class="movie-card-text">' + escapeHtml(movie.text) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var container = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.querySelector('[data-search-input]');
    if (!container || !status || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    var normalized = normalize(query);
    if (!normalized) {
      container.innerHTML = '';
      status.textContent = '输入关键词开始搜索。';
      return;
    }
    var results = window.MOVIE_INDEX.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.genre + ' ' + movie.tags.join(' ') + ' ' + movie.year + ' ' + movie.region + ' ' + movie.text).indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!results.length) {
      container.innerHTML = '';
      status.textContent = '未找到匹配影片，请尝试更换关键词。';
      return;
    }
    status.textContent = '已找到相关影片，点击卡片进入详情。';
    container.innerHTML = results.map(movieCardHtml).join('');
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
