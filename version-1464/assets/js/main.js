(function () {
    function $(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function runMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function runHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $(".hero-slide", hero);
        var dots = $("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function runSiteSearchForms() {
        $("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var prefix = form.getAttribute("data-search-prefix") || "";
                var query = input ? input.value.trim() : "";
                var target = prefix + "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function runFilters() {
        var items = $(".filter-item");
        if (!items.length) {
            return;
        }
        var input = document.querySelector(".js-filter-input");
        var selects = $(".js-filter-select");
        var empty = document.querySelector("[data-filter-empty]");

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var visible = 0;
            items.forEach(function (item) {
                var text = normalize([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-keywords")
                ].join(" "));
                var matched = !keyword || text.indexOf(keyword) !== -1;
                selects.forEach(function (select) {
                    var value = normalize(select.value);
                    var field = select.getAttribute("data-filter-field");
                    var itemValue = normalize(item.getAttribute("data-" + field));
                    if (value && itemValue.indexOf(value) === -1) {
                        matched = false;
                    }
                });
                item.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function card(movie) {
        return "<article class=\"movie-card\">" +
            "<a href=\"movie/" + movie.id4 + ".html\">" +
            "<div class=\"movie-card__image\">" +
            "<img src=\"./" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"movie-card__play\">▶</span>" +
            "<span class=\"movie-card__score\">" + escapeHtml(movie.rating) + "</span>" +
            "</div>" +
            "<div class=\"movie-card__body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"movie-card__meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "</div></a></article>";
    }

    function runSearchPage() {
        var container = document.querySelector("#search-results");
        var input = document.querySelector("#search-input");
        var note = document.querySelector("#search-note");
        if (!container || !input || !window.siteData) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var firstQuery = params.get("q") || "";
        input.value = firstQuery;

        function render() {
            var query = normalize(input.value);
            var list = window.siteData.filter(function (movie) {
                var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" "));
                return !query || text.indexOf(query) !== -1;
            }).slice(0, 120);
            container.innerHTML = list.map(card).join("");
            if (note) {
                note.textContent = list.length ? "为您匹配到相关影片" : "没有找到匹配的影片";
            }
        }

        input.addEventListener("input", render);
        render();
    }

    function runImages() {
        $("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        runMobileNav();
        runHero();
        runSiteSearchForms();
        runFilters();
        runSearchPage();
        runImages();
    });
})();
