/**
 * admin_users.js — 회원 관리 (관리자 전용)
 *
 * users(localStorage)를 표로 보여주기만 함. 수정·삭제는 없음.
 *
 * 화면은 넷 중 하나. 전환은 updateAuthState() 한 곳에서만 함.
 *   비로그인      → loginRequiredCard
 *   로그인·비관리자 → adminRequiredCard
 *   관리자·미인증   → verifyCard
 *   관리자·인증     → adminContent
 *
 * 의존: auth.js (getCurrentUser / isAdmin / getAllUsers)
 *       favorites.js (countFavorites)
 *       board.js (Board / ReviewBoard)
 * 구독: auth:changed — 로그인·권한이 바뀌면 화면을 다시 맞춤
 */


// 비밀번호 자리에 넣을 고정 문자열.
//
// user.pw를 읽어서 가리지 않고 아예 읽지 않음.
// 가리기만 하면 값이 변수와 DOM에 한 번은 들어가므로 DevTools로 꺼낼 수 있음.
// 관리자에게도 비밀번호를 알려줄 이유가 없음 — 서버가 있으면 BCrypt 해시라
// 애초에 되돌릴 수 없고, 되돌릴 수 있다는 것 자체가 평문 저장의 증거임.
const MASKED_PASSWORD = '••••••••';

const USERS_PER_PAGE = 10;

const loginRequiredCard = document.getElementById('loginRequiredCard');
const adminRequiredCard = document.getElementById('adminRequiredCard');
const verifyCard = document.getElementById('verifyCard');
const adminContent = document.getElementById('adminContent');

const verifyForm = document.getElementById('verifyForm');
const verifyPasswordInput = document.getElementById('verifyPasswordInput');
const verifyMessage = document.getElementById('verifyMessage');

const userTableHead = document.getElementById('userTableHead');
const userTableBody = document.getElementById('userTableBody');
const userSummary = document.getElementById('userSummary');
const userPagination = document.getElementById('userPagination');

let currentPage = 1;

// 본인 확인 통과 여부.
// my_info.js:102와 같은 이유로 변수에 둠 — 저장소에 두면 탭을 닫았다 열어도
// 남아 확인 절차가 무의미해짐. 새로고침하면 다시 묻는 게 의도된 동작.
// 남의 개인정보를 보는 화면이라 본인 화면(⑰)보다 더 필요함.
let isVerified = false;


// ===== 표 정의 =====

// 열마다 다른 것은 제목·정렬용 class·값 뽑는 법 셋뿐.
// 열을 추가할 때 여기 한 줄만 늘리면 머리글·본문이 함께 따라옴
// (my_activity.js:91의 TABS와 같은 방식).
const COLUMNS = [
    { label: '아이디', value: user => user.id },
    { label: '이름', value: user => user.name },
    { label: '이메일', value: user => user.email },
    { label: '비밀번호', modifier: 'muted', value: () => MASKED_PASSWORD },
    { label: '권한', value: user => (isAdmin(user) ? '관리자' : '회원') },

    // 저장소를 직접 읽지 않고 board.js가 내준 조회 함수를 씀.
    // 여기서 localStorage를 열면 키 이름이 두 곳에 생겨,
    // 저장 구조가 바뀔 때 에러 없이 0만 돌려주며 조용히 깨짐.
    { label: '리뷰', modifier: 'num', value: user => ReviewBoard.getReviewsByAuthor(user.id).length },
    { label: '댓글', modifier: 'num', value: user => Board.getCommentsByAuthor(user.id).length },
    { label: '즐겨찾기', modifier: 'num', value: user => countFavorites(user) }
];


// ===== 렌더링 =====

// 값은 전부 textContent로 넣음. 이 파일에는 값이 들어가는 innerHTML이 하나도 없음.
//
// name·email은 회원가입 폼에서 들어온 사용자 입력이라,
// 템플릿 리터럴로 조립하면 저장형 XSS 자리가 하나 더 생김.
// 기존 목록들이 아직 innerHTML인 것과 별개로, 새로 만드는 것은 처음부터 안전하게 둠.
function createCell(tagName, column, user) {
    const cell = document.createElement(tagName);

    if (column.modifier) {
        cell.classList.add(`admin-users__cell--${column.modifier}`);
    }

    cell.textContent = user ? column.value(user) : column.label;

    return cell;
}

function renderHead() {
    const row = document.createElement('tr');

    COLUMNS.forEach(column => {
        const cell = createCell('th', column, null);
        cell.scope = 'col';
        row.appendChild(cell);
    });

    userTableHead.replaceChildren(row);
}

function renderRows(users) {
    const rows = users.map(user => {
        const row = document.createElement('tr');

        COLUMNS.forEach(column => row.appendChild(createCell('td', column, user)));

        return row;
    });

    // 자식을 통째로 갈아끼움. innerHTML = ''로 비우고 append하는 것과 결과는 같지만
    // 문자열 파싱을 거치지 않음.
    userTableBody.replaceChildren(...rows);
}

function renderPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

    userPagination.replaceChildren();
    userPagination.hidden = totalPages <= 1;

    for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = `admin-users__page-btn ${page === currentPage ? 'active' : ''}`;
        button.textContent = page;
        button.addEventListener('click', () => {
            currentPage = page;
            renderTable();
        });

        userPagination.appendChild(button);
    }
}

function renderTable() {
    // 매번 다시 조회. 변수에 잡아두면 다른 탭에서 가입한 회원이 안 보임.
    const users = getAllUsers();

    userSummary.textContent = `회원 ${users.length}명`;

    if (users.length === 0) {
        userTableBody.replaceChildren();
        userPagination.hidden = true;
        return;
    }

    // 마지막 페이지의 마지막 회원이 사라지면 존재하지 않는 페이지에 남게 됨.
    // 바닥을 1로 막지 않으면 전부 사라졌을 때 0페이지가 됨.
    const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * USERS_PER_PAGE;

    renderRows(users.slice(start, start + USERS_PER_PAGE));
    renderPagination(users.length);
}


// ===== 본인 확인 =====

verifyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // 폼을 채우는 동안 쿠키가 만료됐거나 다른 탭에서 로그아웃했을 수 있음
    const user = getCurrentUser();

    if (!user || !isAdmin(user)) {
        updateAuthState();
        return;
    }

    if (verifyPasswordInput.value !== user.pw) {
        verifyMessage.textContent = '비밀번호가 일치하지 않습니다.';
        verifyMessage.classList.add('error');
        verifyPasswordInput.select();
        return;
    }

    // 입력칸에 비밀번호가 남지 않도록 비움
    verifyForm.reset();
    verifyMessage.textContent = '';
    verifyMessage.classList.remove('error');

    isVerified = true;
    currentPage = 1;
    updateAuthState();
});


// ===== 화면 전환 =====

// 상태를 바꾸는 유일한 통로. 경로가 갈라지면 카드 넷 중 둘이 동시에 보임.
function updateAuthState() {
    // 변수에 잡아두지 않고 매번 조회 —
    // 로그아웃 후 다른 계정으로 로그인하면 옛 사람 기준으로 판단하게 됨
    const user = getCurrentUser();

    // isAdmin은 인자를 생략하면 현재 사용자를 조회함(auth.js:50).
    // null을 넘기면 기본값이 적용되지 않고 Boolean(null)에서 걸러져 false가 됨 —
    // 비로그인일 때 조회가 두 번 일어나지 않게 이미 읽은 값을 그대로 넘김.
    const admin = isAdmin(user);

    // 로그인이 풀리거나 권한을 잃으면 인증도 함께 풀림.
    // 안 풀면 관리자로 확인한 뒤 다른 계정으로 바꿔도 표가 열린 채 남음.
    if (!admin) isVerified = false;

    loginRequiredCard.hidden = Boolean(user);
    adminRequiredCard.hidden = !user || admin;
    verifyCard.hidden = !admin || isVerified;
    adminContent.hidden = !admin || !isVerified;

    if (admin && isVerified) renderTable();
}

document.addEventListener('auth:changed', updateAuthState);


renderHead();
updateAuthState();
