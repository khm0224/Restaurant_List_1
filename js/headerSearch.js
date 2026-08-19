// 공통 헤더 검색: 어느 페이지에서나 식당명/업종 검색 결과 화면으로 이동합니다.
(function () {
    // 스크립트 위치를 기준으로 URL을 만들면 페이지의 폴더 깊이와 관계없이 같은 경로를 사용합니다.
    const scriptUrl = document.currentScript?.src || window.location.href;
    const CUISINE_CATEGORIES = ['한식', '일식', '중식', '양식', '디저트'];
    const DISTRICT_NAMES = ['소양동', '교동', '조운동', '약사명동', '근화동', '후평1동', '후평2동', '후평3동', '효자1동', '효자2동', '효자3동', '석사동', '퇴계동', '강남동', '신사우동'];
    const MAX_SUGGESTIONS = 8;

    // 탐색 및 상세 화면으로 이동할 URL에 검색 결과 파라미터를 추가합니다.
    function getPageUrl(pagePath, parameters = {}) {
        const url = new URL(pagePath, scriptUrl);

        Object.entries(parameters).forEach(([name, value]) => {
            url.searchParams.set(name, value);
        });

        return url.href;
    }

    // 모든 동네·업종의 식당을 하나의 평평한 배열로 펼칩니다.
    function getAllRestaurants() {
        const restaurantData = window.restaurantData || {};
        return Object.entries(restaurantData).flatMap(([district, districtData]) =>
            Object.entries(districtData).flatMap(([category, stores]) =>
                stores
                    .map((store, index) => ({ district, category, index, store }))
                    .filter(entry => entry.store?.name)
            )
        );
    }

    // 이름이 정확히 일치하는 식당을 우선하고, 없으면 부분 일치로 한 번 더 찾습니다.
    function findRestaurantByName(keyword) {
        const entries = getAllRestaurants();

        return entries.find(entry => entry.store.name === keyword)
            || entries.find(entry => entry.store.name.includes(keyword))
            || null;
    }

    // ===== 검색어 자동완성 드롭다운 =====

    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getSearchDropdown() {
        return document.querySelector('#header-root .search-dropdown');
    }

    function hideSearchDropdown() {
        const dropdown = getSearchDropdown();
        if (!dropdown) return;

        dropdown.hidden = true;
        dropdown.innerHTML = '';
    }

    // 입력할 때마다 이름에 검색어가 포함된 식당을 글자 단위로 다시 걸러 보여줍니다.
    function updateSearchDropdown(keyword) {
        const dropdown = getSearchDropdown();
        if (!dropdown) return;

        if (!keyword) {
            hideSearchDropdown();
            return;
        }

        const matches = getAllRestaurants()
            .filter(entry => entry.store.name.includes(keyword))
            .slice(0, MAX_SUGGESTIONS);

        if (matches.length === 0) {
            hideSearchDropdown();
            return;
        }

        dropdown.innerHTML = matches.map(entry => `
            <li>
                <button type="button" data-district="${escapeHtml(entry.district)}" data-category="${escapeHtml(entry.category)}" data-index="${entry.index}">
                    <span class="search-dropdown-name">${escapeHtml(entry.store.name)}</span>
                    <span class="search-dropdown-meta">${escapeHtml(entry.district)} · ${escapeHtml(entry.category)}</span>
                </button>
            </li>
        `).join('');
        dropdown.hidden = false;
    }

    // 업종은 탐색 화면으로, 식당명은 상세 화면으로 이동시킵니다.
    function runHeaderSearch() {
        const input = document.querySelector('#header-root .search-box input');
        const keyword = input?.value.trim();

        if (!keyword) {
            return;
        }

        if (DISTRICT_NAMES.includes(keyword)) {
            window.location.href = getPageUrl('../html/food_page.html', {
                district: keyword
            });
            return;
        }

        if (CUISINE_CATEGORIES.includes(keyword)) {
            window.location.href = getPageUrl('../html/food_page.html', {
                district: '전체',
                category: keyword
            });
            return;
        }

        const found = findRestaurantByName(keyword);
        if (found) {
            window.location.href = getPageUrl('../html/restaurant_detail.html', {
                district: found.district,
                category: found.category,
                id: found.index
            });
            return;
        }

        alert('검색 결과가 없습니다.');
    }

    // header.js가 헤더를 나중에 삽입하므로 document 이벤트 위임으로 검색 동작을 연결합니다.
    document.addEventListener('input', event => {
        if (event.target.matches('#header-root .search-box input')) {
            updateSearchDropdown(event.target.value.trim());
        }
    });

    document.addEventListener('click', event => {
        const suggestionButton = event.target.closest('.search-dropdown button');
        if (suggestionButton) {
            const { district, category, index } = suggestionButton.dataset;
            window.location.href = getPageUrl('../html/restaurant_detail.html', { district, category, id: index });
            return;
        }

        if (event.target.closest('#header-root .search-btn')) {
            hideSearchDropdown();
            runHeaderSearch();
            return;
        }

        // 검색창 바깥을 클릭하면 드롭다운을 닫습니다.
        if (!event.target.closest('#header-root .search-box')) {
            hideSearchDropdown();
        }
    });

    document.addEventListener('keydown', event => {
        if (!event.target.matches('#header-root .search-box input')) {
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            hideSearchDropdown();
            runHeaderSearch();
        } else if (event.key === 'Escape') {
            hideSearchDropdown();
        }
    });
})();