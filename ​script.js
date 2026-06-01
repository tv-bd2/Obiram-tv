// Obiram TV - Core Player Engine
document.addEventListener("DOMContentLoaded", function () {
    console.log("Obiram TV Engine Ready!");

    // ১. লোডিং স্ক্রিন বন্ধ করা
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 800);
    }

    // ২. মেইন ভিডিও প্লেয়ার সিলেক্ট করা
    const videoElement = document.getElementById('main-video-player');

    // ৩. সব চ্যানেল কার্ডে ক্লিক লিসেনার যুক্ত করা
    const channelCards = document.querySelectorAll('.channel-card');
    
    channelCards.forEach(card => {
        card.addEventListener('click', function () {
            const streamUrl = this.getAttribute('data-stream-url');
            const streamType = this.getAttribute('data-stream-type') || 'm3u8';
            
            if (!streamUrl) {
                alert("এই চ্যানেলের কোনো লাইভ লিঙ্ক নেই!");
                return;
            }

            // স্ট্রিম প্লে করা
            playChannel(streamUrl, streamType, videoElement);
        });
    });
});

// লাইভ চ্যানেল প্লে করার মূল ফাংশন (HLS এবং MPEG-TS সাপোর্ট)
function playChannel(url, type, video) {
    if (!video) return;

    // পুরোনো কোনো tsPlayer সেশন থাকলে তা রিমুভ করা
    if (window.tsPlayer) {
        window.tsPlayer.destroy();
        window.tsPlayer = null;
    }

    // যদি .ts বা mpegts ফরম্যাটের স্ট্রিম হয়
    if (type === 'ts' || url.includes('.ts') || type === 'mpegts') {
        if (typeof mpegts !== 'undefined' && mpegts.getFeatureList().mseLivePlayback) {
            window.tsPlayer = mpegts.createPlayer({ type: 'mse', isLive: true, url: url });
            window.tsPlayer.attachMediaElement(video);
            window.tsPlayer.load();
            window.tsPlayer.play().catch(err => console.log("MPEG-TS Playback error:", err));
        }
    } 
    // যদি সাধারণ HLS (.m3u8) স্ট্রিম হয় (স্মার্ট টিভি, আইফোন বা অ্যান্ড্রয়েড ব্রাউজারের জন্য)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(err => console.log("HLS Native Playback error:", err));
    } 
    // কম্পিউটার বা অন্যান্য ব্রাউজারে hls.js এর মাধ্যমে চালানোর জন্য
    else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        if (window.hlsEngine) { window.hlsEngine.destroy(); }
        window.hlsEngine = new Hls();
        window.hlsEngine.loadSource(url);
        window.hlsEngine.attachMediaElement(video);
        window.hlsEngine.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(err => console.log("Hls.js Playback error:", err));
        });
    } else {
        // ব্যাকআপ প্লে পদ্ধতি
        video.src = url;
        video.play().catch(err => console.log("Direct Playback error:", err));
    }
}
