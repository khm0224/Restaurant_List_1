const detailCard = document.getElementById('detail-card');
const reviewSection = document.getElementById('review-section');
const reviewPhotoGrid = document.getElementById('review-photo-grid');
const reviewViewAllBtn = document.getElementById('review-view-all-btn');
const reviewPhotoModalOverlay = document.getElementById('review-photo-modal-overlay');
const reviewPhotoModalClose = document.getElementById('review-photo-modal-close');
const reviewPhotoModalImg = document.getElementById('review-photo-modal-img');
const reviewPhotoModalStars = document.getElementById('review-photo-modal-stars');
const reviewPhotoModalDate = document.getElementById('review-photo-modal-date');
const reviewPhotoModalText = document.getElementById('review-photo-modal-text');
const reviewAllModalOverlay = document.getElementById('review-all-modal-overlay');
const reviewAllModalClose = document.getElementById('review-all-modal-close');
const reviewAllList = document.getElementById('review-all-list');
const reviewPagePrev = document.getElementById('review-page-prev');
const reviewPageNext = document.getElementById('review-page-next');
const reviewPageInfo = document.getElementById('review-page-info');
const reviewModalOverlay = document.getElementById('review-modal-overlay');
const reviewModalClose = document.getElementById('review-modal-close');
const reviewModalCancel = document.getElementById('review-modal-cancel');
const reviewForm = document.getElementById('review-form');
const starRating = document.getElementById('star-rating');
const starButtons = starRating.querySelectorAll('.star-btn');
const reviewRatingInput = document.getElementById('review-rating-input');
const reviewText = document.getElementById('review-text');
const reviewPhotoInput = document.getElementById('review-photo');
const reviewPhotoPreview = document.getElementById('review-photo-preview');
const menuSection = document.getElementById('menu-section');
const menuList = document.getElementById('menu-list');
const commentSection = document.getElementById('comment-section');
const commentList = document.getElementById('comment-list');
const commentForm = document.getElementById('comment-form');
const commentLocked = document.getElementById('comment-locked');
const commentText = document.getElementById('comment-text');
const commentPagePrev = document.getElementById('comment-page-prev');
const commentPageNext = document.getElementById('comment-page-next');
const commentPageInfo = document.getElementById('comment-page-info');

// 현재는 로그인 여부와 관계없이 댓글 작성 폼을 표시합니다.
commentForm.hidden = false;
commentLocked.hidden = true;

const COMMENTS_PER_PAGE = 5;
let commentPage = 1;

// 목록 페이지에서 선택한 식당을 복원하고, 직접 접속 시 URL로 보완합니다.
let saved = sessionStorage.getItem('selectedRestaurant');
const queryParams = new URLSearchParams(window.location.search);
const districtParam = queryParams.get('district');
const categoryParam = queryParams.get('category');
const idParam = queryParams.get('id');

if (!saved && categoryParam && idParam !== null) {
    const fallbackStore = window.getRestaurantData?.(categoryParam, Number(idParam), districtParam || window.currentSelectedDistrict || '교동');

    if (fallbackStore) {
        saved = JSON.stringify({
            ...fallbackStore,
            district: districtParam || window.currentSelectedDistrict || '교동',
            category: categoryParam,
            id: Number(idParam)
        });
        sessionStorage.setItem('selectedRestaurant', saved);
    }
}

let restaurantId = null;

if (!saved) {
    detailCard.innerHTML = '<div class="detail-empty"><h2>선택된 식당 정보가 없습니다</h2></div>';
} else {
    const store = JSON.parse(saved);
    restaurantId = `${store.category}_${store.id}`;

    detailCard.innerHTML = `
        <img src="${store.img}" alt="${store.name}">
        <div class="detail-content">
            <div class="detail-category">${store.category}</div>
            <h1 class="detail-title">${store.name}</h1>
            <div class="detail-meta">
                <span>⭐ ${store.rating}</span>
                <span>리뷰 ${store.reviewCount}</span>
                <button class="review-write-btn" id="review-write-btn" type="button">리뷰쓰기</button>
            </div>
            <p class="detail-address">📍 ${store.address}</p>
        </div>
    `;

    document.getElementById('review-write-btn').addEventListener('click', openReviewModal);

    renderMenu(store.category);
    reviewSection.hidden = false;
    renderReviews();
    commentSection.hidden = false;
    renderComments();
}

// 식당 카테고리에 맞는 임시 메뉴를 표시합니다.
function renderMenu(category) {
    const menu = window.menuTemplates?.[category] || [];

    if (menu.length === 0) {
        return;
    }

    menuList.innerHTML = menu.map(item => `
        <div class="menu-item">
            <span class="menu-name">${item.name}</span>
            <span class="menu-price">${item.price.toLocaleString()}원</span>
        </div>
    `).join('');

    menuSection.hidden = false;
}

function reviewItemHTML(review) {
    return `
        <li class="review-item" data-id="${review.id}">
            <div class="review-meta">
                <span class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                <span class="review-date">${new Date(review.createdAt).toLocaleString()}</span>
            </div>
            <p class="review-text">${review.text}</p>
            ${review.photo ? `<img class="review-photo" src="${review.photo}" alt="리뷰 사진">` : ''}
            <button class="review-delete" type="button" data-id="${review.id}">삭제</button>
        </li>
    `;
}

// 저장된 리뷰에서 사진 미리보기와 전체보기 버튼을 갱신합니다.
function renderReviews() {
    const reviews = ReviewBoard.getReviews(restaurantId).slice().reverse();

    if (reviews.length === 0) {
        reviewPhotoGrid.innerHTML = '<p class="review-empty">아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요.</p>';
        reviewViewAllBtn.hidden = true;
        return;
    }

    const photoReviews = reviews.filter(review => review.photo).slice(0, 3);

    reviewPhotoGrid.innerHTML = photoReviews.length === 0
        ? '<p class="review-empty">아직 등록된 리뷰 사진이 없습니다.</p>'
        : photoReviews.map(review => `
        <button type="button" class="review-photo-thumb" data-id="${review.id}">
            <img src="${review.photo}" alt="리뷰 사진">
        </button>
    `).join('');

    reviewPhotoGrid.querySelectorAll('.review-photo-thumb').forEach(btn => {
        btn.addEventListener('click', () => {
            const review = reviews.find(item => item.id === Number(btn.dataset.id));
            if (review) {
                openReviewPhotoModal(review);
            }
        });
    });

    reviewViewAllBtn.hidden = reviews.length === 0;
}

function openReviewPhotoModal(review) {
    reviewPhotoModalImg.src = review.photo;
    reviewPhotoModalStars.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;
    reviewPhotoModalDate.textContent = new Date(review.createdAt).toLocaleString();
    reviewPhotoModalText.textContent = review.text;
    reviewPhotoModalOverlay.hidden = false;
}

reviewPhotoModalClose.addEventListener('click', () => {
    reviewPhotoModalOverlay.hidden = true;
});

reviewPhotoModalOverlay.addEventListener('click', (event) => {
    if (event.target === reviewPhotoModalOverlay) {
        reviewPhotoModalOverlay.hidden = true;
    }
});

const REVIEWS_PER_PAGE = 5;
let reviewPage = 1;

// 전체 리뷰를 페이지 단위로 표시하고 삭제 이벤트를 연결합니다.
function renderReviewPage() {
    const reviews = ReviewBoard.getReviews(restaurantId).slice().reverse();
    const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
    reviewPage = Math.min(reviewPage, totalPages);

    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    const pageReviews = reviews.slice(start, start + REVIEWS_PER_PAGE);

    reviewAllList.innerHTML = pageReviews.length === 0
        ? '<li class="review-empty">아직 리뷰가 없습니다.</li>'
        : pageReviews.map(reviewItemHTML).join('');

    reviewAllList.querySelectorAll('.review-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            ReviewBoard.deleteReview(restaurantId, Number(btn.dataset.id));
            renderReviews();
            renderReviewPage();
        });
    });

    reviewPageInfo.textContent = `${reviewPage} / ${totalPages}`;
    reviewPagePrev.disabled = reviewPage <= 1;
    reviewPageNext.disabled = reviewPage >= totalPages;
}

reviewViewAllBtn.addEventListener('click', () => {
    reviewPage = 1;
    renderReviewPage();
    reviewAllModalOverlay.hidden = false;
});

reviewAllModalClose.addEventListener('click', () => {
    reviewAllModalOverlay.hidden = true;
});

reviewAllModalOverlay.addEventListener('click', (event) => {
    if (event.target === reviewAllModalOverlay) {
        reviewAllModalOverlay.hidden = true;
    }
});

reviewPagePrev.addEventListener('click', () => {
    reviewPage -= 1;
    renderReviewPage();
});

reviewPageNext.addEventListener('click', () => {
    reviewPage += 1;
    renderReviewPage();
});

let selectedRating = 0;

// 선택한 별점과 버튼의 강조 상태를 함께 갱신합니다.
function setStarRating(value) {
    selectedRating = value;
    reviewRatingInput.value = value ? String(value) : '';
    reviewRatingInput.setCustomValidity('');
    starButtons.forEach(btn => {
        btn.classList.toggle('selected', Number(btn.dataset.value) <= value);
    });
}

starButtons.forEach(btn => {
    btn.addEventListener('click', () => setStarRating(Number(btn.dataset.value)));
});

reviewText.addEventListener('input', () => {
    reviewText.setCustomValidity('');
});

function openReviewModal() {
    reviewModalOverlay.hidden = false;
}

function closeReviewModal() {
    reviewModalOverlay.hidden = true;
    reviewForm.reset();
    setStarRating(0);
    reviewPhotoPreview.hidden = true;
    reviewPhotoPreview.src = '';
}

reviewModalClose.addEventListener('click', closeReviewModal);
reviewModalCancel.addEventListener('click', closeReviewModal);
reviewModalOverlay.addEventListener('click', (event) => {
    if (event.target === reviewModalOverlay) {
        closeReviewModal();
    }
});

// 선택한 사진을 Base64 미리보기로 변환합니다.
reviewPhotoInput.addEventListener('change', () => {
    const file = reviewPhotoInput.files[0];

    if (!file) {
        reviewPhotoPreview.hidden = true;
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        reviewPhotoPreview.src = reader.result;
        reviewPhotoPreview.hidden = false;
    };
    reader.readAsDataURL(file);
});

// 유효성 검사 후 리뷰를 브라우저 저장소에 등록합니다.
reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (selectedRating === 0) {
        reviewRatingInput.setCustomValidity('별점을 선택해 주세요.');
        reviewRatingInput.reportValidity();
        reviewRatingInput.setCustomValidity('');
        return;
    }

    if (!reviewText.value.trim()) {
        reviewText.setCustomValidity('리뷰 내용을 작성해 주세요.');
        reviewText.reportValidity();
        reviewText.setCustomValidity('');
        return;
    }

    const photo = reviewPhotoPreview.hidden ? null : reviewPhotoPreview.src;
    ReviewBoard.addReview(restaurantId, selectedRating, reviewText.value, photo);
    renderReviews();
    closeReviewModal();
});


// 식당별 댓글을 페이지 단위로 표시하고 삭제 이벤트를 연결합니다.
function renderComments() {
    const comments = Board.getComments(restaurantId).slice().reverse();

    if (comments.length === 0) {
        commentList.innerHTML = '<li class="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</li>';
        commentPageInfo.textContent = '';
        commentPagePrev.disabled = true;
        commentPageNext.disabled = true;
        return;
    }

    const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
    commentPage = Math.min(commentPage, totalPages);

    const start = (commentPage - 1) * COMMENTS_PER_PAGE;
    const pageComments = comments.slice(start, start + COMMENTS_PER_PAGE);

    commentList.innerHTML = pageComments.map(comment => `
        <li class="comment-item" data-id="${comment.id}">
            <div class="comment-meta">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
            <button class="comment-delete" type="button" data-id="${comment.id}">삭제</button>
        </li>
    `).join('');

    commentList.querySelectorAll('.comment-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            Board.deleteComment(restaurantId, Number(btn.dataset.id));
            renderComments();
        });
    });

    commentPageInfo.textContent = `${commentPage} / ${totalPages}`;
    commentPagePrev.disabled = commentPage <= 1;
    commentPageNext.disabled = commentPage >= totalPages;
}

commentPagePrev.addEventListener('click', () => {
    commentPage -= 1;
    renderComments();
});

commentPageNext.addEventListener('click', () => {
    commentPage += 1;
    renderComments();
});

// 입력한 댓글을 브라우저 저장소에 등록합니다.
commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!commentText.value.trim()) {
        return;
    }

    Board.addComment(restaurantId, '', commentText.value);
    commentText.value = '';
    commentPage = 1;
    renderComments();
});
