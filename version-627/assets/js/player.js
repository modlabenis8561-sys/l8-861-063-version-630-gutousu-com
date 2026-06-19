(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-button]');
    var status = shell.querySelector('[data-player-status]');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var prepared = false;

    if (!video || !button || !stream) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频暂时无法播放');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        setStatus('视频暂时无法播放');
      }
    }

    function play() {
      prepare();
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          setStatus('点击视频区域继续播放');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setStatus('');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-stream]')).forEach(setupPlayer);
  });
})();
