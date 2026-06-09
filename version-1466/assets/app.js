(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-key]"));
            var empty = scope.querySelector("[data-empty-result]");
            var filters = {};

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var matchText = !query || haystack.indexOf(query) !== -1;
                    var matchFilters = Object.keys(filters).every(function (key) {
                        if (!filters[key] || filters[key] === "all") {
                            return true;
                        }
                        return (card.getAttribute("data-" + key) || "") === filters[key];
                    });
                    var visible = matchText && matchFilters;
                    card.classList.toggle("hidden-card", !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.getAttribute("data-filter-key");
                    var value = button.getAttribute("data-filter-value") || "all";
                    filters[key] = value;
                    buttons.filter(function (item) {
                        return item.getAttribute("data-filter-key") === key;
                    }).forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    window.initMoviePlayer = function (playableUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        var errorBox = document.getElementById("playerError");
        var prepared = false;
        var hlsInstance = null;

        if (!video || !overlay || !playableUrl) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.hidden = false;
            }
            overlay.classList.remove("is-hidden");
        }

        function prepare() {
            if (prepared) {
                return true;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playableUrl;
                prepared = true;
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playableUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        showError();
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                    }
                });
                prepared = true;
                return true;
            }
            showError();
            return false;
        }

        function startPlayback() {
            if (!prepare()) {
                return;
            }
            overlay.classList.add("is-hidden");
            video.controls = true;
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
