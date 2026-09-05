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

// 모달 관련 DOM 요소
const openRecommendBtn = document.getElementById('open-recommend-btn');
const recommendModal = document.getElementById('recommend-modal');
const recommendModalBackdrop = document.getElementById('recommend-modal-backdrop');
const closeRecommendModalBtn = document.getElementById('close-recommend-modal-btn');
const modalDismissBtn = document.getElementById('modal-dismiss-btn');
const modalReplayBtn = document.getElementById('modal-replay-btn');
const recommendVideoList = document.getElementById('recommend-video-list');

let controlsHideTimer;
const volumeCookieName = 'portfolio-player-volume';

const cloudName = 'dfrh0djn3';
const baseVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

// 기존 하드코딩 영상 중 유지할 유일한 홍보 영상
const defaultPromoVideo = {
  id: 'homepage-hongbo',
  slug: 'homepage-hongbo',
  title: '3D 캐릭터 컨셉 영상',
  description: '메타버스와 3D 콘텐츠 제작 과정을 담은 포트폴리오 영상입니다. 모델링, 환경 구성, 그리고 협업 과정을 한눈에 보여줍니다.',
  src: `${baseVideoUrl}/v1777538955/%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%EC%9A%A9_1%EC%B0%A8_wgtt9q.mp4`,
  poster: 'https://firebasestorage.googleapis.com/v0/b/jb3d-a98fd.firebasestorage.app/o/video%2Fplayer_cover(1).png?alt=media&token=38987871-ca18-48c2-9c92-ff0fca786cdb'
};

// Firestore DB에서 불러온 영상 목록 상태
let dbVideos = [];
let currentVideo = defaultPromoVideo;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

function switchVideo(video, autoPlay = false) {
  if (!video || !video.src) return;
  currentVideo = video;

  titleNode.textContent = video.title || '영상 재생';
  descriptionNode.textContent = video.description || '';
  videoPlayer.poster = video.poster || '';
  videoPlayer.setAttribute('poster', video.poster || '');
  videoPlayer.src = video.src;
  videoPlayer.load();

  if (autoPlay) {
    videoPlayer.play().catch(() => {
      playToggle.textContent = '▶';
    });
  } else {
    videoPlayer.pause();
    playToggle.textContent = '▶';
  }

  updateUrl(video.slug || video.id);
  closeRecommendModal();
}

function getSavedVolume() {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${volumeCookieName}=`));
  const savedVolume = cookie ? Number(decodeURIComponent(cookie.split('=')[1])) : NaN;

  return Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100
    ? savedVolume
    : 100;
}

function saveVolume(volume) {
  document.cookie = `${volumeCookieName}=${encodeURIComponent(volume)}; max-age=31536000; path=/; SameSite=Lax`;
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
  saveVolume(Number(volumeBar.value));
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
  if (event.code === 'Escape') {
    if (recommendModal && recommendModal.classList.contains('is-active')) {
      event.preventDefault();
      closeRecommendModal();
      return;
    }
  }

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
  if (event.target.closest('.video-controls, .video-info, .recommend-bottom-overlay, input, button')) return;
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
    if (!recommendModal || !recommendModal.classList.contains('is-active')) {
      pageRoot.classList.add('controls-hidden');
    }
  }, 2500);
}

function hideFullscreenControls() {
  if (!document.fullscreenElement) return;
  if (recommendModal && recommendModal.classList.contains('is-active')) return;

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

// --- 추천 팝업(하단 트레이) 로직 ---

function renderRecommendList() {
  if (!recommendVideoList) return;
  recommendVideoList.innerHTML = '';

  // DB에 영상이 없을 경우: "추천 영상을 불러올 수 없습니다." 안내
  if (!Array.isArray(dbVideos) || dbVideos.length === 0) {
    recommendVideoList.innerHTML = `
      <div class="tray-empty-state">
        <p>추천 영상을 불러올 수 없습니다.</p>
      </div>
    `;
    return;
  }

  // DB에 영상 목록이 있는 경우 렌더링
  dbVideos.forEach((video) => {
    const isCurrent = (currentVideo.id && currentVideo.id === video.id) ||
                      (currentVideo.slug && currentVideo.slug === video.slug);

    const card = document.createElement('div');
    card.className = `tray-card${isCurrent ? ' is-current' : ''}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${video.title} 영상 재생`);

    card.innerHTML = `
      <div class="tray-thumb-box">
        <img src="${escapeHtml(video.poster || defaultPromoVideo.poster)}" alt="${escapeHtml(video.title)}" onerror="this.src='${defaultPromoVideo.poster}'" />
        ${video.duration ? `<span class="tray-duration">${escapeHtml(video.duration)}</span>` : ''}
        ${isCurrent ? `<span class="tray-current-badge">재생 중</span>` : ''}
      </div>
      <div class="tray-card-title">${escapeHtml(video.title)}</div>
    `;

    const selectThisVideo = () => {
      if (isCurrent) {
        closeRecommendModal();
      } else {
        switchVideo(video, false);
      }
    };

    card.addEventListener('click', selectThisVideo);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectThisVideo();
      }
    });

    recommendVideoList.appendChild(card);
  });
}

function openRecommendModal() {
  if (!recommendModal) return;
  renderRecommendList();
  recommendModal.classList.add('is-active');
  recommendModal.setAttribute('aria-hidden', 'false');
  pageRoot.classList.remove('controls-hidden');
}

function closeRecommendModal() {
  if (!recommendModal) return;
  recommendModal.classList.remove('is-active');
  recommendModal.setAttribute('aria-hidden', 'true');
}

function toggleRecommendModal() {
  if (!recommendModal) return;
  if (recommendModal.classList.contains('is-active')) {
    closeRecommendModal();
  } else {
    openRecommendModal();
  }
}

// --- dataService 초기화 및 DB 영상 로드 ---

function waitForDataService(timeoutMs = 2500) {
  return new Promise((resolve) => {
    if (window.dataService) {
      return resolve(window.dataService);
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.dataService) {
        clearInterval(interval);
        resolve(window.dataService);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 50);
  });
}

async function initVideos() {
  const currentSlug = getUrlSlug();

  const ds = await waitForDataService();
  if (ds && typeof ds.getVideos === 'function') {
    try {
      const list = await ds.getVideos();
      if (Array.isArray(list) && list.length > 0) {
        dbVideos = list.map((item) => ({
          id: item.id || item.slug,
          slug: item.slug || item.id,
          title: item.title || '무제',
          description: item.description || '',
          src: item.videoUrl || item.src || '',
          poster: item.thumbnailUrl || item.poster || defaultPromoVideo.poster,
          duration: item.duration || ''
        }));
      } else {
        dbVideos = [];
      }
    } catch (err) {
      console.warn('DB 영상 로드 실패:', err);
      dbVideos = [];
    }
  } else {
    dbVideos = [];
  }

  // URL 파라미터 확인 및 초기 영상 매칭
  let targetVideo = null;
  if (currentSlug && currentSlug !== 'homepage-hongbo' && dbVideos.length > 0) {
    targetVideo = dbVideos.find((v) => v.slug === currentSlug || v.id === currentSlug);
  }

  if (!targetVideo) {
    targetVideo = defaultPromoVideo;
  }

  switchVideo(targetVideo, false);
}

// --- 이벤트 리스너 등록 ---

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

// 영상 종료 시 팝업 열기
videoPlayer.addEventListener('ended', () => {
  playToggle.textContent = '▶';
  openRecommendModal();
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

// 모달 인터랙션 이벤트
if (openRecommendBtn) {
  openRecommendBtn.addEventListener('click', toggleRecommendModal);
}
if (closeRecommendModalBtn) {
  closeRecommendModalBtn.addEventListener('click', closeRecommendModal);
}
if (modalDismissBtn) {
  modalDismissBtn.addEventListener('click', closeRecommendModal);
}
if (recommendModalBackdrop) {
  recommendModalBackdrop.addEventListener('click', closeRecommendModal);
}
if (modalReplayBtn) {
  modalReplayBtn.addEventListener('click', () => {
    closeRecommendModal();
    videoPlayer.currentTime = 0;
    videoPlayer.play();
  });
}

// 브라우저 뒤로가기/앞으로가기
window.addEventListener('popstate', () => {
  const slug = getUrlSlug();
  if (slug === 'homepage-hongbo' || !dbVideos.length) {
    switchVideo(defaultPromoVideo, false);
  } else {
    const found = dbVideos.find((v) => v.slug === slug || v.id === slug);
    switchVideo(found || defaultPromoVideo, false);
  }
});

// 초기 볼륨 설정 및 영상 초기화
volumeBar.value = String(getSavedVolume());
updateVolume();
initVideos();
