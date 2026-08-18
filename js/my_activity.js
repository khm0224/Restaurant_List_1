/**
 * my_activity.js — 내 활동 (내 리뷰 / 내 댓글)
 *
 * 두 목록이 하는 일이 거의 같아 화면 뼈대를 하나로 두고, 종류별로 다른 부분만
 * TABS에 모음. 항목을 추가하면(즐겨찾기 등) 이 파일의 나머지는 손대지 않음.
 *
 * 의존: auth.js (getCurrentUser)
 *       board.js (Board / ReviewBoard / RestaurantKey)
 *       restaurantData.js (getRestaurantData)
 * 구독: auth:changed — 로그인 상태에 따라 영역 전환
 */


const tabBar = document.getElementById('activityTabs');
const loginRequiredCard = document.getElementById('loginRequiredCard');
const activityContent = document.getElementById('activityContent');
const activityList = document.getElementById('activityList');
const activityPagination = document.getElementById('activityPagination');

const ITEMS_PER_PAGE = 5;

// 화면에 드러나지 않는 상태라 DOM이 아니라 변수에 둠.
// 현재 탭은 버튼의 active 클래스로도 드러나지만, 그건 표시일 뿐 판단 기준은 여기.
let currentTab = 'reviews';
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

    return `
    <article class="announcement-card review-card" data-item-id="${item.id}" data-restaurant-id="${item.restaurantId}">
      <div class="announcement-tag">${tagLabel}</div>
      <div class="review-card__header">
        <h2><a class="review-card__link" href="${store.url}">${store.name}</a></h2>
        <button type="button" class="activity-delete review-card__delete" aria-label="삭제">삭제</button>
      </div>
      ${body}
      <div class="announcement-meta">
        <span>${store.district}</span>
        <span>${new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
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
        confirmText: '이 리뷰를 삭제할까요?',
        load: authorId => ReviewBoard.getReviewsByAuthor(authorId),
        remove: (restaurantId, id) => ReviewBoard.deleteReview(restaurantId, id),
        cardHTML: review => cardHTML(review, '리뷰', `
      <p class="review-card__rating">${renderStars(review.rating)}</p>
      <p>${review.text}</p>
      ${review.photo ? `<img class="review-card__photo" src="${review.photo}" alt="리뷰 사진">` : ''}
    `)
    },

    comments: {
        emptyText: '아직 작성한 댓글이 없습니다.',
        emptyHint: '식당 상세 페이지에서 댓글을 남기면 이곳에 모입니다.',
        confirmText: '이 댓글을 삭제할까요?',
        load: authorId => Board.getCommentsByAuthor(authorId),
        remove: (restaurantId, id) => Board.deleteComment(restaurantId, id),
        cardHTML: comment => cardHTML(comment, '댓글', `<p>${comment.text}</p>`)
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

// 버튼마다 리스너를 붙이지 않고 탭 바에 하나만 검. 항목이 늘어도 이 코드는 그대로.
tabBar.addEventListener('click', (event) => {
    const button = event.target.closest('.activity-tab');

    if (!button || button.dataset.tab === currentTab) return;

    currentTab = button.dataset.tab;

    // 종류가 바뀌면 보던 페이지 번호는 의미가 없음
    currentPage = 1;

    tabBar.querySelectorAll('.activity-tab').forEach(tab => {
        tab.classList.toggle('active', tab === button);
        tab.setAttribute('aria-selected', String(tab === button));
    });

    renderList();
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

    // dataset 값은 항상 문자열이라 Number로 바꿔야 id 비교가 성립
    TABS[currentTab].remove(card.dataset.restaurantId, Number(card.dataset.itemId));

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

updateAuthState();
