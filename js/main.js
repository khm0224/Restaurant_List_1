const categoryButtons = document.querySelectorAll('.category-btn');
const storeList = document.getElementById('store-list');

function renderStores(category) {
    const stores = window.restaurantData[category] || [];

    storeList.innerHTML = stores.map((store, index) => `
        <article class="store-card" data-category="${category}" data-index="${index}">
            <div class="store-top">
                <img src="${store.img}" alt="${store.name}" class="store-img">
                <div class="store-info">
                    <h3 class="store-name">${store.name}</h3>
                    <div class="store-meta">
                        <span>⭐ ${store.rating}</span>
                        <span>리뷰 ${store.reviewCount}</span>
                    </div>
                </div>
            </div>
            <div class="store-footer">
                <p class="store-address">${store.address}</p>
                <button class="nav-btn" type="button" title="길찾기">🧭 길찾기</button>
            </div>
        </article>
    `).join('');

    storeList.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = Number(card.dataset.index);
            const store = stores[index];
            sessionStorage.setItem('selectedRestaurant', JSON.stringify({ ...store, category, id: index }));
            window.location.href = 'restaurant_detail.html';
        });
    });

    // 지도 네비게이션 기능은 아직 미구현, 카드 이동만 막아둔다
    storeList.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
}

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.toggle('active', btn === button));
        renderStores(button.dataset.category);
    });
});

renderStores('한식');
