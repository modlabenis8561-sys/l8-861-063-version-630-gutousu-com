(function () {
    const body = document.body;
    const root = body ? body.getAttribute("data-root") || "./" : "./";

    function resolvePath(path) {
        if (!path) {
            return root;
        }
        if (path.startsWith("http") || path.startsWith("/")) {
            return path;
        }
        if (root === "./") {
            return path;
        }
        return root + path;
    }

    function initMenu() {
        const toggle = document.querySelector(".nav-toggle");
        const links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const next = Number(dot.getAttribute("data-hero-dot"));
                show(next);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function filterItems(term, limit) {
        const data = window.SITE_SEARCH_INDEX || [];
        const key = String(term || "").trim().toLowerCase();
        if (!key) {
            return [];
        }
        return data.filter(function (item) {
            return [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.oneLine
            ].join(" ").toLowerCase().includes(key);
        }).slice(0, limit || 10);
    }

    function initSearchSuggest() {
        document.querySelectorAll(".site-search").forEach(function (form) {
            const input = form.querySelector("input[type='search']");
            const suggest = form.querySelector(".search-suggest");
            if (!input || !suggest) {
                return;
            }
            input.addEventListener("input", function () {
                const matches = filterItems(input.value, 6);
                if (!matches.length) {
                    suggest.classList.remove("is-open");
                    suggest.innerHTML = "";
                    return;
                }
                suggest.innerHTML = matches.map(function (item) {
                    return [
                        "<a href=\"" + resolvePath(item.url) + "\">",
                        "<strong>" + escapeHtml(item.title) + "</strong>",
                        "<span>" + escapeHtml(item.region + " · " + item.type + " · " + item.year) + "</span>",
                        "</a>"
                    ].join("");
                }).join("");
                suggest.classList.add("is-open");
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    suggest.classList.remove("is-open");
                }
            });
        });
    }

    function initSearchPage() {
        const box = document.getElementById("searchResults");
        if (!box) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        const input = document.querySelector(".big-search input[name='q']");
        if (input) {
            input.value = q;
        }
        if (!q.trim()) {
            box.innerHTML = "<div class=\"empty-state\">输入关键词即可搜索影片。</div>";
            return;
        }
        const matches = filterItems(q, 120);
        if (!matches.length) {
            box.innerHTML = "<div class=\"empty-state\">没有找到匹配影片。</div>";
            return;
        }
        box.innerHTML = [
            "<div class=\"section-title\"><div><span class=\"eyebrow\">Results</span><h2>搜索结果</h2></div></div>",
            "<div class=\"grid poster-grid five\">",
            matches.map(renderSearchCard).join(""),
            "</div>"
        ].join("");
    }

    function renderSearchCard(item) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + resolvePath(item.url) + "\" class=\"poster-link\"><span class=\"poster-frame\"><img src=\"" + root + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"score-badge\">热播</span></span></a>",
            "<div class=\"card-body\"><h3><a href=\"" + resolvePath(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
            "<p>" + escapeHtml(item.oneLine || "") + "</p>",
            "<div class=\"meta-row\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div></div>",
            "</article>"
        ].join("");
    }

    function initPlayers() {
        document.querySelectorAll(".movie-player").forEach(function (player) {
            const video = player.querySelector("video");
            const button = player.querySelector("[data-action='play']");
            const source = player.getAttribute("data-video-url");
            let loaded = false;
            let hls = null;

            function loadAndPlay() {
                if (!video || !source) {
                    return;
                }
                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                    loaded = true;
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function () {
                        player.classList.add("is-playing");
                    }).catch(function () {
                        player.classList.remove("is-playing");
                    });
                } else {
                    player.classList.add("is-playing");
                }
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }
            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (video.currentTime === 0 || video.ended) {
                        player.classList.remove("is-playing");
                    }
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        loadAndPlay();
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    initMenu();
    initImages();
    initHero();
    initSearchSuggest();
    initSearchPage();
    initPlayers();
})();
