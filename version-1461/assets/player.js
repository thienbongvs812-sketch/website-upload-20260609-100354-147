(function () {
  function preparePlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.play-cover');
    var stream = wrapper.getAttribute('data-video-url');
    var ready = false;
    var hls = null;

    function loadVideo() {
      if (ready || !video || !stream) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function startVideo() {
      loadVideo();
      wrapper.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          wrapper.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          startVideo();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(preparePlayer);
})();
