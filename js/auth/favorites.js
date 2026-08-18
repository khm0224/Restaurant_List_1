/**
 * favorites.js — 즐겨찾기 저장소
 *
 * 회원 객체 안(users[i].favorites)에 식당 키 배열로 보관.
 * 저장소를 아는 곳을 여기 하나로 모아 화면 스크립트가 users를 직접 만지지 않게 함.
 *
 * 의존: auth.js (getCurrentUser / saveUsers)
 * 공개: toggleFavorite / isFavorite / getFavoriteIds
 *
 * 한계: 비로그인 사용자는 쓸 수 없음. 회원 객체에 붙어 있어 로그인이 전제됨.
 *       별도 키로 두면 가능하지만, 지금은 로그인해야 쓰는 기능으로 정함.
 */


// favorites 필드가 없는 기존 가입자 대비.
// 없는 채로 push하면 TypeError라 읽는 쪽마다 확인이 필요해지므로 한 곳에서 보장.
function ensureFavorites(user) {
	if (!Array.isArray(user.favorites)) {
		user.favorites = [];
	}

	return user.favorites;
}

// 로그인 여부는 매번 조회. 변수에 잡아두면 로그아웃 후 다른 계정으로 로그인했을 때
// 옛 사람의 회원 객체를 고치게 됨.
function getFavoriteIds() {
	const user = getCurrentUser();

	// 복사본을 돌려줌 — 원본을 내주면 밖에서 push해도 저장이 안 돼 조용히 어긋남
	return user ? ensureFavorites(user).slice() : [];
}

function isFavorite(storeId) {
	const user = getCurrentUser();

	return Boolean(user) && ensureFavorites(user).includes(storeId);
}

// 반환값: true(추가됨) / false(해제됨) / null(비로그인 또는 저장 실패)
// null일 때 로그인 유도를 여기서 하지 않음 —
// 저장소는 저장만 하고, 화면을 어떻게 안내할지는 부르는 쪽이 정함.
function toggleFavorite(storeId) {
	const user = getCurrentUser();

	if (!user) return null;

	const favorites = ensureFavorites(user);
	const index = favorites.indexOf(storeId);
	const added = index < 0;

	if (added) {
		favorites.push(storeId);
	} else {
		favorites.splice(index, 1);
	}

	// users에는 프로필 사진(Base64)도 들어 있어 용량 한도에 걸릴 수 있음.
	// 실패하면 메모리만 바뀐 상태라 화면과 저장소가 어긋남 — 되돌림.
	if (!saveUsers()) {
		if (added) {
			favorites.pop();
		} else {
			favorites.splice(index, 0, storeId);
		}

		return null;
	}

	return added;
}
