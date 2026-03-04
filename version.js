/**
 * 사이트 버전 관리
 * 
 * 새 버전 배포 시 SITE_VERSION을 업데이트하여 브라우저 캐시를 무효화합니다.
 * 
 * 버전 번호 규칙:
 * - 메이저 변경: 1.0.0 → 2.0.0
 * - 마이너 변경: 1.0.0 → 1.1.0
 * - 패치/버그 수정: 1.0.0 → 1.0.1
 */

// 현재 사이트 버전
const SITE_VERSION = '1.2.0';

// 개발 모드: true로 설정하면 타임스탬프를 사용하여 매번 새로운 버전으로 로드
const USE_TIMESTAMP = false;

// 버전 문자열 생성
function getVersion() {
    if (USE_TIMESTAMP) {
        return Date.now().toString();
    }
    return SITE_VERSION;
}

// 전역 변수로 내보내기
window.CACHE_VERSION = getVersion();

// 콘솔에 버전 정보 출력 (디버깅용)
console.log(`%c🎨 진부중학교 3D 동아리 웹사이트`, 'font-size: 16px; font-weight: bold; color: #00ffff;');
console.log(`%c버전: ${window.CACHE_VERSION}`, 'font-size: 12px; color: #888;');
