/**
 * review.js — 내가 쓴 리뷰 화면
 *
 * 저장소를 직접 읽지 않고 ReviewBoard를 거침. 로그인한 사람의 리뷰만 모아 최신순으로 표시.
 *
 * 의존: auth.js (getCurrentUser), board.js (ReviewBoard), restaurantData.js (getRestaurantData)
 * 구독: auth:changed — 로그인 상태에 따라 영역 전환
 */


const loginRequiredCard = document.getElementById('loginRequiredCard');
const reviewContent = document.getElementById('reviewContent');
const reviewList = document.getElementById('reviewList');
const reviewPagination = document.getElementById('reviewPagination');

const REVIEWS_PER_PAGE = 5;

// 화면에 드러나지 않는 상태라 DOM이 아니라 변수에 둠
let currentReviewPage = 1;


// ===== 조회 =====

// 저장된 건 authorId뿐. 화면에 필요한 나머지는 그릴 때마다 조회.
function loadMyReviews() {
    const user = getCurrentUser();

    if (!user) return [];

    // 여러 식당에서 모으므로 순서가 뒤섞임.
    // Object.entries의 키 순서를 믿으면 안 되므로 시각으로 다시 정렬.
    return ReviewBoard.getReviewsByAuthor(user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// restaurantId를 조각내 식당 위치를 얻음.
//
// 키 형식이 도중에 바뀌었고 저장소에는 두 형식이 섞여 있음.
//   "교동_한식_0"  현재 형식 (restaurantDetail.js:102)
//   "한식_0"       옛 형식 — 동네가 없어 다른 동네의 같은 자리와 키가 겹쳤음
//
// 조각 수 자체가 형식을 알려주므로 split으로 세어 가름.
// 카테고리는 한식/일식/중식/양식/디저트 다섯뿐이고 '_'가 없어 이 판별이 성립함.
function getStoreLocation(review) {
    const parts = review.restaurantId.split('_');

    if (parts.length === 3) {
        // 키에 동네가 들어 있으면 그쪽이 기준.
        // 리뷰의 district 필드와 어긋나면 상세 페이지가 쓰는 키를 따라야 함.
        return { district: parts[0], category: parts[1], id: Number(parts[2]) };
    }

    // 옛 리뷰. 저장할 때 함께 남긴 district를 씀.
    // 그마저 없는 건 키 형식이 바뀌기 전 데이터라 당시 유일했던 교동으로 봄.
    return {
        district: review.district || '교동',
        category: parts[0],
        id: Number(parts[1])
    };
}

// 이름은 저장하지 않고 조회. 가게 이름이 바뀌어도 옛 리뷰가 옛 이름을 들지 않음.
function getStoreName(location) {
    const store = window.getRestaurantData?.(location.category, location.id, location.district);

    return store?.name || '알 수 없는 식당';
}


// ===== 렌더링 =====

function renderStars(rating) {
    // 기존 데이터에 rating이 없으면 repeat(undefined)에서 RangeError.
    // 5를 넘으면 repeat에 음수가 들어가 역시 RangeError라 위아래를 모두 막음.
    const score = Math.min(5, Math.max(0, Number(rating) || 0));

    return '★'.repeat(score) + '☆'.repeat(5 - score);
}

function getPaginatedReviews(reviews) {
    const start = (currentReviewPage - 1) * REVIEWS_PER_PAGE;

    return reviews.slice(start, start + REVIEWS_PER_PAGE);
}

function renderPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / REVIEWS_PER_PAGE);

    reviewPagination.innerHTML = '';
    reviewPagination.hidden = totalPages <= 1;

    for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `announcement-page-btn ${page === currentReviewPage ? 'active' : ''}`;
        button.textContent = page;
        button.addEventListener('click', () => {
            currentReviewPage = page;
            renderReviewCards();
        });
        reviewPagination.appendChild(button);
    }
}

function reviewCardHTML(review) {
    const location = getStoreLocation(review);

    // 상세 페이지는 URL 파라미터로 식당을 복원함(restaurantDetail.js:82).
    // sessionStorage를 여기서 심지 않음 — 심는 곳이 둘이면 진실이 갈라짐.
    const detailUrl = `../restaurant_detail.html?district=${encodeURIComponent(location.district)}`
        + `&category=${encodeURIComponent(location.category)}&id=${location.id}`;

    const photoHtml = review.photo
        ? `<img class="review-card__photo" src="${review.photo}" alt="리뷰 사진">`
        : '';

    return `
    <article class="announcement-card review-card" data-review-id="${review.id}" data-restaurant-id="${review.restaurantId}">
      <div class="announcement-tag">리뷰</div>
      <div class="review-card__header">
        <h2><a class="review-card__link" href="${detailUrl}">${getStoreName(location)}</a></h2>
        <button type="button" class="review-card__delete" aria-label="리뷰 삭제">삭제</button>
      </div>
      <p class="review-card__rating">${renderStars(review.rating)}</p>
      <p>${review.text}</p>
      ${photoHtml}
      <div class="announcement-meta">
        <span>${location.district}</span>
        <span>${new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
      </div>
    </article>
    `;
}

function renderReviewCards() {
    const reviews = loadMyReviews();

    if (reviews.length === 0) {
        reviewList.innerHTML = `
      <article class="announcement-card">
        <div class="announcement-tag">비어 있음</div>
        <h2>아직 작성한 리뷰가 없습니다.</h2>
        <p>식당 상세 페이지에서 리뷰를 남기면 이곳에 모입니다.</p>
      </article>
    `;
        reviewPagination.hidden = true;
        return;
    }

    // 마지막 페이지의 마지막 리뷰를 지우면 존재하지 않는 페이지에 남게 됨.
    // 바닥을 1로 막지 않으면 전부 지웠을 때 0페이지가 됨.
    const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
    currentReviewPage = Math.min(currentReviewPage, totalPages);

    reviewList.innerHTML = getPaginatedReviews(reviews).map(reviewCardHTML).join('');

    renderPagination(reviews.length);
}


// ===== 삭제 =====

// 카드마다 리스너를 붙이지 않고 목록에 하나만 검. innerHTML로 다시 그려도 살아남음.
// 카드 안에 링크가 있어 stopPropagation 대신 closest로 위치를 확인함.
reviewList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.review-card__delete');

    if (!deleteBtn) return;

    // 화면에 보이는 게 내 리뷰뿐이라 해도 그건 화면 사정.
    // 쿠키가 1일 만료라 보는 동안 로그인이 풀렸을 수 있음.
    if (!getCurrentUser()) {
        updateAuthState();
        return;
    }

    const card = deleteBtn.closest('.review-card');

    // 되돌릴 수 없는 동작이라 한 번 확인
    if (!confirm('이 리뷰를 삭제할까요?')) return;

    // dataset 값은 항상 문자열이라 Number로 바꿔야 id 비교가 성립
    ReviewBoard.deleteReview(card.dataset.restaurantId, Number(card.dataset.reviewId));

    renderReviewCards();
});


// ===== 로그인 상태 =====

function updateAuthState() {
    const user = getCurrentUser();

    loginRequiredCard.hidden = Boolean(user);
    reviewContent.hidden = !user;

    // 다른 계정으로 바뀌면 보던 페이지 번호가 의미 없음
    if (!user) {
        currentReviewPage = 1;
        return;
    }

    renderReviewCards();
}

document.addEventListener('auth:changed', updateAuthState);

updateAuthState();
