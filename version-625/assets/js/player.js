import { H as Hls } from './hls-vendor.js';

var video = document.querySelector('[data-player]');
var button = document.querySelector('[data-play-button]');
var attached = false;

function attach() {
  if (!video || attached) {
    return;
  }

  attached = true;
  var url = video.getAttribute('data-url');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(url);
    hls.attachMedia(video);
  } else {
    video.src = url;
  }
}

function play() {
  attach();
  if (button) {
    button.classList.add('is-hidden');
  }
  var attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(function () {});
  }
}

if (video) {
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  video.addEventListener('click', function () {
    if (!attached) {
      play();
    }
  });
}

if (button) {
  button.addEventListener('click', play);
}
