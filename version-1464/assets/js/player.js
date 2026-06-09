(function () {
    function setupPlayer(box) {
        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var status = box.querySelector(".player-status");
        var stream = box.getAttribute("data-stream");
        var hls = null;
        var ready = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function attach() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            setStatus("正在加载影片...");
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("影片已就绪");
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("网络波动，正在重试...");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("视频恢复中...");
                        hls.recoverMediaError();
                    } else {
                        setStatus("暂时无法播放该影片");
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("影片已就绪");
                }, { once: true });
            } else {
                setStatus("暂时无法播放该影片");
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    setStatus("点击视频控件开始播放");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                setStatus("影片已暂停");
            });
            video.addEventListener("ended", function () {
                setStatus("播放结束");
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
    });
})();
