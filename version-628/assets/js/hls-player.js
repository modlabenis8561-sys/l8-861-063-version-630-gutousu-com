function setupMoviePlayer(config) {
    const video = document.getElementById(config.videoId);
    const overlay = document.getElementById(config.overlayId);
    if (!video || !overlay || !config.url) {
        return;
    }

    let attached = false;

    function attachSource() {
        if (attached) {
            video.play().catch(function () {});
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.url;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(config.url);
            hls.attachMedia(video);
        } else {
            video.src = config.url;
        }

        attached = true;
        video.play().catch(function () {});
    }

    function startPlayback() {
        overlay.classList.add('is-hidden');
        attachSource();
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
}
