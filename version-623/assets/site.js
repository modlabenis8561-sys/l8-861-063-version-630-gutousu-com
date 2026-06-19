(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.js-filter-panel'));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-target') || '.movie-grid';
      var scope = document.querySelector(scopeSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var input = panel.querySelector('.movie-search');
      var typeSelect = panel.querySelector('.movie-type');
      var yearSelect = panel.querySelector('.movie-year');
      var empty = document.querySelector(panel.getAttribute('data-empty') || '.no-match');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function run() {
        var keyword = normalize(input ? input.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            ok = false;
          }
          if (year && cardYear !== year) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (node) {
        if (node) {
          node.addEventListener('input', run);
          node.addEventListener('change', run);
        }
      });
      run();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('.movie-video');
    var button = document.querySelector('.video-overlay');
    if (!video || !button || !streamUrl) {
      return;
    }
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilter();
  });
})();
