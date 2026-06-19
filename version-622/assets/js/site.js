(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
        });
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play-cover]");
      var stream = player.getAttribute("data-stream");
      var hlsPlayer = null;
      var hasStarted = false;

      function begin() {
        if (!video || !stream) {
          return;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (!hasStarted) {
          hasStarted = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls();
            hlsPlayer.loadSource(stream);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
          hlsPlayer = null;
        }
      });
    });
  });
})();
