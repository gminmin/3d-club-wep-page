const container = document.getElementById('viewer');

/* =====================
   기본 씬 / 카메라 / 렌더러
===================== */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

/* =====================
   파노라마 로드
===================== */
const panoramaFile = (typeof exhibitionSettings !== 'undefined')
    ? `assets/${exhibitionSettings.panorama}`
    : 'assets/exhibition_360.jpg';

new THREE.TextureLoader().load(panoramaFile, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
});

/* =====================
   시점 컨트롤 (모바일 대응)
===================== */
let isDown = false;
let isPinching = false;
let lon = 0;
let lat = 0;
let prevX = 0;
let prevY = 0;

// 클릭 여부 판별용 (드래그와 클릭 구분)
let startX = 0;
let startY = 0;

window.addEventListener('pointerdown', (e) => {
    if (isPinching) return;
    isDown = true;
    prevX = e.clientX;
    prevY = e.clientY;

    // 시작 위치 저장
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!isDown || isPinching) return;

    // 현재 FOV에 비례하여 감도 조절 (확대될수록 감도 낮춤)
    const sensitivity = 0.1 * (camera.fov / 75);

    lon += (prevX - e.clientX) * sensitivity;
    lat += (e.clientY - prevY) * sensitivity;
    lat = Math.max(-85, Math.min(85, lat));

    prevX = e.clientX;
    prevY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
    if (isDown) {
        // 이동 거리 계산 (5픽셀 이하로 움직였을 때만 클릭으로 인정)
        const moveDist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (moveDist < 5) {
            handleHotspotClick(e);
        }
    }
    isDown = false;
});

window.addEventListener('pointerleave', () => {
    isDown = false;
});

window.addEventListener('pointercancel', () => {
    isDown = false;
});

/* =====================
   줌 (휠 / 핀치)
===================== */
let targetFov = camera.fov;
const DEFAULT_FOV = 75;
const MIN_FOV = 30;
const MAX_FOV = 90;

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetFov += e.deltaY * 0.05;
    targetFov = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov));
}, { passive: false });

let touchDist = null;
let pinchStartFov = camera.fov;

window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        isPinching = true;
        isDown = false;
        touchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartFov = targetFov;
    }
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && isPinching) {
        const newDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        const delta = (touchDist - newDist) * 0.08;
        targetFov = pinchStartFov + delta;
        targetFov = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov));
    }
});

window.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        isPinching = false;
        touchDist = null;
    }
});

/* =====================
   애니메이션 루프
===================== */
function animate() {
    requestAnimationFrame(animate);

    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);

    camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
    );

    renderer.render(scene, camera);
}

animate();

/* =====================
   작품 핫스팟 상호작용
===================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hotspots = [];

function createHotspot(art) {
    let mesh;
    const scale = art.size || 1;
    const width = (art.width || 1) * scale;
    const height = (art.height || 1) * scale;

    // 타입에 따라 이미지 소스 결정: artwork면 실제 작품 이미지, 아니면 아이콘
    const texturePath = (art.type === 'artwork')
        ? art.image
        : (art.hotspotImage || 'assets/ui/hotspot-image.png');

    const hotspotImg = texturePath;

    if (art.type === 'circle') {
        const geo = new THREE.CircleGeometry(width * 0.6, 32);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        mesh = new THREE.Mesh(geo, mat);
    } else if (art.type === 'image' || art.type === 'artwork') {
        const texture = new THREE.TextureLoader().load(hotspotImg);
        const geo = new THREE.PlaneGeometry(width, height);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        mesh = new THREE.Mesh(geo, mat);
    } else {
        const geo = new THREE.PlaneGeometry(width, height * 0.6);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        mesh = new THREE.Mesh(geo, mat);
    }

    mesh.position.copy(art.position);
    mesh.lookAt(0, 0, 0);
    mesh.userData = art;
    scene.add(mesh);
    hotspots.push(mesh);
}

// 전역 변수 artworks가 존재하면 핫스팟 생성
if (typeof artworks !== 'undefined') {
    artworks.forEach(createHotspot);
}

function handleHotspotClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(hotspots);
    if (intersects.length > 0) {
        openArtwork(intersects[0].object.userData);
    }
}

/* =====================
   작품 열기 / 닫기
===================== */
function openArtwork(data) {
    document.getElementById('art-title').innerText = data.title;
    document.getElementById('art-author').innerText = data.author || "";
    document.getElementById('art-desc').innerText = data.description;

    // 이미지 경로 설정 (데이터에 명시된 image 사용)
    document.getElementById('art-image').src = data.image;
    document.getElementById('art-modal').classList.add('show');

    // 시점 이동 로직 (animate 함수의 매핑 방식과 일치시킴)
    const pos = data.position;
    const dist = pos.length();

    // animate 함수 구성: x=sin(phi)cos(theta), y=cos(phi), z=sin(phi)sin(theta)
    // 따라서 phi = acos(y/dist), theta = atan2(z, x)
    const phi = Math.acos(pos.y / dist);
    const theta = Math.atan2(pos.z, pos.x);

    lon = THREE.MathUtils.radToDeg(theta);
    lat = 90 - THREE.MathUtils.radToDeg(phi);

    targetFov = 45;
}

function closeArtwork() {
    document.getElementById('art-modal').classList.remove('show');
    targetFov = DEFAULT_FOV;
}

const modal = document.getElementById('art-modal');
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeArtwork();
});

/* =====================
   리사이즈
===================== */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});