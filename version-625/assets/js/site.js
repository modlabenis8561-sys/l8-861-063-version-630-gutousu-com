(function () {
  var menuButton = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 6200);
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          setSlide(i);
          startTimer();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          setSlide(current - 1);
          startTimer();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          setSlide(current + 1);
          startTimer();
        });
      }
      startTimer();
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre].join(' ').toLowerCase();
        card.style.display = text.indexOf(q) === -1 ? 'none' : '';
      });
    });
  }
})();
