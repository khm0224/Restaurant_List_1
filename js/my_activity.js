/**
 * my_activity.js — 내 활동 (내 리뷰 / 내 댓글 / 즐겨찾기)
 *
 * 세 목록이 하는 일이 거의 같아 화면 뼈대를 하나로 두고, 종류별로 다른 부분만
 * TABS에 모음. 항목을 추가해도 이 파일의 나머지는 손대지 않음.
 *
 * 현재 탭은 URL(?tab=)에 남김 — 헤더에서 즐겨찾기로 바로 들어오고,
 * 뒤로가기와 북마크가 동작하게 하기 위함.
 *
 * 의존: auth.js (getCurrentUser)
 *       board.js (Board / ReviewBoard / RestaurantKey)
 *       favorites.js (getFavoriteIds / toggleFavorite)
 *       restaurantData.js (getRestaurantData)
 * 구독: auth:changed — 로그인 상태에 따라 영역 전환
 */


const tabBar = document.getElementById('activityTabs');
const loginRequiredCard = document.getElementById('loginRequiredCard');
const activityContent = document.getElementById('activityContent');
const activityList = document.getElementById('activityList');
const activityPagination = document.getElementById('activityPagination');

const ITEMS_PER_PAGE = 5;

const DEFAULT_TAB = 'reviews';

// 현재 탭은 버튼의 active 클래스로도 드러나지만 그건 표시일 뿐. 판단 기준은 여기.
// 초기값은 URL에서 읽음 — 없거나 모르는 값이면 기본 탭.
let currentTab = DEFAULT_TAB;
let currentPage = 1;


// ===== 공통 =====

// 식당 이름은 저장하지 않고 그릴 때마다 조회. 가게 이름이 바뀌어도 옛 글이 옛 이름을 들지 않음.
// item.district는 옛 형식(2조각) 키를 만났을 때만 쓰임 — 지금 키에는 동네가 들어 있음.
function getStoreInfo(item) {
    const location = RestaurantKey.parse(item.restaurantId, item.district);
    const store = window.getRestaurantData?.(location.category, location.id, location.district);

    return {
        ...location,
        name: store?.name || '알 수 없는 식당',
        // 상세 페이지는 URL 파라미터로 식당을 복원함(restaurantDetail.js:82).
        // sessionStorage를 여기서 심지 않음 — 심는 곳이 둘이면 진실이 갈라짐.
        url: `../restaurant_detail.html?district=${encodeURIComponent(location.district)}`
            + `&category=${encodeURIComponent(location.category)}&id=${location.id}`
    };
}

// 카드 위쪽(태그·가게이름·삭제버튼)과 아래쪽(동네·날짜)은 두 종류가 같음.
// 가운데 body만 종류별로 다르게 받아 끼움.
function cardHTML(item, tagLabel, body) {
    const store = getStoreInfo(item);
    const deleteLabel = TABS[currentTab].deleteLabel;

    // 즐겨찾기에는 작성 시각이 없음 — 날짜 칸 자체를 빼야 "Invalid Date"가 안 뜸
    const dateHtml = item.createdAt
        ? `<span>${new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>`
        : '';

    return `
    <article class="announcement-card review-card" data-item-id="${item.id}" data-restaurant-id="${item.restaurantId}">
      <div class="announcement-tag">${tagLabel}</div>
      <div class="review-card__header">
        <h2><a class="review-card__link" href="${store.url}">${store.name}</a></h2>
        <button type="button" class="activity-delete review-card__delete" aria-label="${deleteLabel}">${deleteLabel}</button>
      </div>
      ${body}
      <div class="announcement-meta">
        <span>${store.district}</span>
        ${dateHtml}
      </div>
    </article>
    `;
}

function renderStars(rating) {
    // 값이 없으면 repeat(undefined), 5를 넘으면 repeat(음수) — 양쪽 다 RangeError
    const score = Math.min(5, Math.max(0, Number(rating) || 0));

    return '★'.repeat(score) + '☆'.repeat(5 - score);
}


// ===== 탭 정의 =====

// 종류별로 다른 것은 이것뿐: 어떻게 읽고, 어떻게 그리고, 어떻게 지우는가.
// 항목을 추가할 때 여기와 HTML의 button 한 줄만 건드리면 됨.
const TABS = {
    reviews: {
        emptyText: '아직 작성한 리뷰가 없습니다.',
        emptyHint: '식당 상세 페이지에서 리뷰를 남기면 이곳에 모입니다.',
        deleteLabel: '삭제',
        confirmText: '이 리뷰를 삭제할까요?',
        load: authorId => ReviewBoard.getReviewsByAuthor(authorId),
        // dataset 값은 항상 문자열. 리뷰·댓글 id는 숫자라 바꿔야 비교가 성립함.
        remove: (restaurantId, id) => ReviewBoard.deleteReview(restaurantId, Number(id)),
        cardHTML: review => cardHTML(review, '리뷰', `
      <p class="review-card__rating">${renderStars(review.rating)}</p>
      <p>${review.text}</p>
      ${review.photo ? `<img class="review-card__photo" src="${review.photo}" alt="리뷰 사진">` : ''}
    `)
    },

    comments: {
        emptyText: '아직 작성한 댓글이 없습니다.',
        emptyHint: '식당 상세 페이지에서 댓글을 남기면 이곳에 모입니다.',
        deleteLabel: '삭제',
        confirmText: '이 댓글을 삭제할까요?',
        load: authorId => Board.getCommentsByAuthor(authorId),
        remove: (restaurantId, id) => Board.deleteComment(restaurantId, Number(id)),
        cardHTML: comment => cardHTML(comment, '댓글', `<p>${comment.text}</p>`)
    },

    favorites: {
        emptyText: '즐겨찾기한 식당이 없습니다.',
        emptyHint: '맛집 탐색 화면에서 ☆를 누르면 이곳에 모입니다.',
        deleteLabel: '해제',
        confirmText: '즐겨찾기를 해제할까요?',

        // 즐겨찾기는 식당 키 문자열 배열뿐이라 리뷰·댓글과 모양이 다름.
        // 뼈대가 기대하는 형태(restaurantId를 든 객체)로 맞춰 넘김.
        // 나중에 담은 게 위로 오도록 뒤집음 — 저장 순서가 곧 담은 순서.
        load: () => getFavoriteIds().reverse()
            .map(storeId => ({ id: storeId, restaurantId: storeId, createdAt: null })),

        // 삭제 대상이 하나뿐이라 두 인자가 같은 값. toggle이라 이미 없으면 다시 담김 —
        // 화면에 있는 것만 누를 수 있어 실제로는 해제로만 동작함.
        remove: restaurantId => toggleFavorite(restaurantId),
        cardHTML: favorite => cardHTML(favorite, '즐겨찾기', '')
    }
};


// ===== 조회 =====

function loadItems() {
    const user = getCurrentUser();

    if (!user) return [];

    // 여러 식당에서 모으므로 순서가 뒤섞임.
    // Object.entries의 키 순서를 믿으면 안 되므로 시각으로 다시 정렬.
    return TABS[currentTab].load(user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


// ===== 렌더링 =====

function renderPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    activityPagination.innerHTML = '';
    activityPagination.hidden = totalPages <= 1;

    for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `announcement-page-btn ${page === currentPage ? 'active' : ''}`;
        button.textContent = page;
        button.addEventListener('click', () => {
            currentPage = page;
            renderList();
        });
        activityPagination.appendChild(button);
    }
}

function renderList() {
    const tab = TABS[currentTab];
    const items = loadItems();

    if (items.length === 0) {
        activityList.innerHTML = `
      <article class="announcement-card">
        <div class="announcement-tag">비어 있음</div>
        <h2>${tab.emptyText}</h2>
        <p>${tab.emptyHint}</p>
      </article>
    `;
        activityPagination.hidden = true;
        return;
    }

    // 마지막 페이지의 마지막 글을 지우면 존재하지 않는 페이지에 남게 됨.
    // 바닥을 1로 막지 않으면 전부 지웠을 때 0페이지가 됨.
    const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    activityList.innerHTML = items.slice(start, start + ITEMS_PER_PAGE)
        .map(tab.cardHTML)
        .join('');

    renderPagination(items.length);
}


// ===== 탭 전환 =====

// TABS에 없는 값이 들어오면(오타·옛 링크) 기본 탭으로. 없는 키를 그대로 쓰면 전부 터짐.
function normalizeTab(name) {
    return TABS[name] ? name : DEFAULT_TAB;
}

// 상태는 currentTab 하나. 이 함수만 그 값을 바꾸고 화면·URL·버튼을 함께 맞춤.
// 바꾸는 경로가 갈라지면 셋 중 하나가 어긋남.
function setTab(name, { pushHistory = true } = {}) {
    currentTab = normalizeTab(name);

    // 종류가 바뀌면 보던 페이지 번호는 의미가 없음
    currentPage = 1;

    tabBar.querySelectorAll('.activity-tab').forEach(tab => {
        const isActive = tab.dataset.tab === currentTab;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });

    if (pushHistory) {
        // pushState는 주소만 바꾸고 페이지를 다시 부르지 않음.
        // 덕분에 뒤로가기가 탭 이동이 되고 북마크·새로고침도 그 탭으로 열림.
        const url = new URL(window.location.href);
        url.searchParams.set('tab', currentTab);
        history.pushState({ tab: currentTab }, '', url);
    }

    renderList();
}

// 버튼마다 리스너를 붙이지 않고 탭 바에 하나만 검. 항목이 늘어도 이 코드는 그대로.
tabBar.addEventListener('click', (event) => {
    const button = event.target.closest('.activity-tab');

    if (!button || button.dataset.tab === currentTab) return;

    setTab(button.dataset.tab);
});

// 뒤로가기·앞으로가기. 이때는 이미 이동한 뒤라 기록을 다시 쌓으면 안 됨.
window.addEventListener('popstate', () => {
    setTab(new URLSearchParams(window.location.search).get('tab'), { pushHistory: false });
});


// ===== 삭제 =====

// 카드마다 리스너를 붙이지 않고 목록에 하나만 검. innerHTML로 다시 그려도 살아남음.
// 카드 안에 링크가 있어 stopPropagation 대신 closest로 위치를 확인함.
activityList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.activity-delete');

    if (!deleteBtn) return;

    // 화면에 보이는 게 내 글뿐이라 해도 그건 화면 사정.
    // 쿠키가 1일 만료라 보는 동안 로그인이 풀렸을 수 있음.
    if (!getCurrentUser()) {
        updateAuthState();
        return;
    }

    // 되돌릴 수 없는 동작이라 한 번 확인
    if (!confirm(TABS[currentTab].confirmText)) return;

    const card = deleteBtn.closest('.review-card');

    // 문자열 그대로 넘김. 숫자로 바꿀지는 종류마다 달라 TABS의 remove가 판단함
    // (즐겨찾기 id는 "교동_한식_0" 같은 키라 Number를 씌우면 NaN).
    TABS[currentTab].remove(card.dataset.restaurantId, card.dataset.itemId);

    renderList();
});


// ===== 로그인 상태 =====

function updateAuthState() {
    const user = getCurrentUser();

    loginRequiredCard.hidden = Boolean(user);
    activityContent.hidden = !user;
    tabBar.hidden = !user;

    // 다른 계정으로 바뀌면 보던 페이지 번호가 의미 없음
    if (!user) {
        currentPage = 1;
        return;
    }

    renderList();
}

document.addEventListener('auth:changed', updateAuthState);


// 첫 진입. 헤더의 "즐겨찾기"는 ?tab=favorites로 들어옴.
// 주소를 새로 쌓지 않음 — 들어오자마자 뒤로가기가 같은 페이지로 돌아오면 안 됨.
setTab(new URLSearchParams(window.location.search).get('tab'), { pushHistory: false });

updateAuthState();
