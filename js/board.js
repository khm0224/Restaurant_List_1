// 핵심 역할: 브라우저의 localStorage를 이용해 댓글과 리뷰를 임시 저장하는 간이 데이터 저장소
// 목적: 서버 없이도 식당 상세 페이지에서 댓글/리뷰를 추가, 조회, 삭제할 수 있게 만들기
// 동작 방식: 각 식당별로 고유 키를 두고, JSON 객체 형태로 데이터를 저장/불러오기

// ===== 식당 키 =====

// 댓글·리뷰는 식당별 키 하나로 묶여 저장됨. 그 키를 만들고 쪼개는 곳을 여기 하나로 모음.
// 전에는 만드는 곳(restaurantDetail.js)과 쪼개는 곳(화면 스크립트)이 따로여서,
// 형식이 "카테고리_인덱스"에서 "동네_카테고리_인덱스"로 바뀌었을 때
// 쪼개는 쪽이 에러 없이 잘못된 값을 내놓았음.
window.RestaurantKey = {
    make(district, category, index) {
        return `${district}_${category}_${index}`;
    },

    // fallbackDistrict: 옛 형식(2조각) 키를 만났을 때 쓸 동네.
    // 리뷰는 저장할 때 남긴 district가 있고, 댓글은 없어 기본값으로 떨어짐.
    parse(restaurantId, fallbackDistrict) {
        const parts = String(restaurantId).split('_');

        // 조각 수가 곧 형식. 카테고리는 한식/일식/중식/양식/디저트뿐이라 '_'가 없어 성립함.
        if (parts.length === 3) {
            return { district: parts[0], category: parts[1], id: Number(parts[2]) };
        }

        return {
            district: fallbackDistrict || '교동',
            category: parts[0],
            id: Number(parts[1])
        };
    }
};


// ===== 댓글 =====

const BOARD_STORAGE_KEY = 'restaurantComments'; // 댓글 데이터 저장하는 공간 키값

// 저장소 전체에서 특정 작성자의 글만 모음. 댓글·리뷰가 같은 구조라 함수를 공유.
// 저장소는 식당별로 나뉘어 있어 전체 키를 훑는 수밖에 없음.
// restaurantId를 글에 붙여 내보냄 — 삭제할 때 필요한데 원래 글에는 없는 정보(바깥 키)임.
function collectByAuthor(board, authorId) {
    return Object.entries(board).flatMap(([restaurantId, items]) =>
        (Array.isArray(items) ? items : [])
            .filter(item => item.authorId === authorId)
            .map(item => ({ ...item, restaurantId }))
    );
}

// localStorage에서 식당별 댓글 데이터를 읽어오는 함수입니다.
function loadBoard() {
    try {
        return JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY)) || {}; //localStorage 이 내장 브라우저에 저장시켜준다.(DB대신 사용)
    } catch {
        return {};
    }
}

// 변경된 댓글 목록을 브라우저에 저장하는 함수입니다.
function saveBoard(board) {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board)); // 댓글 실제 로컬 스토리지에 저장
}

// 댓글 관련 전역 API를 제공해 상세 페이지에서 조회/추가/삭제를 쉽게 수행합니다.
window.Board = {
    getComments(restaurantId) {
        const board = loadBoard();
        return board[restaurantId] || [];
    },

    addComment(restaurantId, authorId, text) {
        const board = loadBoard();
        const comments = board[restaurantId] || [];

        comments.push({
            id: Date.now(),
            // 이름이 아닌 아이디를 저장. 이름은 바뀔 수 있어 표시 시점에 조회
            authorId: authorId || null,
            text: text.trim(),
            createdAt: new Date().toISOString()
        });

        board[restaurantId] = comments;
        saveBoard(board);
        return comments;
    },

    deleteComment(restaurantId, commentId) {
        const board = loadBoard();
        const comments = board[restaurantId] || [];

        board[restaurantId] = comments.filter(comment => comment.id !== commentId);
        saveBoard(board);
        return board[restaurantId];
    },

    // "내 활동" 화면용. 저장소 키가 이 파일 밖으로 나가지 않게 조회를 여기에 둠.
    getCommentsByAuthor(authorId) {
        if (!authorId) return [];

        return collectByAuthor(loadBoard(), authorId);
    }
};

// 리뷰(평점 + 내용 + 사진)도 같은 방식으로 localStorage에 흉내내어 저장
const REVIEW_STORAGE_KEY = 'restaurantReviews'; // 리뷰 데이터 저장하는 공간 키값

// localStorage에서 식당별 리뷰 데이터를 가져오는 함수입니다.
function loadReviewBoard() {
    try {
        return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

// 수정된 리뷰 목록을 browser storage에 저장합니다.
function saveReviewBoard(board) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(board)); // 리뷰 실제 로컬 스토리지에 저장
}

// 리뷰 전용 전역 API를 제공해 평점, 텍스트, 사진 데이터를 관리합니다.
window.ReviewBoard = {
    getReviews(restaurantId) {
        const board = loadReviewBoard();
        return board[restaurantId] || [];
    },

    // district는 맨 뒤에 추가한 인자.
    // 중간에 끼우면 기존 호출부의 순서가 밀려 photo 자리에 authorId가 들어감.
    // 맨 뒤면 안 넘기는 쪽은 undefined가 될 뿐 그대로 동작함.
    addReview(restaurantId, rating, text, photo, authorId, district) {
        const board = loadReviewBoard();
        const reviews = board[restaurantId] || [];

        reviews.push({
            id: Date.now(),
            rating,
            text: text.trim(),
            photo: photo || null,
            authorId: authorId || null,
            // restaurantId는 "일식_0" 형태로 동네가 빠져 있음.
            // 동네를 모르면 restaurantData에서 식당을 찾을 수 없어 따로 저장.
            district: district || null,
            createdAt: new Date().toISOString()
        });

        board[restaurantId] = reviews;
        saveReviewBoard(board);
        return reviews;
    },

    deleteReview(restaurantId, reviewId) {
        const board = loadReviewBoard();
        const reviews = board[restaurantId] || [];

        board[restaurantId] = reviews.filter(review => review.id !== reviewId);
        saveReviewBoard(board);
        return board[restaurantId];
    },

    // "내 활동" 화면용. REVIEW_STORAGE_KEY와 loadReviewBoard가 이 파일 밖으로
    // 나가지 않음. 밖에서 localStorage를 직접 읽으면 키 이름이 두 곳에 생겨,
    // 저장 구조가 바뀔 때 에러 없이 빈 배열만 돌려주며 조용히 깨짐.
    getReviewsByAuthor(authorId) {
        if (!authorId) return [];

        return collectByAuthor(loadReviewBoard(), authorId);
    }
};

