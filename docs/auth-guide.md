# 로그인 · 프로필 메뉴 기능 설명

작성: 박성훈
대상: 팀원 전원 (이 영역을 수정하거나 연동할 때 먼저 읽어주세요)

---

## 목차

1. [큰 그림 — 딱 하나만 기억하면 됩니다](#1-큰-그림--딱-하나만-기억하면-됩니다)
2. [파일 구성](#2-파일-구성)
3. [핵심 로직 4개](#3-핵심-로직-4개)
4. [상황별 동작](#4-상황별-동작)
5. [다른 기능에서 연동하는 법](#5-다른-기능에서-연동하는-법)
6. [알려진 한계](#6-알려진-한계)

---

## 1. 큰 그림 — 딱 하나만 기억하면 됩니다

> **로그인 여부의 진실은 `loginUser` 쿠키 하나뿐이고, 화면은 그걸 비추는 거울입니다.**

```
              ┌─────────────────────────┐
              │   쿠키  loginUser       │   ← 진실 (Source of Truth)
              │   값: 로그인한 아이디    │
              └───────────┬─────────────┘
                          │
                          │  updateHeader()가 읽어서
                          │  화면을 다시 그린다
                          ▼
        ┌─────────────────────────────────────┐
        │  로그인 버튼        프로필 메뉴      │   ← 거울 (아무것도 기억 안 함)
        └─────────────────────────────────────┘
```

화면은 **자기 상태를 따로 기억하지 않습니다.** 쿠키를 보고 매번 다시 그릴 뿐입니다.

그래서 기능이 딱 두 줄로 요약됩니다.

| 동작 | 하는 일 |
|---|---|
| 로그인 | 쿠키 심기 → 다시 그리기 |
| 로그아웃 | 쿠키 지우기 → 다시 그리기 |

새로고침해도 로그인이 유지되는 이유도 같습니다. 페이지가 뜨면 쿠키를 보고 다시 그리니까요.

### 왜 이렇게 했나

처음엔 로그아웃 경로가 두 개였습니다. 헤더의 로그아웃 버튼과 드롭다운의 로그아웃이 **각자 자기 방식으로 화면을 고쳤습니다.**

그 결과 드롭다운으로 로그아웃하면 프로필은 사라지는데 로그아웃 버튼은 그대로 남고, 버튼을 한 번 더 눌러야 로그인 버튼이 나타나는 버그가 생겼습니다.

**화면 갱신 경로를 `updateHeader()` 하나로 모아서 해결했습니다.** 진입점이 뭐든 도착지는 같습니다.

---

## 2. 파일 구성

```
js/
├── auth.js          회원 데이터 + 쿠키 입출력   (화면을 다루지 않음)
├── login.js         로그인 / 로그아웃 / 헤더 갱신
├── profileMenu.js   프로필 드롭다운
├── login_modal.js   로그인 모달 로더
├── signup.js        회원가입 폼
└── findAccount.js   아이디 찾기 / 비밀번호 재설정

css/
└── user_menu.css    프로필 드롭다운 스타일

index.html           헤더 마크업 31~56행, 스크립트 239~250행
```

### 로드 순서가 중요합니다

`index.html` 239~243행

```html
<script src="./js/auth.js"></script>        <!-- 1순위: 나머지가 여기 함수를 씀 -->
<script src="./js/login.js"></script>       <!-- 2순위: auth.js 함수 필요 -->
<script src="./js/profileMenu.js"></script> <!-- 3순위: 위 둘 다 필요 -->
```

**`auth.js`가 반드시 먼저입니다.** 순서가 바뀌면 `getCookie is not defined`로 터집니다.

### 의존 관계

```
      auth.js  ←────────┬──────────── login.js
    (데이터 계층)        │            (로그인/로그아웃)
                        │                  ▲
                        └──────────────────┤
                                           │
                                    profileMenu.js
                                     (드롭다운 UI)
```

`auth.js`는 아무에게도 의존하지 않습니다. 화면 코드가 하나도 없어서, 나중에 서버 API로 바꿔도 이 파일만 고치면 됩니다.

---

## 3. 핵심 로직 4개

### ① `getCurrentUser()` — 지금 누가 로그인했나

**`js/auth.js` 101행**

```js
function getCurrentUser() {
    const id = getCookie('loginUser');
    if (!id) return null;

    // 쿠키에는 아이디만 저장하고 이름·이미지는 users에서 조회
    return findUserById(id) || null;
}
```

로그인 여부를 알아야 하는 모든 코드는 **이 함수 하나만 부르면 됩니다.** 쿠키를 직접 읽지 마세요.

**쿠키에 아이디만 넣은 이유** — 이름까지 쿠키에 넣으면, 개인정보 변경에서 이름을 바꿨을 때 쿠키는 옛 이름을 들고 있게 됩니다. 진실이 두 군데로 갈라지면 반드시 어긋납니다.

---

### ② `updateHeader()` — 화면 갱신의 유일한 창구

**`js/login.js` 74행**

```js
function updateHeader() {
    const loginBtn = document.querySelector('#login_Btn');
    if (!loginBtn) return;              // 헤더 없는 페이지는 조용히 종료

    const user = getCookie('loginUser');

    // 로그인 상태면 로그인 버튼을 감추고, 비로그인 상태면 다시 보여줌
    loginBtn.classList.toggle('hidden', Boolean(user));

    // 프로필 메뉴 갱신은 profileMenu.js에 위임
    window.renderUserMenu?.();
}
```

**이 함수가 이 기능의 심장입니다.** 로그인·로그아웃·페이지 로드 세 경우가 전부 여기로 모입니다.

`window.renderUserMenu?.()`의 `?.`는 "없으면 그냥 넘어가라"는 뜻입니다. 헤더가 없는 페이지에는 `profileMenu.js`를 안 넣기 때문에 이 방어가 필요합니다.

---

### ③ `renderUserMenu()` — 프로필 영역 다시 그리기

**`js/profileMenu.js` 88행**

```js
function renderUserMenu() {
    const user = getCurrentUser();

    // 비로그인: 열려 있던 메뉴까지 정리한 뒤 영역 전체를 감춤
    if (!user) {
        closeMenu();
        menu.hidden = true;
        return;
    }

    avatar.src = user.img || './img/profile-default.png';
    nameLabel.textContent = user.name;   // textContent — 태그가 실행되지 않게
    menu.hidden = false;
}
```

**이름을 넣을 때 `innerHTML`이 아니라 `textContent`를 씁니다.** 사용자가 입력한 값이라 `innerHTML`이면 태그가 그대로 실행됩니다. 다른 곳에서 사용자 입력을 화면에 넣을 때도 같은 원칙으로 부탁드립니다.

`renderUserMenu`는 `IIFE` 안에 있어서 밖에서 안 보입니다. 그래서 마지막에 한 줄로 내보냅니다.

**`js/profileMenu.js` 101행**

```js
window.renderUserMenu = renderUserMenu;   // 이 함수만 공개
```

파일 안의 `menu`, `trigger`, `panel`, `openMenu`, `closeMenu` 등은 **전부 밖에서 안 보입니다.** 이름이 흔해서 다른 파일과 충돌할 수 있기 때문에 일부러 감췄습니다.

---

### ④ 바깥 클릭으로 드롭다운 닫기

**`js/profileMenu.js` 49행**

```js
document.addEventListener('click', (event) => {
    // 페이지의 모든 클릭마다 실행되므로 가장 가벼운 검사를 먼저
    if (!isOpen()) return;

    // closest는 클릭한 요소부터 조상 방향으로 올라가며 찾음
    // 메뉴 안이면 요소를, 바깥이면 null을 반환
    if (event.target.closest('#userMenu')) return;

    closeMenu();
});
```

**`stopPropagation()`을 일부러 쓰지 않았습니다.** 그걸 쓰면 해당 영역에서 클릭 이벤트가 위로 안 올라가서, 나중에 누가 `document`에 붙이는 기능이 프로필 버튼 위에서만 조용히 동작하지 않습니다. 원인 찾기가 매우 어려운 종류의 버그입니다.

대신 이벤트는 그대로 흘려보내고 **클릭 위치만 확인**합니다.

---

## 4. 상황별 동작

### 4-1. 로그인할 때

```
① 헤더 로그인 버튼 클릭
   index.html 31행  [data-login-open]
        ↓
② 모달 열림
   login_modal.js 54행  openModal()
        ↓
③ 폼 제출
   login_modal.js 69행  submit → handleLogin()
        ↓
④ 아이디·비밀번호 대조
   login.js 27행  validateLogin()
        ↓ 통과
⑤ 쿠키 심기                    ← 진실이 바뀌는 순간
   login.js 60행  setCookie('loginUser', id, 1)
        ↓
⑥ 화면 다시 그리기
   login.js 63행  updateHeader()
        ├── 로그인 버튼에 hidden 추가   → 버튼 사라짐
        └── renderUserMenu()
              └── getCurrentUser() → 회원 객체
                  이름·사진 채우고 menu.hidden = false → 프로필 나타남
```

**실패했을 때**는 ④에서 멈추고 모달 안에 메시지만 뜹니다. 쿠키는 건드리지 않습니다.

아이디가 없는 경우와 비밀번호가 틀린 경우를 **같은 메시지로 처리**합니다. 구분해서 알려주면 "이 아이디는 존재한다"는 정보가 새어 나가기 때문입니다.

---

### 4-2. 로그아웃할 때

```
① 프로필 클릭 → 드롭다운 열림
   profileMenu.js 42행
        ↓
② 드롭다운 안 로그아웃 클릭
   index.html 53행  #userMenuLogout
        ↓
③ profileMenu.js 74행  handleLogout()      ← 직접 처리하지 않고 위임
        ↓
④ 쿠키 지우기                   ← 진실이 바뀌는 순간
   login.js 66행  deleteCookie('loginUser')
        ↓
⑤ 화면 다시 그리기
   login.js 67행  updateHeader()
        ├── 로그인 버튼 hidden 제거      → 버튼 나타남
        └── renderUserMenu()
              └── getCurrentUser() → null
                  closeMenu() + menu.hidden = true → 프로필 사라짐
```

**`profileMenu.js`가 쿠키를 직접 지우지 않는 게 핵심입니다.** `handleLogout()`에 넘깁니다. 로그아웃 절차가 두 벌이 되면 앞서 말한 그 버그가 다시 납니다.

---

### 4-3. 페이지를 새로고침할 때

```
login.js 90행  DOMContentLoaded → updateHeader()
```

끝입니다. 로그인·로그아웃과 **완전히 같은 함수**를 씁니다. 쿠키를 보고 그릴 뿐이라 상태 복원 코드가 따로 필요 없습니다.

---

### 4-4. 드롭다운 열고 닫기

| 동작 | 결과 | 위치 |
|---|---|---|
| 프로필 클릭 | 열림 / 닫힘 토글 | `profileMenu.js` 42행 |
| 메뉴 바깥 클릭 | 닫힘 | `profileMenu.js` 49행 |
| ESC 키 | 닫힘 + 포커스 복귀 | `profileMenu.js` 61행 |
| 메뉴 안 클릭 | 유지 | `profileMenu.js` 55행 |

ESC로 닫을 때 `trigger.focus()`로 포커스를 프로필 버튼에 되돌립니다. 안 그러면 키보드 사용자의 포커스가 사라진 요소에 남아서, 다음 Tab에 페이지 맨 위로 튕깁니다.

---

## 5. 다른 기능에서 연동하는 법

### 로그인한 사용자가 필요할 때

```js
const user = getCurrentUser();     // auth.js
if (!user) {
    alert('로그인이 필요합니다.');
    return;
}
console.log(user.id, user.name, user.email);
```

**`getCookie('loginUser')`를 직접 쓰지 마세요.** 저장 방식이 바뀌면 그 자리를 전부 찾아 고쳐야 합니다.

리뷰·댓글 작성자 표시에 쓰면 될 것 같습니다. 지금 `board.js`는 작성자를 `'익명'`으로 넣고 있는데(`board.js` `addComment`), 여기에 `getCurrentUser()?.name`을 넣으면 바로 연결됩니다.

### 드롭다운에 메뉴를 추가할 때

**`index.html` 46~49행에 `<li>` 한 줄만 추가하면 됩니다. JS는 손대지 않습니다.**

```html
<ul class="user-menu__list">
    <li><a class="user-menu__item" role="menuitem" href="./html/my_info.html">개인정보 변경</a></li>
    <li><a class="user-menu__item" role="menuitem" href="./html/my_reviews.html">내가 쓴 리뷰</a></li>
    <li><a class="user-menu__item" role="menuitem" href="./html/favorites.html">즐겨찾기</a></li>  <!-- 추가 예시 -->
</ul>
```

`class="user-menu__item"`만 지켜주시면 스타일은 자동으로 맞습니다. `<button>`도 같은 클래스로 동작합니다.

### 다른 페이지 헤더에 붙일 때

현재 `index.html`에만 적용되어 있습니다. 다른 페이지에 옮기려면:

1. `index.html` 31~56행의 `user-menu` 블록 복사
2. `<link rel="stylesheet" href="../../css/user_menu.css">` 추가
3. `auth.js` → `login.js` → `profileMenu.js` 순서로 스크립트 추가
4. **경로 깊이 조정** — `./img/`, `./html/`을 페이지 위치에 맞게 수정

4번을 빠뜨리면 이미지와 링크가 조용히 깨집니다. 아래 한계 항목과 이어집니다.

---

## 6. 알려진 한계

의도적으로 남겨둔 것들입니다. 팀플 범위에서는 문제되지 않지만, 알고 계셔야 합니다.

| 항목 | 내용 | 대응 |
|---|---|---|
| 비밀번호 평문 저장 | 서버가 없어 쿠키에 그대로 저장 | 백엔드 붙일 때 해시 처리 |
| 회원 목록 4KB 한계 | 쿠키 상한 때문에 회원 30명쯤에서 저장이 조용히 실패 | 이 프로젝트에선 도달 안 함. 옮긴다면 `saveUsers` / `loadUsers` / `getCurrentUser` 3개만 수정 |
| 비밀번호에 `;` 금지 필요 | 쿠키 구분자와 겹쳐 회원 목록 전체가 깨짐 | `PW_PATTERN` 조정 또는 `getCookie` 수정 예정 |
| 헤더 마크업 중복 | 페이지마다 복붙 상태 | 헤더를 `login_modal.js`처럼 컴포넌트로 분리하면 해결 |
| 이미지 경로 하드코딩 | `profileMenu.js` 96행이 `index.html` 기준 경로 | 위 4번과 함께 정리 |

---

## 질문받습니다

이 영역을 수정하실 일이 있으면 미리 알려주세요. `updateHeader()`를 거치지 않고 헤더를 직접 고치는 코드가 생기면 예전 버그가 그대로 재현됩니다.
