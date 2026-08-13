(function () {
    const hero = document.getElementById('heroSlider');
    if (!hero) return;

    const track = document.getElementById('heroTrack');
    const realCards = Array.from(track.querySelectorAll('.hero-card'));
    const pagination = document.getElementById('heroPagination');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const total = realCards.length;

    // 앞뒤에 첫/마지막 카드 클론을 붙여 끊김 없이 회전하는 것처럼 보이게 함
    const firstClone = realCards[0].cloneNode(true);
    const lastClone = realCards[total - 1].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, realCards[0]);

    // slot 0 = 마지막 카드 클론, slot 1..total = 실제 카드, slot total+1 = 첫 카드 클론
    let slot = 1;
    let timer;
    let animating = false;

    realCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}번째 맛집으로 이동`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        pagination.appendChild(dot);
    });
    const dots = pagination.querySelectorAll('button');

    function update() {
        track.style.transform = `translateX(-${slot * 100}%)`;
        const realIndex = (slot - 1 + total) % total;
        dots.forEach((d, i) => d.classList.toggle('active', i === realIndex));
    }

    function goTo(index) {
        if (animating) return;
        const target = ((index % total) + total) % total + 1;
        if (target === slot) {
            resetTimer();
            return;
        }
        animating = true;
        slot = target;
        update();
        resetTimer();
    }

    function next() {
        if (animating) return;
        animating = true;
        slot += 1;
        update();
        resetTimer();
    }

    function prev() {
        if (animating) return;
        animating = true;
        slot -= 1;
        update();
        resetTimer();
    }

    // 클론 위치까지 슬라이드가 끝나면, 트랜지션 없이 실제 카드 위치로 순간 이동시켜
    // 계속 같은 방향으로 도는 것처럼 보이게 함
    track.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;
        if (slot === total + 1) {
            track.style.transition = 'none';
            slot = 1;
            track.style.transform = `translateX(-${slot * 100}%)`;
            track.offsetHeight; // reflow로 transition 재적용 강제
            track.style.transition = '';
        } else if (slot === 0) {
            track.style.transition = 'none';
            slot = total;
            track.style.transform = `translateX(-${slot * 100}%)`;
            track.offsetHeight;
            track.style.transition = '';
        }
        animating = false;
    });

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, 5000);
    }

    update();
    resetTimer();
})();