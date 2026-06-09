(function () {
    "use strict";

    var hlsLoaderPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalise(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        if (slides.length < 2) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                schedule();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                schedule();
            });
        });

        schedule();
    }

    function initImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img[data-fallback-title]"));

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                var parent = image.parentElement;
                if (parent && !parent.querySelector(".image-fallback-label")) {
                    var label = document.createElement("span");
                    label.className = "image-fallback-label";
                    label.textContent = image.getAttribute("data-fallback-title") || "影片封面";
                    label.style.position = "absolute";
                    label.style.left = "14px";
                    label.style.right = "14px";
                    label.style.bottom = "18px";
                    label.style.zIndex = "1";
                    label.style.color = "#ffffff";
                    label.style.fontWeight = "800";
                    label.style.lineHeight = "1.45";
                    label.style.textShadow = "0 2px 10px rgba(0, 0, 0, 0.35)";
                    parent.appendChild(label);
                }
            });
        });
    }

    function getFilterValue(name) {
        var field = document.querySelector("[data-filter='" + name + "']");
        return field ? normalise(field.value) : "";
    }

    function applyLocalSearch() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        var count = document.querySelector("[data-result-count]");
        var empty = document.querySelector("[data-empty-state]");
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var query = "";
        searchInputs.some(function (input) {
            query = normalise(input.value);
            return Boolean(query);
        });
        var region = getFilterValue("region");
        var type = getFilterValue("type");
        var year = getFilterValue("year");
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalise(card.getAttribute("data-title"));
            var cardRegion = normalise(card.getAttribute("data-region"));
            var cardType = normalise(card.getAttribute("data-type"));
            var cardYear = normalise(card.getAttribute("data-year"));
            var matched = true;

            if (query && haystack.indexOf(query) === -1) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.classList.toggle("is-hidden", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = visible + " 部";
        }
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0 && cards.length > 0);
        }
    }

    function initSearchAndFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get("q") || "";

        if (queryFromUrl) {
            searchInputs.forEach(function (input) {
                input.value = queryFromUrl;
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                searchInputs.forEach(function (otherInput) {
                    if (otherInput !== input) {
                        otherInput.value = input.value;
                    }
                });
                applyLocalSearch();
            });
            var form = input.closest("form");
            if (form) {
                form.addEventListener("submit", function (event) {
                    var localListing = document.querySelector("[data-card-grid]");
                    if (localListing) {
                        event.preventDefault();
                        applyLocalSearch();
                    }
                });
            }
        });

        filters.forEach(function (filter) {
            filter.addEventListener("change", applyLocalSearch);
        });

        applyLocalSearch();
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }
        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("HLS library failed to initialise."));
                }
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load."));
            };
            document.head.appendChild(script);
        });
        return hlsLoaderPromise;
    }

    function playVideo(player) {
        var video = player.querySelector("video[data-src]");
        var message = player.querySelector("[data-player-message]");

        if (!video) {
            return;
        }

        var source = video.getAttribute("data-src");
        if (!source) {
            if (message) {
                message.textContent = "当前影片没有可用播放源。";
            }
            return;
        }

        function attemptPlay() {
            player.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (message) {
                        message.textContent = "播放器已准备好，请再次点击视频播放按钮。";
                    }
                });
            }
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", attemptPlay, { once: true });
            video.load();
            if (message) {
                message.textContent = "正在使用浏览器原生 HLS 能力播放。";
            }
            return;
        }

        loadHlsLibrary().then(function (Hls) {
            if (Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    if (message) {
                        message.textContent = "HLS 播放源加载完成。";
                    }
                    attemptPlay();
                });
                hls.on(Hls.Events.ERROR, function (_, data) {
                    if (message && data && data.fatal) {
                        message.textContent = "播放源加载遇到问题，请刷新页面后重试。";
                    }
                });
            } else {
                video.src = source;
                video.load();
                attemptPlay();
            }
        }).catch(function () {
            video.src = source;
            video.load();
            attemptPlay();
            if (message) {
                message.textContent = "已尝试直接加载播放源；若浏览器不支持 HLS，请更换浏览器。";
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var button = player.querySelector("[data-play-button]");
            if (button) {
                button.addEventListener("click", function () {
                    playVideo(player);
                });
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initImageFallbacks();
        initSearchAndFilters();
        initPlayers();
    });
}());
