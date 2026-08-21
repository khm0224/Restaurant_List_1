/**
 * profileMenu.js — 헤더 사용자 프로필 드롭다운
 *
 * 메뉴 항목은 HTML의 li로 관리 — 항목을 늘려도 이 파일은 수정하지 않음.
 *
 * 의존: auth.js (getCurrentUser / isAdmin), login.js (handleLogout)
 * 공개: window.initUserMenu — header.js가 헤더 삽입을 끝낸 뒤 호출
 * 구독: auth:changed — 이후 갱신은 스스로 처리
 *
 * 함수로 감싼 이유: 헤더가 fetch로 늦게 오므로 즉시 실행이면 요소를 못 찾고 끝남.
 */
window.initUserMenu = function () {
    const menu = document.getElementById('userMenu');
    // 헤더가 없는 페이지에서도 읽힐 수 있으므로 조용히 종료
    if (!menu) return;

    const trigger = document.getElementById('userMenuTrigger');
    const panel = document.getElementById('userMenuPanel');
    const avatar = document.getElementById('userMenuAvatar');
    const nameLabel = document.getElementById('userMenuName');
    const logoutBtn = document.getElementById('userMenuLogout');
    const adminItem = document.getElementById('userMenuAdminItem');
    // header.js가 완전한 주소로 바꿔놓은 값을 재사용.
    // './img/...'를 직접 쓰면 html/main/ 페이지에서 404.
    const defaultAvatarSrc = avatar.getAttribute('src');


    // ===== 열기 / 닫기 =====

    // 열림 여부를 변수로 두지 않고 DOM에서 직접 읽음.
    // 상태가 두 군데면 화면과 변수가 어긋남.
    function isOpen() {
        return !panel.hidden;
    }

    function openMenu() {
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', () => {
        isOpen() ? closeMenu() : openMenu();
    });

    // 바깥 클릭으로 닫기.
    // stopPropagation 대신 클릭 위치를 확인 — 이벤트를 끊으면 나중에 document에
    // 붙는 다른 기능이 이 영역에서만 조용히 죽음.
    document.addEventListener('click', (event) => {
        // 모든 클릭마다 실행되므로 가벼운 검사를 먼저
        if (!isOpen()) return;
        if (event.target.closest('#userMenu')) return;

        closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            closeMenu();
            // 사라진 메뉴에 포커스가 남지 않도록 되돌림
            trigger.focus();
        }
    });


    // ===== 로그아웃 =====

    // 로그아웃 절차를 다시 구현하지 않고 login.js에 위임.
    // handleLogout → refreshAuthUI → auth:changed → renderUserMenu 순으로 이어짐.
    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });


    // ===== 렌더링 =====

    function renderUserMenu() {
        const user = getCurrentUser();

        // 닫지 않고 감추면 다시 로그인했을 때 펼쳐진 상태로 나타남
        if (!user) {
            closeMenu();
            menu.hidden = true;
            return;
        }

        // img 필드가 없는 기존 가입자 대비
        avatar.src = user.img || defaultAvatarSrc;
        // 사용자 입력값이므로 textContent — innerHTML이면 태그가 실행됨(XSS)
        nameLabel.textContent = user.name;

        // 관리자 전용 항목.
        //
        // 위의 avatar·nameLabel과 달리 존재 확인을 하는 이유:
        //   헤더는 fetch로 오므로 header.html과 이 파일의 버전이 갈라질 수 있음.
        //   같은 파일 안의 코드는 그럴 수 없지만 컴포넌트는 브라우저 캐시나
        //   병합 순서에 따라 옛 마크업이 올 수 있어, 그때 드롭다운 전체가 죽음.
        //
        // 감추는 것은 화면 정리일 뿐 권한 검사가 아님 —
        // 주소를 직접 치면 열리고, 진짜 차단은 admin_users.js가 함.
        if (adminItem) adminItem.hidden = !isAdmin(user);

        menu.hidden = false;
    }

    // login.js가 이 파일을 알 필요 없음 — 의존이 한 방향으로만 흐름
    document.addEventListener('auth:changed', renderUserMenu);

    renderUserMenu();
}