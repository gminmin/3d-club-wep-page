const videoPlayer = document.getElementById('portfolio-player');
const titleNode = document.getElementById('video-title');
const descriptionNode = document.getElementById('video-description');
const playToggle = document.getElementById('play-toggle');
const volumeBar = document.getElementById('volume-bar');
const volumeToggle = document.getElementById('volume-toggle');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const progressBar = document.getElementById('progress-bar');
const progressWrap = document.querySelector('.progress-wrap');
const timeLabel = document.getElementById('time-label');
const videoViewport = document.querySelector('.video-viewport');
const videoStage = document.querySelector('.video-stage');
const videoControls = document.querySelector('.video-controls');
const videoInfo = document.querySelector('.video-info');
const pageRoot = document.documentElement;
let controlsHideTimer;

const cloudName = 'dfrh0djn3';
const baseVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

function createPoster(label, fromColor, toColor) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${fromColor}" />
          <stop offset="100%" stop-color="${toColor}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <circle cx="1040" cy="140" r="120" fill="rgba(255,255,255,0.12)"/>
      <circle cx="930" cy="520" r="190" fill="rgba(255,255,255,0.08)"/>
      <rect x="80" y="420" width="350" height="8" rx="4" fill="rgba(255,255,255,0.55)"/>
      <rect x="80" y="450" width="235" height="8" rx="4" fill="rgba(255,255,255,0.30)"/>
      <text x="80" y="320" fill="white" font-family="Noto Sans KR, Arial, sans-serif" font-size="54" font-weight="700">JB3D</text>
      <text x="80" y="385" fill="white" font-family="Noto Sans KR, Arial, sans-serif" font-size="74" font-weight="900">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const knownVideos = {
  'homepage-hongbo': {
    title: '3D 캐릭터 컨셉 영상',
    description: '메타버스와 3D 콘텐츠 제작 과정을 담은 포트폴리오 영상입니다. 모델링, 환경 구성, 그리고 협업 과정을 한눈에 보여줍니다.',
    src: `${baseVideoUrl}/v1777538955/%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9A%A9_1%EC%B0%A8_wgtt9q.mp4`,
    poster: 'https://firebasestorage.googleapis.com/v0/b/jb3d-a98fd.firebasestorage.app/o/works%2Fplayer_cover.png?alt=media&token=5a26d867-0e4d-42be-96b3-d50af0f6eb5c'
  },
  '36exp': {
    title: '36exp. 단편 애니메이션',
    description: 'Demo Project.',
    src: `${baseVideoUrl}/v1788479001/s1_3%EC%B0%A8_klxyj2.mp4`,
    poster: 'https://firebasestorage.googleapis.com/v0/b/jb3d-a98fd.firebasestorage.app/o/works%2Fplayer_cover.png?alt=media&token=5a26d867-0e4d-42be-96b3-d50af0f6eb5c'
  },
  showcase: {
    title: '공동 프로젝트 쇼케이스',
    description: '학생들이 협업으로 만든 결과물을 소개하는 쇼케이스 영상입니다. 작업 과정, 완성본, 팀 소개를 순서대로 담고 있습니다.',
    src: 'https://res.cloudinary.com/demo/video/upload/sample_video.mp4',
    poster: 'https://firebasestorage.googleapis.com/v0/b/jb3d-a98fd.firebasestorage.app/o/works%2Fplayer_cover.png?alt=media&token=5a26d867-0e4d-42be-96b3-d50af0f6eb5c'
  }
};

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function updateTimeUI() {
  const current = videoPlayer.currentTime || 0;
  const duration = videoPlayer.duration || 0;
  const percent = duration ? (current / duration) * 1000 : 0;

  progressBar.value = String(Math.min(1000, Math.max(0, percent)));
  progressWrap.style.setProperty('--progress-percent', `${percent / 10}%`);
  timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
}

function fitVideoToAvailableSpace() {
  if (!videoPlayer.videoWidth || !videoPlayer.videoHeight) return;

  const availableWidth = videoStage.clientWidth;
  const availableHeight = Math.max(
    0,
    videoStage.clientHeight - videoInfo.offsetHeight
  );
  const aspectRatio = videoPlayer.videoWidth / videoPlayer.videoHeight;

  let width = availableWidth;
  let height = width / aspectRatio;

  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspectRatio;
  }

  videoViewport.style.width = `${Math.floor(width)}px`;
  videoViewport.style.height = `${Math.floor(height)}px`;
}

function getUrlSlug() {
  const searchSlug = new URLSearchParams(window.location.search).get('video');
  if (searchSlug) return searchSlug.trim();
  return 'homepage-hongbo';
}

function updateUrl(slug) {
  const targetUrl = `${window.location.pathname}?video=${encodeURIComponent(slug)}`;

  if (window.history && window.history.pushState) {
    window.history.pushState({ slug }, '', targetUrl);
  }
}

function setVideoFromSlug(slug) {
  const safeSlug = knownVideos[slug] ? slug : 'homepage-hongbo';
  const selected = knownVideos[safeSlug];

  if (!selected) return;

  titleNode.textContent = selected.title;
  descriptionNode.textContent = selected.description;
  videoPlayer.poster = selected.poster || '';
  videoPlayer.setAttribute('poster', selected.poster || '');
  videoPlayer.src = selected.src;
  videoPlayer.load();
  videoPlayer.pause();
  playToggle.textContent = '▶';

  updateUrl(safeSlug);
}

function togglePlay() {
  if (videoPlayer.paused) {
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
}

function updateVolume() {
  const volume = Number(volumeBar.value) / 100;
  videoPlayer.volume = volume;
  videoPlayer.muted = false;
  volumeBar.style.setProperty('--volume-percent', `${volume * 100}%`);
  updateVolumeIcon();
}

function updateVolumeIcon() {
  const volume = Number(volumeBar.value) / 100;
  const isMuted = videoPlayer.muted || volume === 0;
  volumeToggle.classList.toggle('is-muted', isMuted);
  volumeToggle.classList.toggle('is-low-volume', !isMuted && volume < 0.5);
  volumeToggle.setAttribute('aria-label', isMuted ? '음소거 해제' : '음소거');
}

function toggleMute() {
  videoPlayer.muted = !videoPlayer.muted;
  updateVolumeIcon();
}

function adjustVolume(deltaPercent) {
  const next = Math.min(100, Math.max(0, Number(volumeBar.value) + deltaPercent));
  volumeBar.value = String(next);
  updateVolume();
}

function seekBy(seconds) {
  const duration = videoPlayer.duration || 0;
  if (!duration) return;

  videoPlayer.currentTime = Math.min(duration, Math.max(0, videoPlayer.currentTime + seconds));
  updateTimeUI();
}

function isShortcutBlockedTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, button, [contenteditable="true"]'));
}

function handlePlayerKeydown(event) {
  switch (event.code) {
    case 'Space':
      if (isShortcutBlockedTarget(event.target)) return;
      event.preventDefault();
      togglePlay();
      break;
    case 'KeyM':
      event.preventDefault();
      toggleMute();
      break;
    case 'ArrowUp':
      event.preventDefault();
      adjustVolume(5);
      break;
    case 'ArrowDown':
      event.preventDefault();
      adjustVolume(-5);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      seekBy(-5);
      break;
    case 'ArrowRight':
      event.preventDefault();
      seekBy(5);
      break;
    case 'KeyF':
      event.preventDefault();
      toggleFullscreen();
      break;
    default:
      break;
  }
}

function handleVideoAreaClick(event) {
  if (event.target.closest('.video-controls, .video-info, input, button')) return;
  togglePlay();
}

function toggleFullscreen() {
  const target = document.documentElement;

  if (!document.fullscreenElement) {
    if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen();
        }
      });
    } else if (videoPlayer.requestFullscreen) {
      videoPlayer.requestFullscreen();
    }
  } else {
    document.exitFullscreen();
  }
}

function revealFullscreenControls() {
  if (!document.fullscreenElement) return;

  pageRoot.classList.remove('controls-hidden');
  window.clearTimeout(controlsHideTimer);
  controlsHideTimer = window.setTimeout(() => {
    pageRoot.classList.add('controls-hidden');
  }, 2500);
}

function hideFullscreenControls() {
  if (!document.fullscreenElement) return;

  window.clearTimeout(controlsHideTimer);
  pageRoot.classList.add('controls-hidden');
}

function handleFullscreenChange() {
  window.clearTimeout(controlsHideTimer);

  if (document.fullscreenElement) {
    pageRoot.classList.remove('controls-hidden');
    requestAnimationFrame(revealFullscreenControls);
  } else {
    pageRoot.classList.remove('controls-hidden');
    requestAnimationFrame(fitVideoToAvailableSpace);
  }
}

videoPlayer.addEventListener('play', () => {
  playToggle.textContent = '❚❚';
});

videoPlayer.addEventListener('pause', () => {
  playToggle.textContent = '▶';
});

videoPlayer.addEventListener('timeupdate', updateTimeUI);
videoPlayer.addEventListener('loadedmetadata', () => {
  updateTimeUI();
  fitVideoToAvailableSpace();
});
videoPlayer.addEventListener('ended', () => {
  playToggle.textContent = '▶';
});

progressBar.addEventListener('input', () => {
  const duration = videoPlayer.duration || 0;
  const target = Number(progressBar.value) / 1000;
  progressWrap.style.setProperty('--progress-percent', `${target * 100}%`);
  videoPlayer.currentTime = duration * target;
});

playToggle.addEventListener('click', togglePlay);
volumeBar.addEventListener('input', updateVolume);
volumeToggle.addEventListener('click', toggleMute);
fullscreenToggle.addEventListener('click', toggleFullscreen);
videoStage.addEventListener('click', handleVideoAreaClick);
document.addEventListener('keydown', handlePlayerKeydown);
window.addEventListener('resize', fitVideoToAvailableSpace);
document.addEventListener('fullscreenchange', handleFullscreenChange);
window.addEventListener('blur', hideFullscreenControls);
document.addEventListener('mouseout', (event) => {
  if (!event.relatedTarget) hideFullscreenControls();
});

['mousemove', 'pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
  document.addEventListener(eventName, revealFullscreenControls, { passive: true });
});

if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(fitVideoToAvailableSpace);
  layoutObserver.observe(videoStage);
  layoutObserver.observe(videoViewport);
  layoutObserver.observe(videoControls);
  layoutObserver.observe(videoInfo);
}

const initialSlug = getUrlSlug();
setVideoFromSlug(initialSlug);

window.addEventListener('popstate', () => {
  const slug = getUrlSlug();
  setVideoFromSlug(slug);
});
