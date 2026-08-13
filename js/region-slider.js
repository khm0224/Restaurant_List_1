(function () {
    const slider = document.getElementById('regionSlider');
    if (!slider) return;

    const track = document.getElementById('regionTrack');
    const slides = Array.from(track.querySelectorAll('.region-slide'));
    const pagination = document.getElementById('regionPagination');
    const prevBtn = document.getElementById('regionPrev');
    const nextBtn = document.getElementById('regionNext');
    const total = slides.length;

    let page = 0;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}번째 지역 목록으로 이동`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        pagination.appendChild(dot);
    });
    const dots = pagination.querySelectorAll('button');

    function update() {
        track.style.transform = `translateX(-${page * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === page));
        prevBtn.disabled = page === 0;
        nextBtn.disabled = page === total - 1;
    }

    function goTo(index) {
        page = Math.max(0, Math.min(total - 1, index));
        update();
    }

    nextBtn.addEventListener('click', () => goTo(page + 1));
    prevBtn.addEventListener('click', () => goTo(page - 1));

    update();
})();
