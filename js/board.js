// 서버/DB 없이 브라우저 localStorage로 댓글을 흉내내는 간이 게시판 모듈
const BOARD_STORAGE_KEY = 'restaurantComments';

function loadBoard() {
    try {
        return JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

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
