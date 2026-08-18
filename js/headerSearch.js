// 공통 헤더 검색: 어느 페이지에서나 식당명/업종 검색 결과 화면으로 이동합니다.
(function () {
    // 스크립트 위치를 기준으로 URL을 만들면 페이지의 폴더 깊이와 관계없이 같은 경로를 사용합니다.
    const scriptUrl = document.currentScript?.src || window.location.href;
    const CUISINE_CATEGORIES = ['한식', '일식', '중식', '양식', '디저트'];

    // 탐색 및 상세 화면으로 이동할 URL에 검색 결과 파라미터를 추가합니다.
    function getPageUrl(pagePath, parameters = {}) {
        const url = new URL(pagePath, scriptUrl);

        Object.entries(parameters).forEach(([name, value]) => {
            url.searchParams.set(name, value);
        });

        return url.href;
    }

    // 모든 동네와 업종을 순회하며 정확히 일치하는 이름을 우선해 찾습니다.
    function findRestaurantByName(keyword) {
        const restaurantData = window.restaurantData || {};
        const entries = Object.entries(restaurantData).flatMap(([district, districtData]) =>
            Object.entries(districtData).flatMap(([category, stores]) =>
                stores.map((store, index) => ({ district, category, index, store }))
            )
        );

        return entries.find(entry => entry.store.name === keyword)
            || entries.find(entry => entry.store.name.includes(keyword))
            || null;
    }

    // 업종은 탐색 화면으로, 식당명은 상세 화면으로 이동시킵니다.
    function runHeaderSearch() {
        const input = document.querySelector('#header-root .search-box input');
        const keyword = input?.value.trim();

        if (!keyword) {
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
    document.addEventListener('click', event => {
        if (event.target.closest('#header-root .search-btn')) {
            runHeaderSearch();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target.matches('#header-root .search-box input')) {
            event.preventDefault();
            runHeaderSearch();
        }
    });
})();