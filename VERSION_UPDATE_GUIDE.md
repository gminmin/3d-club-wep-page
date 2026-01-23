# 버전 업데이트 가이드

새 버전을 배포할 때 브라우저 캐시 문제를 해결하기 위한 단계별 가이드입니다.

## 📋 배포 전 체크리스트

- [ ] 모든 변경사항이 완료되었는지 확인
- [ ] 로컬에서 테스트 완료
- [ ] 버전 번호 결정 (메이저/마이너/패치)

## 🔢 버전 번호 규칙

- **메이저 변경** (1.0.0 → 2.0.0): 대규모 리뉴얼, 호환성이 깨지는 변경
- **마이너 변경** (1.0.0 → 1.1.0): 새로운 기능 추가, 중요한 개선사항
- **패치 변경** (1.0.0 → 1.0.1): 버그 수정, 작은 개선사항

## 🚀 배포 단계

### 1단계: 버전 번호 업데이트

`version.js` 파일을 열고 `SITE_VERSION` 값을 업데이트합니다:

```javascript
// 예시: 1.0.0 → 1.0.1로 변경
const SITE_VERSION = '1.0.1';
```

### 2단계: Git 커밋 및 푸시

```bash
git add .
git commit -m "Bump version to 1.0.1"
git push
```

### 3단계: 배포 확인

배포 후 브라우저에서 다음을 확인합니다:

1. **개발자 도구 열기** (F12 또는 Ctrl+Shift+I)
2. **Network 탭** 선택
3. **강력 새로고침** (Ctrl+Shift+R 또는 Ctrl+F5)
4. CSS/JS 파일들이 `?v=1.0.1`로 로드되는지 확인

### 4단계: 캐시 동작 확인

- 같은 버전에서 다시 새로고침하면 **304 Not Modified** (캐시 사용)
- 버전 변경 후에는 **200 OK** (새로 다운로드)

## 🛠️ 개발 모드 (선택사항)

개발 중에 매번 버전을 변경하기 번거로운 경우, `version.js`에서 타임스탬프 모드를 활성화할 수 있습니다:

```javascript
const USE_TIMESTAMP = true; // false → true로 변경
```

⚠️ **주의**: 프로덕션 배포 전에는 반드시 `false`로 되돌려야 합니다!

## 🔍 문제 해결

### 여전히 이전 버전이 보이는 경우

1. **브라우저 캐시 완전 삭제**
   - Chrome: 설정 → 개인정보 보호 및 보안 → 인터넷 사용 기록 삭제
   - 시간 범위: 전체 기간
   - 캐시된 이미지 및 파일 선택

2. **시크릿 모드에서 테스트**
   - Ctrl+Shift+N (Chrome) 또는 Ctrl+Shift+P (Firefox)

3. **콘솔에서 버전 확인**
   - F12 → Console 탭
   - 페이지 로드 시 "버전: X.X.X" 메시지 확인

### HTML 파일도 캐시되는 경우

서버 설정에서 HTML 파일의 캐시 정책을 조정해야 합니다:

**.htaccess** (Apache):
```apache
<FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, must-revalidate"
</FilesMatch>
```

**nginx.conf** (Nginx):
```nginx
location ~* \.html$ {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

## 📝 변경 이력 예시

배포할 때마다 기록을 남기는 것을 권장합니다:

```
# CHANGELOG.md

## [1.0.1] - 2026-01-23
### Fixed
- 모바일 스크롤 버그 수정
- 폼 제출 오류 해결

## [1.0.0] - 2026-01-20
### Added
- 초기 버전 배포
- 캐시 무효화 시스템 구현
```

## ✅ 체크리스트

배포 후 다음 항목들을 확인하세요:

- [ ] 모든 페이지가 정상적으로 로드됨
- [ ] CSS 스타일이 올바르게 적용됨
- [ ] JavaScript 기능이 정상 작동함
- [ ] 콘솔에 에러가 없음
- [ ] 모바일에서도 정상 작동함
- [ ] 버전 번호가 콘솔에 올바르게 표시됨

## 🎯 빠른 참조

| 작업 | 명령어 |
|------|--------|
| 버전 업데이트 | `version.js`에서 `SITE_VERSION` 수정 |
| 강력 새로고침 | Ctrl+Shift+R 또는 Ctrl+F5 |
| 개발자 도구 | F12 또는 Ctrl+Shift+I |
| 시크릿 모드 | Ctrl+Shift+N (Chrome) |
| 캐시 확인 | Network 탭에서 Status 코드 확인 |

---

**도움이 필요하신가요?** 문제가 발생하면 개발자 도구의 Console과 Network 탭을 확인하고, 에러 메시지를 기록해두세요.
