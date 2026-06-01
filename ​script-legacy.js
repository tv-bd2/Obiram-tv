// Obiram TV - Self Healing Core Engine
document.addEventListener("DOMContentLoaded", function () {
    console.log("Obiram TV Engine Active & Fixing Paths...");

    // ১. মিসিং সিএসএস এবং ফন্ট ইন্টিগ্রেশন (ডিজাইন ঠিক করার জন্য)
    injectMissingAssets();

    // ২. লোডিং স্ক্রিন হ্যান্ডলার
    const loadingScreen = document.getElementById('loading-screen') || document.querySelector('.loading');
    if (loadingScreen) {
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 800);
    }

    // ৩. মেইন ভিডিও প্লেয়ার
    const videoElement = document.getElementById('main-video-player') || document.querySelector('video');

    // ৪. সব চ্যানেল কার্ড অ্যাক্টিভেশন
    const channelCards = document.querySelectorAll('.channel-card, .grid-item');
    channelCards.forEach(card => {
        card.addEventListener('click', function () {
            const streamUrl = this.getAttribute('data-stream-url');
            const streamType = this.getAttribute('data-stream-type') || 'm3u8';
            const name = this.querySelector('.channel-name, h3')?.innerText || "Live";

            if (!streamUrl) {
                alert("এই চ্যানেলের কোনো লাইভ লিঙ্ক নেই!");
                return;
            }

            console.log(`Playing: ${name}`);
            playChannel(streamUrl, streamType, videoElement);
        });
    });
});

// গিটহাব পেজেসের ভাঙা ডিজাইন ফিক্স করার ফাংশন
function injectMissingAssets() {
    // ফন্টঅসাম আইকন লোড করা (যদি মিসিং থাকে)
    if (!document.querySelector("link[href*='font-awesome']")) {
        let fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }
    
    // গুগল ফন্টস লোড করা
    if (!document.querySelector("link[href*='fonts.googleapis']")) {
        let gf = document.createElement('link');
        gf.rel = 'stylesheet';
        gf.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';
        document.head.appendChild(gf);
    }

    // অতিরিক্ত নিয়ন গ্লো ফিক্স (বডি ও কার্ডের জন্য ব্যাকআপ স্টাইল)
    let style = document.createElement('style');
    style.innerHTML = `
        body { font-family: 'Poppins', sans-serif !important; background-color: #0b0c10 !important; color: #fff; }
        .channel-card { cursor: pointer; transition: all 0.3s ease; }
        .channel-card:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(0, 242, 254, 0.6); }
    `;
    document.head.appendChild(style);
}

// প্লেয়ার ইঞ্জিন
function playChannel(url, type, video) {
    if (!video) return;

    if (window.tsPlayer) {
        window.tsPlayer.destroy();
        window.tsPlayer = null;
    }

    if (type === 'ts' || url.includes('.ts') || type === 'mpegts') {
        if (typeof mpegts !== 'undefined' && mpegts.getFeatureList().mseLivePlayback) {
            window.tsPlayer = mpegts.createPlayer({ type: 'mse', isLive: true, url: url });
            window.tsPlayer.attachMediaElement(video);
            window.tsPlayer.load();
            window.tsPlayer.play().catch(e => console.log(e));
        }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(e => console.log(e));
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        if (window.hlsEngine) { window.hlsEngine.destroy(); }
        window.hlsEngine = new Hls();
        window.hlsEngine.loadSource(url);
        window.hlsEngine.attachMediaElement(video);
        window.hlsEngine.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(e => console.log(e)); });
    } else {
        video.src = url;
        video.play().catch(e => console.log(e));
    }
}
