// 핵심 역할: 브라우저의 localStorage를 이용해 댓글과 리뷰를 임시 저장하는 간이 데이터 저장소
// 목적: 서버 없이도 식당 상세 페이지에서 댓글/리뷰를 추가, 조회, 삭제할 수 있게 만들기
// 동작 방식: 각 식당별로 고유 키를 두고, JSON 객체 형태로 데이터를 저장/불러오기

const BOARD_STORAGE_KEY = 'restaurantComments';

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
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
}

// 댓글 관련 전역 API를 제공해 상세 페이지에서 조회/추가/삭제를 쉽게 수행합니다.
window.Board = {
    getComments(restaurantId) {
        const board = loadBoard();
        return board[restaurantId] || [];
    },

    addComment(restaurantId, author, text) {
        const board = loadBoard();
        const comments = board[restaurantId] || [];

        comments.push({
            id: Date.now(),
            author: author?.trim() || '익명',
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
    }
};

// 리뷰(평점 + 내용 + 사진)도 같은 방식으로 localStorage에 흉내내어 저장
const REVIEW_STORAGE_KEY = 'restaurantReviews';

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
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(board));
}

// 리뷰 전용 전역 API를 제공해 평점, 텍스트, 사진 데이터를 관리합니다.
window.ReviewBoard = {
    getReviews(restaurantId) {
        const board = loadReviewBoard();
        return board[restaurantId] || [];
    },

    addReview(restaurantId, rating, text, photo) {
        const board = loadReviewBoard();
        const reviews = board[restaurantId] || [];

        reviews.push({
            id: Date.now(),
            rating,
            text: text.trim(),
            photo: photo || null,
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
    }
};

