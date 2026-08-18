/**
 * auth.js가 먼저 로드되어 있어야 합니다.
 * loginUser 쿠키의 아이디로 localStorage 회원 목록에서 현재 사용자를 찾습니다.
 */
function getFavoriteCurrentUser() {
	return getCurrentUser();
}

const user = getFavoriteCurrentUser();

if (user && !Array.isArray(user.favorites)) {
	user.favorites = [];
	saveUsers();
}

function toggleFavorite(storeId) {
	const currentUser = getFavoriteCurrentUser();
	if (!currentUser) return null;

	if (!Array.isArray(currentUser.favorites)) {
		currentUser.favorites = [];
	}

	const favoriteIndex = currentUser.favorites.indexOf(storeId);
	if (favoriteIndex >= 0) {
		currentUser.favorites.splice(favoriteIndex, 1);
		saveUsers();
		return false;
	}

	currentUser.favorites.push(storeId);
	saveUsers();
	return true;
}

function isFavorite(storeId) {
	const currentUser = getFavoriteCurrentUser();
	return Boolean(currentUser)
		&& Array.isArray(currentUser.favorites)
		&& currentUser.favorites.includes(storeId);
}

