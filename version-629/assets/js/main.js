(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>\"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[character];
    });
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (toggle && mobilePanel) {
      toggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".js-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var timer = null;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
          slide.classList.toggle("is-active", idx === current);
        });
        dots.forEach(function (dot, idx) {
          dot.classList.toggle("is-active", idx === current);
        });
      };
      var startTimer = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          showSlide(idx);
          startTimer();
        });
      });
      startTimer();
    }

    document.querySelectorAll("[data-filter-board]").forEach(function (board) {
      var keyword = board.querySelector("[data-filter-keyword]");
      var selects = Array.prototype.slice.call(board.querySelectorAll("[data-filter-select]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = document.querySelector(".no-results");
      var apply = function () {
        var query = normalize(keyword && keyword.value);
        var selected = {};
        selects.forEach(function (select) {
          selected[select.getAttribute("data-filter-select")] = normalize(select.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title"));
          var match = true;
          if (query && text.indexOf(query) === -1) {
            match = false;
          }
          Object.keys(selected).forEach(function (key) {
            var value = selected[key];
            if (value && normalize(card.getAttribute("data-" + key)).indexOf(value) === -1) {
              match = false;
            }
          });
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };
      if (keyword) {
        keyword.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });

    var searchMount = document.getElementById("searchResults");
    if (searchMount && window.FAMILY_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var queryInput = document.getElementById("searchKeyword");
      var status = document.getElementById("searchStatus");
      var loadMore = document.getElementById("loadMoreResults");
      var query = params.get("q") || "";
      var results = [];
      var shown = 0;
      var pageSize = 40;

      if (queryInput) {
        queryInput.value = query;
      }

      var makeCard = function (movie) {
        var title = escapeHtml(movie.title);
        var year = escapeHtml(movie.year);
        var region = escapeHtml(movie.region);
        var type = escapeHtml(movie.type);
        var oneLine = escapeHtml(movie.oneLine);
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
          "<a class=\"poster-link\" href=\"./movie/" + movie.slug + ".html\" aria-label=\"观看" + title + "\">" +
          "<img src=\"./" + movie.cover + ".jpg\" alt=\"" + title + "\" loading=\"lazy\" decoding=\"async\">" +
          "<span class=\"movie-badge\">" + year + "</span>" +
          "<span class=\"play-dot\">▶</span>" +
          "</a>" +
          "<div class=\"movie-body\">" +
          "<div class=\"movie-kicker\">" + region + " · " + type + "</div>" +
          "<h2><a href=\"./movie/" + movie.slug + ".html\">" + title + "</a></h2>" +
          "<p>" + oneLine + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
      };

      var renderMore = function () {
        var next = results.slice(shown, shown + pageSize);
        searchMount.insertAdjacentHTML("beforeend", next.map(makeCard).join(""));
        shown += next.length;
        if (loadMore) {
          loadMore.style.display = shown < results.length ? "inline-flex" : "none";
        }
      };

      var runSearch = function (value) {
        var term = normalize(value);
        searchMount.innerHTML = "";
        shown = 0;
        results = window.FAMILY_MOVIES.filter(function (movie) {
          var haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" "));
          return !term || haystack.indexOf(term) !== -1;
        });
        if (status) {
          status.textContent = term ? "为你找到以下相关影视内容" : "浏览片名、地区、年份与题材结果";
        }
        renderMore();
      };

      var form = document.getElementById("searchPageForm");
      if (form && queryInput) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var value = queryInput.value.trim();
          var nextUrl = "./search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
          window.history.replaceState(null, "", nextUrl);
          runSearch(value);
        });
      }
      if (loadMore) {
        loadMore.addEventListener("click", renderMore);
      }
      runSearch(query);
    }
  });
})();
