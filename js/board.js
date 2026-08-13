// localStorage : 브라우저가 제공하는 간단한 데이터 저장 공간
// 서버/DB 없이 브라우저 localStorage로 댓글을 흉내내는 간이 게시판 모듈

const BOARD_STORAGE_KEY = 'restaurantComments';

// 댓글 저장소에서 식당별 댓글 목록을 읽습니다.
function loadBoard() {
    try {
        return JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

// 변경된 댓글 목록을 브라우저에 저장합니다.
function saveBoard(board) {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
}

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

// 리뷰 저장소에서 식당별 리뷰 목록을 읽습니다.
function loadReviewBoard() {
    try {
        return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

// 변경된 리뷰 목록을 브라우저에 저장합니다.
function saveReviewBoard(board) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(board));
}

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

