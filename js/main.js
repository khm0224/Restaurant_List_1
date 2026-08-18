const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');

// 선택한 식당을 저장한 뒤 상세 화면으로 이동합니다.
function openStoreDetail(category, index) {
    if (window.setSelectedRestaurant) {
        window.setSelectedRestaurant(category, index);
    }

    window.location.href = `restaurant_detail.html?category=${encodeURIComponent(category)}&id=${index}`;
}

// 선택 카테고리의 식당 카드를 만들고 이동 이벤트를 연결합니다.
function renderStores(category) {
    if (!storeList) {
        return;
    }

    const district = window.currentSelectedDistrict || '교동';
    const stores = window.restaurantData?.[district]?.[category] || [];

    storeList.innerHTML = stores.map((store, index) => `
        <article class="store-card" data-category="${category}" data-index="${index}" tabindex="0">
            <div class="store-main-row">
                <img src="${store.img}" alt="${store.name}" class="store-img">
                <div class="store-info">
                    <h3 class="store-name">${store.name}</h3>
                    <p class="store-address">${store.address}</p>
                    <div class="store-meta">
                        <span>⭐ ${store.rating}</span>
                        <span>리뷰 ${store.reviewCount}</span>
                    </div>
                </div>
                <button class="nav-btn route-btn" type="button" data-category="${category}" data-index="${index}">길찾기</button>
            </div>
        </article>
    `).join('');

    storeList.querySelectorAll('.route-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    storeList.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('.route-btn')) {
                return;
            }

            const targetCategory = card.dataset.category;
            const targetIndex = Number(card.dataset.index);
            openStoreDetail(targetCategory, targetIndex);
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const targetCategory = card.dataset.category;
                const targetIndex = Number(card.dataset.index);
                openStoreDetail(targetCategory, targetIndex);
            }
        });
    });
}
// 카테고리 버튼이 있는 화면에서 목록 전환을 초기화합니다.
if (categoryButtons.length && storeList) {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            renderStores(button.dataset.category);
        });
    });

    renderStores('한식');
}

const regionButtons = document.querySelectorAll('.region-item');

if (regionButtons.length) {
    regionButtons.forEach(button => {
        button.addEventListener('click', () => {
            regionButtons.forEach(btn => btn.classList.toggle('active', btn === button));

            const district = button.dataset.region;
            window.location.href = `./html/food_page.html?district=${encodeURIComponent(district)}`;
        });
    });
}

