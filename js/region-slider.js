(function () {
    const slider = document.getElementById('regionSlider');
    if (!slider) return;

    const track = document.getElementById('regionTrack');
    const items = Array.from(track.querySelectorAll('.region-item'));
    const pagination = document.getElementById('regionPagination');
    const prevBtn = document.getElementById('regionPrev');
    const nextBtn = document.getElementById('regionNext');
    const visibleCount = 5;
    const total = items.length;
    const maxIndex = Math.max(0, total - visibleCount);

    let index = 0;

    for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}번째 지역 목록으로 이동`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        pagination.appendChild(dot);
    }
    const dots = pagination.querySelectorAll('button');

    function step() {
        if (!items.length) return 0;
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        return items[0].getBoundingClientRect().width + gap;
    }

    function update() {
        track.style.transform = `translateX(-${index * step()}px)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === maxIndex;
    }

    function goTo(newIndex) {
        index = Math.max(0, Math.min(maxIndex, newIndex));
        update();
    }

    function centerOn(itemIndex) {
        goTo(itemIndex - Math.floor(visibleCount / 2));
    }

    items.forEach((item, i) => {
        item.addEventListener('click', () => {
            items.forEach((el) => el.classList.remove('active'));
            item.classList.add('active');
            centerOn(i);
        });
    });

    nextBtn.addEventListener('click', () => goTo(index + 1));
    prevBtn.addEventListener('click', () => goTo(index - 1));
    window.addEventListener('resize', update);

    update();
})();
