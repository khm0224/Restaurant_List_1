// 리뷰 목록 페이지용 샘플 데이터.
// 이후 실제 서버/DB 연동 시 이 배열을 API 응답으로 교체하면 된다.
// 필수 필드: id, restaurant, rating, text, createdAt
// 선택 필드: photo (리뷰 사진 URL 또는 Base64 데이터 URL)
const mockReviews = [
  {
    id: 1,
    restaurant: '도쿄라멘춘천한림대점',
    rating: 5,
    text: '매운 맛이 딱 적당하고 국물이 진해서 만족스러웠어요. 다음에도 다시 방문하고 싶습니다.',
    createdAt: '2026-08-18'
  }
];

// 리뷰 카드가 들어갈 DOM 컨테이너.
// HTML의 <div id="reviewList"></div> 와 연결되어 있다.
const reviewList = document.getElementById('reviewList');

// 별점 문자열 생성 함수.
// rating: 1~5, 5점 만점 기준으로 별을 채운다.
function renderStars(rating) {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return `${filled}${empty}`;
}

// 리뷰 리스트를 HTML 카드 형태로 렌더링한다.
// 이후 API에서 데이터를 받아오면 mockReviews 대신 fetchedReviews를 넣으면 된다.
function renderReviewCards() {
  if (!reviewList) return;

  // 비어 있는 경우를 위한 기본 상태 UI.
  if (!mockReviews.length) {
    reviewList.innerHTML = `
      <article class="announcement-card">
        <div class="announcement-tag">비어 있음</div>
        <h2>아직 작성한 리뷰가 없습니다.</h2>
        <p>리뷰가 생기면 이곳에 카드 형태로 표시됩니다.</p>
        <div class="announcement-meta">
          <span>—</span>
        </div>
      </article>
    `;
    return;
  }

  // 카드 생성: 각 리뷰 객체를 article로 변환한다.
  // TODO: 삭제 버튼 클릭 시 실제 삭제 로직 연결 예정.
  reviewList.innerHTML = mockReviews.map((review) => {
    // 사진이 등록된 리뷰에만 이미지 태그를 추가하고, 없으면 카드 영역을 비워 둔다.
    const photoHtml = review.photo
      ? `<img class="review-card__photo" src="${review.photo}" alt="${review.restaurant} 리뷰 사진">`
      : '';

    return `
    <article class="announcement-card review-card" data-review-id="${review.id}">
      <div class="announcement-tag">리뷰</div>
      <div class="review-card__header">
        <h2>${review.restaurant}</h2>
        <button type="button" class="review-card__delete" aria-label="리뷰 삭제">삭제</button>
      </div>
      <p class="review-card__rating">${renderStars(review.rating)}</p>
      <p>${review.text}</p>
      ${photoHtml}
      <div class="announcement-meta">
        <span>${new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
      </div>
    </article>
    `;
  }).join('');
}


// 초기 렌더 실행.
renderReviewCards();
