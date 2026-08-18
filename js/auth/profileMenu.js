/**
 * profileMenu.js — 헤더 사용자 프로필 드롭다운
 *
 * 로그인한 사용자의 프로필 영역을 그리고, 클릭 시 열리는 메뉴를 제어합니다.
 * 메뉴 항목은 HTML의 li로 관리하므로 기능을 추가해도 이 파일은 수정하지 않습니다.
 *
 * 의존: auth.js (getCurrentUser), login.js (handleLogout)
 * 공개: window.renderUserMenu — login.js의 updateHeader가 호출합니다.
 *
 * 전체를 즉시 실행 함수로 감싸 내부 변수가 전역으로 새어 나가지 않게 합니다.
 */
window.initUserMenu = function () {
    const menu = document.getElementById('userMenu');
    // 헤더가 없는 페이지에서도 이 스크립트를 읽을 수 있으므로 조용히 종료
    if (!menu) return;

    const trigger = document.getElementById('userMenuTrigger');
    const panel = document.getElementById('userMenuPanel');
    const avatar = document.getElementById('userMenuAvatar');
    const nameLabel = document.getElementById('userMenuName');
    const logoutBtn = document.getElementById('userMenuLogout');
    // WHY: header.js가 경로를 이미 완전한 주소로 바꿔놓은 뒤라 그 값을 그대로 재사용합니다.
    //      여기서 './img/...'를 직접 쓰면 html/main/ 페이지에서 404가 납니다.
    const defaultAvatarSrc = avatar.getAttribute('src');


    // ===== 열기 / 닫기 =====

    // 열림 여부를 별도 변수로 두지 않고 DOM에서 직접 읽습니다.
    // 상태를 두 군데에 두면 화면과 변수가 어긋날 수 있습니다.
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

    // 메뉴 바깥을 클릭하면 닫습니다.
    // stopPropagation으로 이벤트를 끊지 않고, 클릭 위치를 확인하는 방식을 씁니다.
    // 이벤트를 끊으면 나중에 document에 붙는 다른 기능이 이 영역에서만 동작하지 않게 됩니다.
    document.addEventListener('click', (event) => {
        // 페이지의 모든 클릭마다 실행되므로 가장 가벼운 검사를 먼저 수행
        if (!isOpen()) return;

        // closest는 클릭한 요소부터 조상 방향으로 올라가며 찾음
        // 메뉴 안이면 요소를, 바깥이면 null을 반환
        if (event.target.closest('#userMenu')) return;

        closeMenu();
    });

    // ESC로도 닫히게 합니다.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            closeMenu();
            // 사라진 메뉴에 포커스가 남지 않도록 눌렀던 버튼으로 되돌림
            trigger.focus();
        }
    });


    // ===== 로그아웃 =====

    // 로그아웃 절차를 여기서 다시 구현하지 않고 login.js의 함수에 위임합니다.
    // 화면 갱신은 handleLogout → updateHeader → renderUserMenu 순으로 이어집니다.
    logoutBtn.addEventListener('click', () => {
        handleLogout();
    });


    // ===== 렌더링 =====

    // 현재 로그인 상태에 맞춰 프로필 영역을 다시 그립니다.
    function renderUserMenu() {
        const user = getCurrentUser();

        // 비로그인 상태: 열려 있던 메뉴까지 정리한 뒤 영역 전체를 감춤
        // (닫지 않고 감추면 다시 로그인했을 때 펼쳐진 상태로 나타남)
        if (!user) {
            closeMenu();
            menu.hidden = true;
            return;
        }

        // img 필드가 없는 기존 가입자도 있으므로 기본 이미지로 대체
        avatar.src = user.img || defaultAvatarSrc;
        // 이름은 사용자 입력값이므로 textContent로 넣어 태그가 실행되지 않게 함
        nameLabel.textContent = user.name;
        menu.hidden = false;
    }

    // 즉시 실행 함수 바깥에서도 호출할 수 있도록 이 함수만 공개
    window.renderUserMenu = renderUserMenu;
}