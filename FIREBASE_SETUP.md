# Firebase setup guide

## 가장 먼저 확인할 것

GitHub Pages에서만 Firebase 기능이 안 되면, 가장 흔한 원인은 아래 둘 중 하나입니다.

1. `Firebase Authentication`의 `Authorized domains`에 배포 도메인이 없음
2. `Firestore / Storage Rules`가 현재 요청을 막고 있음

## 1. Authentication 허용 도메인 추가

1. Firebase Console 접속
2. 프로젝트 `jb3d-a98fd` 선택
3. `Authentication` > `Settings` 이동
4. `Authorized domains`에 실제 배포 주소 추가

추가해야 할 예시:

- `YOUR_ID.github.io`
- `YOUR_ID.github.io/REPOSITORY_NAME` 가 아니라 도메인만 추가
- 커스텀 도메인을 쓴다면 `jb3d.xyz` 도 추가

중요:

- `github.io` 전체를 넣는 것이 아니라 실제 본인 Pages 도메인을 넣어야 합니다.
- 커스텀 도메인과 GitHub Pages 기본 도메인을 둘 다 쓰면 둘 다 추가하는 편이 안전합니다.

## 2. Firestore Rules 확인

관리자만 읽기/쓰기를 하려면 예시:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

주의:

- 현재 `contact.html`은 비로그인 상태에서 `contacts` 컬렉션에 쓰기 요청을 보냅니다.
- 그래서 위 규칙을 그대로 쓰면 문의 등록은 차단됩니다.

문의 폼까지 허용하려면 컬렉션별로 분리해서 규칙을 짜야 합니다. 예시:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 3. Storage Rules 확인

관리자 로그인 후 업로드만 허용하려면:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. Email/Password 로그인 활성화

1. `Authentication` > `Sign-in method`
2. `Email/Password` 활성화
3. 관리자 계정 생성

## 5. 브라우저에서 바로 확인하는 방법

배포된 GitHub Pages 사이트에서 `F12`를 열고 `Console`을 확인하세요.

이제 코드가 아래 정보를 같이 출력합니다.

- 현재 접속한 `Origin`
- Firebase 프로젝트 ID
- Firebase Auth domain
- Firebase 에러 코드
- GitHub Pages에서 자주 생기는 설정 힌트

특히 이런 에러를 찾으면 원인이 거의 확정됩니다.

- `auth/unauthorized-domain`
- `permission-denied`
- `storage/unauthorized`

## 6. 이번 코드 기준으로 특히 중요한 점

- 관리자 로그인 실패가 GitHub Pages에서만 발생하면 거의 `Authorized domains` 문제일 가능성이 큽니다.
- 문의 등록이 실패하면 `contacts` 컬렉션에 대한 Firestore 규칙 문제일 가능성이 큽니다.
- 작품/갤러리 업로드가 실패하면 Storage 규칙 또는 로그인 상태 문제일 가능성이 큽니다.
